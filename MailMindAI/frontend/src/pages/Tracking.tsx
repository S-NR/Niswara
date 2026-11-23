import { useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtDate, qs } from "../api";
import { EmailDrawer } from "../components/EmailList";
import { ErrorBox, GmailLink, StatusBadge, useLoad } from "../components/common";
import type { ActionItem, ThreadSummary } from "../types";

export function ActionsPage({ refreshKey }: { refreshKey: number }) {
  const [status, setStatus] = useState("open");
  const [source, setSource] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { data, error, reload } = useLoad(() => api<ActionItem[]>(`/actions${qs({ status, source })}`), [status, source, refreshKey]);
  const update = async (id: number, s: string) => {
    try {
      await api(`/actions/${id}`, { method: "PATCH", json: { status: s } });
      reload();
    } catch (e) {
      setErr(String((e as Error).message));
    }
  };
  const now = Date.now();
  return (
    <>
      <h1>Action Tracker</h1>
      <p className="muted small">
        Actions detected locally from your email, plus actions extracted by Claude analyses (source “ai”). Changing a status here only updates MailMind; nothing is sent to Gmail.
      </p>
      <div className="filters">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">open</option>
            <option value="done">done</option>
            <option value="dismissed">dismissed</option>
            <option value="all">all</option>
          </select>
        </label>
        <label>
          Source
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">any</option>
            <option value="local">local rules</option>
            <option value="ai">Claude analysis</option>
          </select>
        </label>
      </div>
      <ErrorBox error={error || err} />
      <div className="card" style={{ overflowX: "auto" }}>
        {data && data.length === 0 && <p className="muted">No actions.</p>}
        {data && data.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Due</th>
                <th>Type</th>
                <th>From email</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => {
                const overdue = a.status === "open" && a.due_date && new Date(a.due_date).getTime() < now;
                return (
                  <tr key={a.id}>
                    <td>
                      {a.description}
                      <div className="muted small">
                        {a.source === "ai" ? `Claude analysis #${a.ai_analysis_id}` : "local rules"} · confidence {Math.round(a.confidence * 100)}%
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {a.due_date ? fmtDate(a.due_date, false) : "—"} {overdue && <span className="badge st-high">overdue</span>}
                    </td>
                    <td>
                      <span className="badge">{a.action_type}</span>
                    </td>
                    <td className="small">
                      {a.email && (
                        <>
                          <a href="#" onClick={(e) => (e.preventDefault(), a.email_id && setOpen(a.email_id))}>
                            {a.email.subject}
                          </a>
                          <div className="muted">{a.email.from_addr}</div>
                          <GmailLink url={a.email.gmail_url} label="Gmail" />
                        </>
                      )}
                    </td>
                    <td>
                      <span className="badge">{a.status}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {a.status !== "done" && <button onClick={() => update(a.id, "done")}>✓ Done</button>}{" "}
                      {a.status !== "dismissed" && <button onClick={() => update(a.id, "dismissed")}>Dismiss</button>}{" "}
                      {a.status !== "open" && <button onClick={() => update(a.id, "open")}>Reopen</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </>
  );
}

interface Followup {
  id: number;
  kind: string;
  since: string;
  due_at: string | null;
  status: string;
  thread: ThreadSummary | null;
  last_email: { id: number; subject: string | null; from_addr: string | null; snippet: string | null; gmail_url: string } | null;
}

export function FollowupsPage({ refreshKey }: { refreshKey: number }) {
  const [status, setStatus] = useState("open");
  const [open, setOpen] = useState<number | null>(null);
  const { data, error, reload } = useLoad(() => api<Followup[]>(`/followups${qs({ status })}`), [status, refreshKey]);
  const update = async (id: number, s: string) => {
    await api(`/followups/${id}`, { method: "PATCH", json: { status: s } });
    reload();
  };
  const now = Date.now();
  const section = (kind: string, title: string, hint: string) => {
    const items = (data ?? []).filter((f) => f.kind === kind);
    return (
      <div className="card">
        <h2>
          {title} <span className="muted">({items.length})</span>
        </h2>
        <p className="muted small">{hint}</p>
        {items.length === 0 ? (
          <p className="muted small">Nothing here.</p>
        ) : (
          <table className="small">
            <tbody>
              {items.map((f) => {
                const overdue = f.status === "open" && f.due_at && new Date(f.due_at).getTime() < now;
                return (
                  <tr key={f.id}>
                    <td>
                      <a href="#" onClick={(e) => (e.preventDefault(), f.last_email && setOpen(f.last_email.id))}>
                        {f.thread?.subject || "(no subject)"}
                      </a>
                      <div className="muted">{f.last_email?.snippet?.slice(0, 100)}</div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      since {fmtDate(f.since, false)}
                      <br />
                      {overdue ? <span className="badge st-high">overdue</span> : f.due_at && <span className="muted">follow up {fmtDate(f.due_at, false)}</span>}
                    </td>
                    <td>{f.thread && <StatusBadge status={f.thread.status} />}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {f.last_email && <GmailLink url={f.last_email.gmail_url} label="Gmail" />}{" "}
                      {f.thread && <Link to={`/claude?thread=${f.thread.id}`}>Claude</Link>}{" "}
                      {f.status === "open" ? (
                        <>
                          <button onClick={() => update(f.id, "resolved")}>Resolved</button> <button onClick={() => update(f.id, "dismissed")}>Dismiss</button>
                        </>
                      ) : (
                        <button onClick={() => update(f.id, "open")}>Reopen</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };
  return (
    <>
      <h1>Follow-ups</h1>
      <div className="filters">
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">open</option>
            <option value="resolved">resolved</option>
            <option value="dismissed">dismissed</option>
            <option value="all">all</option>
          </select>
        </label>
      </div>
      <ErrorBox error={error} />
      {section("needs_reply", "You owe a reply", "The latest message is from someone else and asks you something.")}
      {section("awaiting_reply", "Waiting on others", "Your latest message asked something and nobody has answered yet.")}
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
