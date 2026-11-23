"""Phase 4: local classification engine against the synthetic dataset."""
from __future__ import annotations

from datetime import datetime

import pytest
from sqlalchemy import select

from backend.db import models as m
from backend.db.session import session_factory
from backend.intelligence.actions import extract_actions, parse_deadline
from backend.intelligence.pipeline import analyse_all
from backend.intelligence.rules import RuleSet, validate_pattern
from backend.sample_data import load


@pytest.fixture()
def loaded(db_url):
    res = load(db_url)
    assert res["status"] == "completed"
    s = session_factory(db_url)()
    yield s
    s.close()


def email(s, gid) -> m.Email:
    return s.scalar(select(m.Email).where(m.Email.gmail_id == gid))


def thread(s, tid) -> m.Thread:
    return s.scalar(select(m.Thread).where(m.Thread.gmail_thread_id == tid))


# ---------------------------------------------------------------- identification
def test_manager_identification(loaded):
    e = email(loaded, "m001")
    assert e.sender.relationship_type == "manager" and e.sender.is_trusted
    assert {"manager", "work", "project", "action_request"} <= set(e.classification.categories)
    assert e.classification.primary_category == "manager"
    assert e.classification.confidence >= 0.85


def test_client_identification_by_domain(loaded):
    e = email(loaded, "m003")
    assert e.sender.relationship_type == "client"
    assert "client" in e.classification.categories


def test_unknown_sender_low_confidence(loaded):
    c = email(loaded, "m016").classification
    assert c.confidence < 0.7


# ---------------------------------------------------------------- categorisation
def test_newsletter_detection_and_frequency(loaded):
    e = email(loaded, "m006")
    assert e.classification.primary_category == "newsletter"
    assert e.sender.is_newsletter and e.sender.message_count == 4
    assert e.sender.per_week >= 1.0
    assert e.classification.importance_level == "low"


def test_promotion(loaded):
    assert email(loaded, "m010").classification.primary_category == "promotion"


def test_personal_domain(loaded):
    c = email(loaded, "m012").classification
    assert c.domain == "personal" and "personal" in c.categories


def test_automated_notification(loaded):
    c = email(loaded, "m013").classification
    assert c.primary_category == "notification"
    assert loaded.scalars(select(m.Action).where(m.Action.email_id == email(loaded, "m013").id)).all() == []


def test_suspicious_email_is_flagged_and_inert(loaded):
    e = email(loaded, "m016")
    assert e.classification.primary_category == "suspicious"
    assert e.classification.importance <= 15
    assert loaded.scalars(select(m.Action).where(m.Action.email_id == e.id)).all() == []
    assert thread(loaded, "t014").status == "informational"


def test_project_keywords_multilabel(loaded):
    c = email(loaded, "m017").classification
    assert c.projects == ["Turbine Retrofit"]
    assert {"manager", "project", "work"} <= set(c.categories)


# ---------------------------------------------------------------- priority
def test_priority_ordering(loaded):
    imp = {g: email(loaded, g).classification.importance for g in ("m001", "m014", "m006", "m010")}
    assert imp["m001"] > imp["m014"] > imp["m006"] >= imp["m010"]
    assert email(loaded, "m001").classification.importance_level == "high"


# ---------------------------------------------------------------- duplicates
def test_duplicate_detection(loaded):
    c15 = email(loaded, "m015").classification
    assert c15.is_duplicate and c15.duplicate_of_id == email(loaded, "m014").id
    assert not email(loaded, "m014").classification.is_duplicate
    assert loaded.scalars(select(m.Action).where(m.Action.email_id == email(loaded, "m015").id)).all() == []


# ---------------------------------------------------------------- actions
def test_action_extraction_with_deadline(loaded):
    e = email(loaded, "m001")
    acts = loaded.scalars(select(m.Action).where(m.Action.email_id == e.id)).all()
    budget = next(a for a in acts if "budget report" in a.description)
    assert budget.due_date is not None and budget.due_date.weekday() == 4  # Friday
    assert budget.owner == "me" and budget.status == "open"


