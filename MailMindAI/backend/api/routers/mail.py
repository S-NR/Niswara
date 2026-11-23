"""Read endpoints: overview stats, emails, threads, intelligence views, search."""
from __future__ import annotations

import re
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String, and_, cast, func, or_, select, text
from sqlalchemy.orm import Session, selectinload

from backend.api.deps import email_detail, email_summary, get_db, iso, thread_summary
from backend.db import models as m
from backend.db.models import utcnow
from backend.db.repo import get_sync_state

router = APIRouter()


@router.get("/stats/overview")
def overview(db: Session = Depends(get_db)):
    count = lambda q: db.scalar(q) or 0  # noqa: E731
    total = count(select(func.count(m.Email.id)))
    by_cat = dict(db.execute(select(m.Classification.primary_category, func.count()).group_by(m.Classification.primary_category)).all())
    by_imp = dict(db.execute(select(m.Classification.importance_level, func.count()).group_by(m.Classification.importance_level)).all())
    by_status = dict(db.execute(select(m.Thread.status, func.count()).group_by(m.Thread.status)).all())
    since = utcnow() - timedelta(days=30)
    day = func.date(m.Email.internal_date)
    per_day = [{"date": d, "count": n} for d, n in db.execute(
        select(day, func.count()).where(m.Email.internal_date >= since).group_by(day).order_by(day)).all()]
    top = db.execute(select(m.Sender).order_by(m.Sender.message_count.desc()).limit(8)).scalars().all()
    st = get_sync_state(db)
    last_run = db.scalars(select(m.SyncRun).order_by(m.SyncRun.id.desc()).limit(1)).first()
    return {
        "emails_total": total,
        "threads_total": count(select(func.count(m.Thread.id))),
        "unread": count(select(func.count(m.Email.id)).where(m.Email.is_unread.is_(True))),
        "senders_total": count(select(func.count(m.Sender.id))),
        "needs_reply": by_status.get("needs_reply", 0),
        "awaiting_reply": by_status.get("awaiting_reply", 0),
        "action_later": by_status.get("action_later", 0),
        "completed": by_status.get("completed", 0),
        "open_actions": count(select(func.count(m.Action.id)).where(m.Action.status == "open")),
        "overdue_actions": count(select(func.count(m.Action.id)).where(m.Action.status == "open", m.Action.due_date < utcnow())),
        "open_followups": count(select(func.count(m.Followup.id)).where(m.Followup.status == "open")),
        "overdue_followups": count(select(func.count(m.Followup.id)).where(m.Followup.status == "open", m.Followup.due_at < utcnow())),
        "pending_cleanup": count(select(func.count(m.CleanupRecommendation.id)).where(m.CleanupRecommendation.status == "pending")),
        "ai_analyses": count(select(func.count(m.AIAnalysis.id))),
        "by_category": by_cat, "by_importance": by_imp, "by_thread_status": by_status,
        "per_day": per_day,
        "top_senders": [{"email": s.email, "name": s.name, "count": s.message_count, "relationship": s.relationship_type} for s in top],
        "sync": {"account": st.account_email, "status": st.status, "last_full_sync_at": iso(st.last_full_sync_at),
                 "last_incremental_at": iso(st.last_incremental_at),
                 "last_run": None if not last_run else {"id": last_run.id, "kind": last_run.kind, "status": last_run.status,
                                                        "finished_at": iso(last_run.finished_at), "error": last_run.error_message}},
    }


def _esc(v: str) -> str:
    """Escape LIKE wildcards in user input."""
    return v.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def _parse_date(v: str | None) -> datetime | None:
    if not v:
        return None
    try:
        return datetime.fromisoformat(v.replace("Z", ""))
    except ValueError as exc:
        raise HTTPException(422, f"invalid date {v!r}") from exc


