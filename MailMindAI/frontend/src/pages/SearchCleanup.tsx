import { useState } from "react";
import { DeleteListPanel } from "../components/DeleteList";
import { api, fmtDate, qs } from "../api";
import { EmailDrawer } from "../components/EmailList";
import { Categories, ErrorBox, GmailLink, Highlighted, useLoad } from "../components/common";
import type { EmailSummary } from "../types";

export function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<EmailSummary[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    try {
      const r = await api<{ items: EmailSummary[] }>(`/search${qs({ q })}`);
      setResults(r.items);
      setErr(null);
    } catch (ex) {
      setErr(String((ex as Error).message));
    }
  };
  return (
    <>
      <h1>Knowledge Search</h1>
      <p className="muted small">Full-text search over your locally cached email (subject, sender, text). Runs entirely on this computer.</p>
      <form onSubmit={run} className="row" style={{ marginBottom: 12 }}>
        <input style={{ flex: 1, minWidth: 240 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. turbine schedule, budget report, PostgreSQL" />
        <button className="primary" type="submit">
          Search
        </button>
      </form>
      <ErrorBox error={err} />
      {results && (
        <div className="card">
          <p className="muted small">{results.length} result(s)</p>
          {results.map((r) => (
            <div key={r.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <a href="#" onClick={(e) => (e.preventDefault(), setOpen(r.id))}>
                <b>{r.subject || "(no subject)"}</b>
              </a>{" "}
              <span className="muted small">
                {r.from_name || r.from_addr} · {fmtDate(r.date)}
              </span>{" "}
              <GmailLink url={r.gmail_url} label="Gmail" />
              <div className="small">
                <Highlighted text={r.match || ""} />
              </div>
              <Categories c={r.classification} />
            </div>
          ))}
        </div>
      )}
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </>
  );
}

interface Rec {
  id: number;
  kind: string;
  title: string;
  rationale: string;
  status: string;
  estimated_count: number;
  sender_email: string | null;
  sample: { id: number; subject: string | null; from_addr: string | null; date: string; gmail_url: string }[];
  executable: false;
}

/** Turn plain-text rationale into text + safe links (only https://mail.google.com URLs become links). */
function Rationale({ text }: { text: string }) {
  const parts = text.split(/(https:\/\/mail\.google\.com\/\S+)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("https://mail.google.com/") ? (
          <a key={i} href={p} target="_blank" rel="noopener noreferrer">
            open search in Gmail ↗
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function CleanupPage({ refreshKey }: { refreshKey: number }) {
  const [status, setStatus] = useState("pending");
  const [open, setOpen] = useState<number | null>(null);
  const [prefill, setPrefill] = useState<string | null>(null);
  const { data, error, reload } = useLoad(() => api<Rec[]>(`/cleanup${qs({ status })}`), [status, refreshKey]);
  const refresh = async () => {
    await api("/cleanup/refresh", { method: "POST" });
    reload();
  };
  const update = async (id: number, s: string) => {
    await api(`/cleanup/${id}`, { method: "PATCH", json: { status: s } });
    reload();
  };
  return (
    <>
      <h1>Cleanup Center</h1>
      <div className="notice card small">
        Suggestions below are <b>never acted on automatically</b>. To have MailMind clean up a sender for you, add it to the <b>Delete list</b>: you approve a preview once,
        then old mail from that sender is moved to Gmail's Trash after every sync (recoverable for 30 days, every run can be undone).
      </div>
      <DeleteListPanel prefill={prefill} onPrefillUsed={() => setPrefill(null)} />
      <h2>Suggestions</h2>
      <div className="filters">
        <label>
          Show
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">pending</option>
            <option value="acknowledged">acknowledged</option>
            <option value="dismissed">dismissed</option>
            <option value="all">all</option>
          </select>
        </label>
        <button onClick={refresh}>Recalculate</button>
      </div>
      <ErrorBox error={error} />
      {data?.length === 0 && <p className="muted">No suggestions. Nice and tidy.</p>}
      {data?.map((r) => (
        <div className="card" key={r.id}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>{r.title}</h2>
            <span className="badge">{r.kind.replace(/_/g, " ")}</span>
          </div>
          <p className="small">
            <Rationale text={r.rationale} />
          </p>
          <details>
            <summary className="small">Examples ({Math.min(5, r.estimated_count)} of {r.estimated_count})</summary>
            <ul className="small">
              {r.sample.map((s) => (
                <li key={s.id}>
                  <a href="#" onClick={(e) => (e.preventDefault(), setOpen(s.id))}>
                    {s.subject}
                  </a>{" "}
                  <span className="muted">{fmtDate(s.date, false)}</span> <GmailLink url={s.gmail_url} label="Gmail" />
                </li>
              ))}
            </ul>
          </details>
          <div className="row" style={{ marginTop: 8 }}>
            {r.sender_email && <button onClick={() => setPrefill(r.sender_email)}>Add sender to delete list…</button>}
            {r.status !== "acknowledged" && <button onClick={() => update(r.id, "acknowledged")}>Mark as handled (I did it in Gmail)</button>}
            {r.status !== "dismissed" && <button onClick={() => update(r.id, "dismissed")}>Dismiss</button>}
            {r.status !== "pending" && <button onClick={() => update(r.id, "pending")}>Restore</button>}
          </div>
        </div>
      ))}
      {open !== null && <EmailDrawer id={open} onClose={() => setOpen(null)} />}
    </>
  );
}
