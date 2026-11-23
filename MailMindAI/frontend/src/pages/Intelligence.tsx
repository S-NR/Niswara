import { useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtDate } from "../api";
import { EmailBrowser, EmailDrawer } from "../components/EmailList";
import { ErrorBox, GmailLink, StatusBadge, useLoad } from "../components/common";
import type { ThreadSummary } from "../types";

interface Intel {
  domain: string;
  needs_reply: ThreadSummary[];
  awaiting_reply: ThreadSummary[];
  action_later: ThreadSummary[];
  recent_informational: ThreadSummary[];
  completed: ThreadSummary[];
  projects: { name: string; count: number }[];
  people: { email: string; name: string | null; relationship: string; count: number }[];
}

function ThreadList({ title, items, onOpen, empty }: { title: string; items: ThreadSummary[]; onOpen: (id: number) => void; empty: string }) {
  return (
    <div className="card">
      <h2>
        {title} <span className="muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="muted small">{empty}</p>
      ) : (
        <table className="small">
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td style={{ width: "45%" }}>
                  <a href="#" onClick={(e) => (e.preventDefault(), t.last_email && onOpen(t.last_email.id))}>
                    {t.subject || "(no subject)"}
                  </a>
                  <div className="muted">{t.status_reason}</div>
                </td>
                <td>{t.last_email?.from_name || t.last_email?.from_addr}</td>
                <td style={{ whiteSpace: "nowrap" }}>{fmtDate(t.last_date)}</td>
                <td>
                  <StatusBadge status={t.status} />
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <GmailLink url={t.gmail_url} label="Gmail" /> · <Link to={`/claude?thread=${t.id}`}>Claude</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function IntelligencePage({ domain, refreshKey }: { domain: "work" | "personal"; refreshKey: number }) {
  const { data, error } = useLoad(() => api<Intel>(`/intelligence/${domain}`), [domain, refreshKey]);
  const [open, setOpen] = useState<number | null>(null);
  return (
    <>
      <h1>{domain === "work" ? "Work Intelligence" : "Personal Intelligence"}</h1>
      <ErrorBox error={error} />
      {data && (
        <>
          <div className="grid two">
            <ThreadList title="Needs your reply" items={data.needs_reply} onOpen={setOpen} empty="Nothing waiting on you." />
            <ThreadList title="Awaiting someone else" items={data.awaiting_reply} onOpen={setOpen} empty="You are not waiting on anyone." />
            <ThreadList title="Actions for later" items={data.action_later} onOpen={setOpen} empty="No deferred actions." />
            <div className="card">
              {domain === "work" && (
                <>
                  <h2>Projects</h2>
                  {data.projects.length === 0 ? (
                    <p className="muted small">
                      No project keywords configured. Add them in <Link to="/settings">Settings → Rules</Link>.
                    </p>
                  ) : (
                    <ul className="items">
                      {data.projects.map((p) => (
                        <li key={p.name}>
                          <Link to={`/emails?project=${encodeURIComponent(p.name)}`}>{p.name}</Link> — {p.count} email(s)
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
              <h2>{domain === "work" ? "Key people" : "People"}</h2>
              <table className="small">
                <tbody>
                  {data.people.map((p) => (
                    <tr key={p.email}>
                      <td>{p.name || p.email}</td>
                      <td>
                        <span className="badge">{p.relationship}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ThreadList title="Recently completed" items={data.completed} onOpen={setOpen} empty="—" />
        </>
      )}
      <h2>All {domain} email</h2>
      <EmailBrowser initial={{ domain }} lockDomain />
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