@router.get("/emails")
def list_emails(
    db: Session = Depends(get_db),
    sender: str | None = None,
    category: str | None = None,
    importance: str | None = Query(None, pattern="^(high|medium|low)$"),
    status: str | None = Query(None, pattern="^(needs_reply|awaiting_reply|action_later|informational|completed)$"),
    domain: str | None = Query(None, pattern="^(work|personal)$"),
    project: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    unread: bool | None = None,
    include_duplicates: bool = True,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    q = select(m.Email).outerjoin(m.Classification, m.Classification.email_id == m.Email.id)
    conds = []
    if sender:
        like = f"%{_esc(sender.lower())}%"
        conds.append(or_(m.Email.from_addr.like(like, escape="\\"), func.lower(m.Email.from_name).like(like, escape="\\")))
    if category:
        conds.append(cast(m.Classification.categories, String).like(f'%"{_esc(category)}"%', escape="\\"))
    if importance:
        conds.append(m.Classification.importance_level == importance)
    if status:
        conds.append(m.Classification.response_state == status)
    if domain:
        conds.append(m.Classification.domain == domain)
    if project:
        conds.append(cast(m.Classification.projects, String).like(f'%"{_esc(project)}"%', escape="\\"))
    if (d := _parse_date(date_from)) is not None:
        conds.append(m.Email.internal_date >= d)
    if (d := _parse_date(date_to)) is not None:
        conds.append(m.Email.internal_date < d + timedelta(days=1))
    if unread is not None:
        conds.append(m.Email.is_unread.is_(unread))
    if not include_duplicates:
        conds.append(or_(m.Classification.is_duplicate.is_(False), m.Classification.id.is_(None)))
    if conds:
        q = q.where(and_(*conds))
    total = db.scalar(select(func.count()).select_from(q.subquery()))
    rows = db.scalars(q.options(selectinload(m.Email.classification), selectinload(m.Email.sender))
                      .order_by(m.Email.internal_date.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"total": total, "page": page, "page_size": page_size, "items": [email_summary(e) for e in rows]}


@router.get("/emails/{email_id}")
def get_email(email_id: int, db: Session = Depends(get_db)):
    e = db.get(m.Email, email_id)
    if e is None:
        raise HTTPException(404, "email not found")
    d = email_detail(e)
    d["actions"] = [{"id": a.id, "description": a.description, "status": a.status, "due_date": iso(a.due_date)}
                    for a in db.scalars(select(m.Action).where(m.Action.email_id == e.id))]
    return d


@router.get("/threads/{thread_id}")
def get_thread(thread_id: int, db: Session = Depends(get_db)):
    t = db.get(m.Thread, thread_id)
    if t is None:
        raise HTTPException(404, "thread not found")
    return {**thread_summary(t), "emails": [email_detail(e) | {"thread": None} for e in t.emails]}


@router.get("/threads")
def list_threads(db: Session = Depends(get_db), status: str | None = None, domain: str | None = None,
                 limit: int = Query(100, le=500)):
    q = select(m.Thread).order_by(m.Thread.last_date.desc()).limit(limit)
    if status:
        q = q.where(m.Thread.status == status)
    threads = db.scalars(q).all()
    out = []
    for t in threads:
        last = t.emails[-1] if t.emails else None
        c = last.classification if last else None
        if domain and (c is None or c.domain != domain):
            continue
        out.append(thread_summary(t) | {"last_email": email_summary(last) if last else None})
    return out


@router.get("/intelligence/{domain}")
def intelligence(domain: str, db: Session = Depends(get_db)):
    if domain not in {"work", "personal"}:
        raise HTTPException(404)
    threads = list_threads(db=db, domain=domain, limit=500)
    by_status: dict[str, list] = {}
    for t in threads:
        by_status.setdefault(t["status"], []).append(t)
    projects: dict[str, int] = {}
    for (plist,) in db.execute(select(m.Classification.projects).where(m.Classification.domain == domain)):
        for p in plist or []:
            projects[p] = projects.get(p, 0) + 1
    people = db.execute(
        select(m.Sender.email, m.Sender.name, m.Sender.relationship_type, m.Sender.message_count)
        .where(m.Sender.relationship_type.in_(
            ["manager", "client", "trusted", "colleague"] if domain == "work" else ["personal", "unknown"]))
        .order_by(m.Sender.message_count.desc()).limit(15)
    ).all()
    return {
        "domain": domain,
        "needs_reply": by_status.get("needs_reply", []),
        "awaiting_reply": by_status.get("awaiting_reply", []),
        "action_later": by_status.get("action_later", []),
        "recent_informational": by_status.get("informational", [])[:20],
        "completed": by_status.get("completed", [])[:20],
        "projects": [{"name": k, "count": v} for k, v in sorted(projects.items(), key=lambda kv: -kv[1])],
        "people": [{"email": e, "name": n, "relationship": r, "count": c} for e, n, r, c in people],
    }


_FTS_TOKEN = re.compile(r"[\w@.\-]+", re.UNICODE)


def fts_query(q: str) -> str:
    """Turn free text into a safe FTS5 query: quoted tokens, AND-ed, last token prefix-matched."""
    toks = _FTS_TOKEN.findall(q)[:12]
    if not toks:
        return ""
    parts = ['"' + t.replace('"', "") + '"' for t in toks]
    parts[-1] += "*"
    return " AND ".join(parts)


@router.get("/search")
def search(q: str = Query(..., min_length=1, max_length=200), limit: int = Query(30, le=100), db: Session = Depends(get_db)):
    expr = fts_query(q)
    if not expr:
        return {"query": q, "items": []}
    rows = db.execute(text(
        "SELECT rowid, snippet(emails_fts, -1, '[[', ']]', ' … ', 18) AS body_snip, bm25(emails_fts) AS rank "
        "FROM emails_fts WHERE emails_fts MATCH :q ORDER BY rank LIMIT :lim"), {"q": expr, "lim": limit}).all()
    items = []
    for rowid, snip, rank in rows:
        e = db.get(m.Email, rowid)
        if e:
            items.append(email_summary(e) | {"match": snip, "rank": rank})
    return {"query": q, "items": items}
