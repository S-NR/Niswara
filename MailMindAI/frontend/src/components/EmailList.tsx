import { useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtDate, qs } from "../api";
import type { EmailDetail, EmailSummary } from "../types";
import { Categories, ErrorBox, GmailLink, ImportanceBadge, StatusBadge, useLoad } from "./common";

export interface EmailFilters {
  date_from?: string;
  date_to?: string;
  sender?: string;
  category?: string;
  importance?: string;
  status?: string;
  domain?: string;
  project?: string;
}

const CATEGORIES = ["manager", "client", "action_request", "project", "meeting", "work", "personal", "notification", "newsletter", "promotion", "suspicious", "other"];

export function FilterBar({ value, onChange, lockDomain }: { value: EmailFilters; onChange: (f: EmailFilters) => void; lockDomain?: boolean }) {
  const set = (k: keyof EmailFilters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value || undefined });
  return (
    <div className="filters">
      <label>
        From date
        <input type="date" value={value.date_from ?? ""} onChange={set("date_from")} />
      </label>
      <label>
        To date
        <input type="date" value={value.date_to ?? ""} onChange={set("date_to")} />
      </label>
      <label>
        Sender
        <input placeholder="name or address" value={value.sender ?? ""} onChange={set("sender")} />
      </label>
      <label>
        Category
        <select value={value.category ?? ""} onChange={set("category")}>
          <option value="">any</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Importance
        <select value={value.importance ?? ""} onChange={set("importance")}>
          <option value="">any</option>
          <option>high</option>
          <option>medium</option>
          <option>low</option>
        </select>
      </label>
      <label>
        Status
        <select value={value.status ?? ""} onChange={set("status")}>
          <option value="">any</option>
          <option value="needs_reply">needs reply</option>
          <option value="awaiting_reply">awaiting reply</option>
          <option value="action_later">action for later</option>
          <option value="informational">informational</option>
          <option value="completed">completed</option>
        </select>
      </label>
      {!lockDomain && (
        <label>
          Area
          <select value={value.domain ?? ""} onChange={set("domain")}>
            <option value="">any</option>
            <option value="work">work</option>
            <option value="personal">personal</option>
          </select>
        </label>
      )}
      <button onClick={() => onChange(lockDomain ? { domain: value.domain } : {})}>Clear</button>
    </div>
  );
}

export function EmailDrawer({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: e, error } = useLoad(() => api<EmailDetail>(`/emails/${id}`), [id]);
  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Email detail">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <button onClick={onClose}>✕ Close</button>
          {e && <GmailLink url={e.gmail_url} label="Open original in Gmail" />}
        </div>
        <ErrorBox error={error} />
        {e && (
          <>
            <h1 style={{ marginTop: 12 }}>{e.subject || "(no subject)"}</h1>
            <div className="small">
              <b>From:</b> {e.from_name} &lt;{e.from_addr}&gt; <span className="badge">{e.relationship}</span>
              <br />
              <b>To:</b> {e.to_addrs.join(", ")}
              {e.cc_addrs.length > 0 && (
                <>
                  <br />
                  <b>Cc:</b> {e.cc_addrs.join(", ")}
                </>
              )}
              <br />
              <b>Date:</b> {fmtDate(e.date)}
            </div>
            <p>
              <ImportanceBadge c={e.classification} /> {e.classification && <StatusBadge status={e.classification.response_state} />}
              <Categories c={e.classification} />
              {e.is_unread && <span className="badge">unread</span>}
            </p>
            {e.reasons.length > 0 && (
              <details>
                <summary className="small">Why was it classified this way?</summary>
                <ul className="small">
                  {e.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </details>
            )}
            {e.actions && e.actions.length > 0 && (
              <>
                <h3>Detected actions</h3>
                <ul className="items">
                  {e.actions.map((a) => (
                    <li key={a.id}>
                      {a.description} {a.due_date && <span className="muted">(due {fmtDate(a.due_date, false)})</span>} <span className="badge">{a.status}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {e.attachments.length > 0 && (
              <p className="small">
                📎 {e.attachments.map((a) => `${a.filename} (${Math.round(a.size / 1024)} KB)`).join(", ")} — not downloaded
              </p>
            )}
            <h3>Message (plain text, untrusted content)</h3>
            {e.body_purged && <p className="muted small">The cached body was removed by your retention policy. Open it in Gmail.</p>}
            <pre className="body">{e.body_text || e.snippet || ""}</pre>
            {e.thread && (
              <p className="small">
                Conversation: {e.thread.message_count} message(s), <StatusBadge status={e.thread.status} /> <span className="muted">{e.thread.status_reason}</span>
                <br />
                <Link to={`/claude?thread=${e.thread.id}`}>Analyse this conversation with Claude…</Link>
              </p>
            )}
          </>
        )}
      </aside>
    </>
  );
}

export function EmailTable({ items, onOpen }: { items: EmailSummary[]; onOpen: (id: number) => void }) {
  if (!items.length) return <p className="muted">No emails match.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>From</th>
            <th>Subject</th>
            <th>Importance</th>
            <th>Status</th>
            <th>Labels</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id} className="clickable" onClick={() => onOpen(e.id)}>
              <td className="small" style={{ whiteSpace: "nowrap" }}>{fmtDate(e.date)}</td>
              <td>
                {e.is_from_me ? <span className="muted">me →</span> : e.from_name || e.from_addr}
              </td>
              <td>
                <span style={{ fontWeight: e.is_unread ? 650 : 400 }}>{e.subject || "(no subject)"}</span>
                <div className="muted small">{e.snippet?.slice(0, 120)}</div>
              </td>
              <td>
                <ImportanceBadge c={e.classification} />
              </td>
              <td>{e.classification && <StatusBadge status={e.classification.response_state} />}</td>
              <td>
                <Categories c={e.classification} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmailBrowser({ initial = {}, lockDomain }: { initial?: EmailFilters; lockDomain?: boolean }) {
  const [filters, setFilters] = useState<EmailFilters>(initial);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<number | null>(null);
  const { data, error, loading } = useLoad(
    () => api<{ total: number; items: EmailSummary[] }>(`/emails${qs({ ...filters, page, page_size: 50 })}`),
    [JSON.stringify(filters), page],
  );
  const pages = data ? Math.max(1, Math.ceil(data.total / 50)) : 1;
  return (
    <div className="card">
      <FilterBar value={filters} onChange={(f) => (setFilters(f), setPage(1))} lockDomain={lockDomain} />
      <ErrorBox error={error} />
      <div className="muted small" style={{ marginBottom: 6 }}>
        {loading ? "Loading…" : `${data?.total ?? 0} email(s)`}
      </div>
      {data && <EmailTable items={data.items} onOpen={setOpen} />}
      {pages > 1 && (
        <div className="row" style={{ marginTop: 10 }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Prev
          </button>
          <span className="small">
            Page {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Next →
          </button>
        </div>
      )}
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