def test_action_item_assigned_to_me(loaded):
    acts = loaded.scalars(select(m.Action).where(m.Action.email_id == email(loaded, "m014").id)).all()
    assert len(acts) == 1 and "update the architecture document" in acts[0].description
    assert acts[0].due_date.weekday() == 2  # Wednesday


def test_unit_deadline_parsing():
    ref = datetime(2026, 3, 4, 10)  # Wednesday
    assert parse_deadline("by Friday", ref).date() == datetime(2026, 3, 6).date()
    assert parse_deadline("before Monday", ref).date() == datetime(2026, 3, 9).date()
    assert parse_deadline("tomorrow please", ref).date() == datetime(2026, 3, 5).date()
    assert parse_deadline("due 14 March", ref).date() == datetime(2026, 3, 14).date()
    assert parse_deadline("by January 3rd", ref).date() == datetime(2027, 1, 3).date()
    assert parse_deadline("no date here", ref) is None


def test_quoted_reply_text_ignored():
    body = "Thanks, done.\n\nOn Mon, 2 Mar 2026 Priya wrote:\n> Can you send the report by Friday?"
    assert extract_actions(body, datetime(2026, 3, 4)) == []


# ---------------------------------------------------------------- conversation states
def test_needs_reply_independent_of_unread(loaded):
    e = email(loaded, "m001")
    assert not e.is_unread
    assert thread(loaded, "t001").status == "needs_reply"
    assert e.classification.response_state == "needs_reply"


def test_unread_newsletter_is_not_pending(loaded):
    e = email(loaded, "m006")
    assert e.is_unread and thread(loaded, "t004").status == "informational"


def test_awaiting_reply(loaded):
    t = thread(loaded, "t002")
    assert t.status == "awaiting_reply"
    fu = loaded.scalar(select(m.Followup).where(m.Followup.thread_id == t.id))
    assert fu.kind == "awaiting_reply" and fu.status == "open"


def test_completed_conversation(loaded):
    t = thread(loaded, "t003")
    assert t.status == "completed"
    assert all(a.status == "done" for a in loaded.scalars(select(m.Action).where(m.Action.thread_id == t.id)))
    assert email(loaded, "m003").classification.response_state == "completed"


def test_action_for_later(loaded):
    assert thread(loaded, "t012").status == "action_later"


def test_personal_needs_reply_followup(loaded):
    t = thread(loaded, "t010")
    assert t.status == "needs_reply"
    assert loaded.scalar(select(m.Followup).where(m.Followup.thread_id == t.id, m.Followup.kind == "needs_reply"))


# ---------------------------------------------------------------- configurable rules
def test_rules_are_configurable_and_reanalysis_applies(loaded):
    e = email(loaded, "m014")
    assert e.sender.relationship_type == "trusted"
    loaded.add(m.UserRule(rule_type="manager", pattern="sam.rivera@example.com"))
    loaded.commit()
    analyse_all(loaded)
    loaded.commit()
    assert email(loaded, "m014").sender.relationship_type == "manager"


def test_user_status_change_preserved_on_reanalysis(loaded):
    a = loaded.scalar(select(m.Action).where(m.Action.email_id == email(loaded, "m014").id))
    a.status = "dismissed"
    loaded.commit()
    analyse_all(loaded)
    loaded.commit()
    assert loaded.get(m.Action, a.id).status == "dismissed"


def test_pattern_validation():
    assert validate_pattern("client", " @ClientCo.Example ") == "@clientco.example"
    with pytest.raises(ValueError):
        validate_pattern("manager", "not-an-address")
    with pytest.raises(ValueError):
        validate_pattern("bogus", "x@y.z")


def test_domain_rule_matches_subdomains():
    rs = RuleSet(clients=[("@clientco.example", "ClientCo")])
    assert rs.client_label("a@eu.clientco.example") == "ClientCo"
    assert rs.client_label("a@notclientco.example") is None


def test_sync_does_not_create_ai_requests(loaded):
    assert loaded.scalars(select(m.AIAnalysis)).all() == []
