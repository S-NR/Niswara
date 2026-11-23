import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, fmtDate } from "../api";
import { ErrorBox, GmailLink, StatusBadge, useLoad } from "../components/common";
import type { Analysis, SourcedItem, ThreadSummary } from "../types";

interface Options {
  analysis_types: Record<string, string>;
  methods: Record<string, string>;
  api: { available: boolean; allowed_by_config: boolean; enabled_in_settings: boolean; api_key_present: boolean; model: string };
}

const SECTIONS: [keyof NonNullable<Analysis["result"]>, string][] = [
  ["decisions", "Decisions"],
  ["actions", "Actions"],
  ["commitments", "Commitments"],
  ["deadlines", "Deadlines"],
  ["open_questions", "Unresolved questions"],
  ["contradictions", "Contradictions"],
];

function SourceRefs({ ids, a }: { ids: string[]; a: Analysis }) {
  const byGid = new Map(a.context_preview.messages?.map((m) => [m.gmail_id, m]) ?? []);
  return (
    <span className="source">
      {" "}
      [sources:{" "}
      {ids.map((g, i) => (
        <span key={g}>
          {i > 0 && ", "}
          <a href={`https://mail.google.com/mail/u/0/#all/${g}`} target="_blank" rel="noopener noreferrer" title={byGid.get(g)?.subject}>
            {byGid.get(g)?.subject?.slice(0, 40) || g} ↗
          </a>
        </span>
      ))}
      ]
    </span>
  );
}

function Result({ a }: { a: Analysis }) {
  const r = a.result!;
  return (
    <div>
      <h3>Summary</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>
        {r.summary}
        <SourceRefs ids={r.summary_source_message_ids} a={a} />
      </p>
      <p className="small muted">Confidence: {r.confidence}</p>
      {SECTIONS.map(([key, label]) => {
        const items = (r[key] as SourcedItem[]) || [];
        if (!items.length) return null;
        return (
          <div key={key}>
            <h3>{label}</h3>
            <ul className="items">
              {items.map((it, i) => (
                <li key={i}>
                  {it.text}
                  {Object.entries(it)
                    .filter(([k, v]) => !["text", "source_message_ids"].includes(k) && v)
                    .map(([k, v]) => (
                      <span key={k} className="badge">
                        {k.replace(/_/g, " ")}: {String(v)}
                      </span>
                    ))}
                  <SourceRefs ids={it.source_message_ids} a={a} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {r.insufficient_information?.length > 0 && (
        <>
          <h3>Not answered by the selected emails</h3>
          <ul className="items">
            {r.insufficient_information.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </>
      )}
      {r.validation_warnings?.length > 0 && (
        <details>
          <summary className="small">Validation notes ({r.validation_warnings.length})</summary>
          <ul className="small">
            {r.validation_warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Preview({ a, onChange }: { a: Analysis; onChange: (a: Analysis) => void }) {
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const p = a.context_preview;
  const confirm = async () => {
    setBusy(true);
    setErr(null);
    try {
      onChange(await api<Analysis>(`/ai/requests/${a.id}/confirm`, { json: { context_hash: a.context_hash } }));
    } catch (e) {
      setErr(String((e as Error).message));
      onChange(await api<Analysis>(`/ai/requests/${a.id}`));
    } finally {
      setBusy(false);
    }
  };
  const cancel = async () => onChange(await api<Analysis>(`/ai/requests/${a.id}/cancel`, { method: "POST" }));
  return (
    <div>
      <table className="small">
        <tbody>
          <tr>
            <th>Analysis type</th>
            <td>{a.analysis_label}</td>
          </tr>
          {a.question && (
            <tr>
              <th>Question</th>
              <td>{a.question}</td>
            </tr>
          )}
          <tr>
            <th>Processing method</th>
            <td>{a.processing_label}</td>
          </tr>
          <tr>
            <th>Destination</th>
            <td>{p.destination}</td>
          </tr>
          <tr>
            <th>Data being shared</th>
            <td>
              {p.message_count} email(s), {p.total_chars.toLocaleString()} characters
              {p.truncated_messages > 0 && `, ${p.truncated_messages} truncated`}
              {p.omitted_messages > 0 && `, ${p.omitted_messages} omitted`}
              <br />
              <b>Fields:</b> {p.fields_shared?.join(", ")}
              <br />
              <b>Not shared:</b> {p.not_shared?.join(", ")}
            </td>
          </tr>
        </tbody>
      </table>
      {p.warnings?.map((w, i) => (
        <p key={i} className="small err">
          {w}
        </p>
      ))}
      <h3>Selected conversation — exactly these emails</h3>
      {p.messages?.map((m) => (
        <details key={m.gmail_id} className="small">
          <summary>
            {fmtDate(m.date)} · {m.from} · <b>{m.subject}</b> ({m.chars} chars{m.truncated ? ", truncated" : ""})
          </summary>
          <pre className="body">{m.body_preview}{m.chars > 400 ? " …" : ""}</pre>
        </details>
      ))}
      {a.status === "awaiting_confirmation" && (
        <div className="notice" style={{ marginTop: 12 }}>
          <label className="row">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            <span>
              I confirm that the {p.message_count} email(s) listed above may be shared with {a.processing_method === "anthropic_api" ? "the Anthropic API" : "Claude (via Claude Code)"} for this
              analysis.
            </span>
          </label>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="primary" disabled={!agree || busy} onClick={confirm}>
              {busy ? "Working…" : a.processing_method === "anthropic_api" ? "Confirm and send to Anthropic API" : "Confirm for Claude Code"}
            </button>
            <button onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}
      <ErrorBox error={err} />
    </div>
  );
}

function AnalysisView({ a, onChange }: { a: Analysis; onChange: (a: Analysis) => void }) {
  useEffect(() => {
    if (a.processing_method !== "claude_code" || !["confirmed", "processing"].includes(a.status)) return;
    const t = window.setInterval(async () => onChange(await api<Analysis>(`/ai/requests/${a.id}`)), 4000);
    return () => window.clearInterval(t);
  }, [a.id, a.status, a.processing_method, onChange]);
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>
          Analysis #{a.id}: {a.analysis_label}
        </h2>
        <span className="badge">{a.status.replace(/_/g, " ")}</span>
      </div>
      <p className="small muted">
        Created {fmtDate(a.created_at)}
        {a.confirmed_at && ` · confirmed ${fmtDate(a.confirmed_at)}`}
        {a.completed_at && ` · completed ${fmtDate(a.completed_at)}`}
        {a.model && ` · ${a.model}`}
      </p>
      {a.status === "completed" && a.result ? (
        <>
          <Result a={a} />
          <details>
            <summary className="small">Data that was shared ({a.context_preview.message_count} emails)</summary>
            <Preview a={a} onChange={onChange} />
          </details>
        </>
      ) : (
        <Preview a={a} onChange={onChange} />
      )}
      {a.processing_method === "claude_code" && ["confirmed", "processing"].includes(a.status) && (
        <div className="notice" style={{ marginTop: 12 }}>
          <b>Waiting for Claude Code.</b>
          <pre className="body" style={{ maxHeight: "none" }}>{a.claude_code_instructions}</pre>
          <span className="small muted">This page refreshes automatically when the result arrives.</span>
        </div>
      )}
      {a.error && <ErrorBox error={a.error} />}
    </div>
  );
}

export default function ClaudeAnalysisPage() {
  const [params] = useSearchParams();
  const preThread = params.get("thread");
  const { data: opts, error: optErr } = useLoad(() => api<Options>("/ai/options"), []);
  const { data: threads } = useLoad(() => api<ThreadSummary[]>("/threads?limit=200"), []);
  const { data: history, reload } = useLoad(() => api<Analysis[]>("/ai/requests"), []);
  const [type, setType] = useState("thread_summary");
  const [method, setMethod] = useState("claude_code");
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<number[]>(preThread ? [Number(preThread)] : []);
  const [weekly, setWeekly] = useState(false);
  const [filter, setFilter] = useState("");
  const [current, setCurrent] = useState<Analysis | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setWeekly(type === "weekly_summary"), [type]);

  const prepare = async () => {
    setErr(null);
    try {
      const a = await api<Analysis>("/ai/requests", {
        json: {
          analysis_type: type,
          method,
          question: question || null,
          thread_ids: weekly ? [] : selected,
          weekly_days: weekly ? 7 : null,
          weekly_domain: "work",
        },
      });
      setCurrent(a);
      reload();
    } catch (e) {
      setErr(String((e as Error).message));
    }
  };
  const toggle = (id: number) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const shown = (threads ?? []).filter((t) => !filter || (t.subject || "").toLowerCase().includes(filter.toLowerCase()) || t.participants.join(" ").includes(filter.toLowerCase()));

  return (
    <>
      <h1>Claude Analysis</h1>
      <div className="notice card small">
        Claude is used only when you ask here (or in Claude Code). You choose the emails, review exactly what will be shared, and confirm before anything leaves MailMind.
        Routine sync and classification never use AI, and low-confidence classifications never trigger Claude automatically.
      </div>
      <ErrorBox error={optErr} />
      {opts && (
        <div className="card">
          <h2>1. Choose an analysis</h2>
          <div className="filters">
            <label>
              Analysis type
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {Object.entries(opts.analysis_types).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Processing method
              <select value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="claude_code">{opts.methods.claude_code}</option>
                <option value="anthropic_api" disabled={!opts.api.available}>
                  {opts.methods.anthropic_api}
                  {opts.api.available ? "" : " (disabled)"}
                </option>
              </select>
            </label>
          </div>
          {!opts.api.available && (
            <p className="small muted">
              The direct Anthropic API is off. It needs MAILMIND_ANTHROPIC_API_ALLOWED=true ({opts.api.allowed_by_config ? "✓" : "✗"}), the Settings toggle (
              {opts.api.enabled_in_settings ? "✓" : "✗"}) and an API key ({opts.api.api_key_present ? "✓" : "✗"}).
            </p>
          )}
          <label className="small">
            Question / focus (optional{type === "custom" ? ", required for custom" : ""})
            <textarea value={question} maxLength={2000} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What did my manager decide about the retrofit?" />
          </label>
          <h2 style={{ marginTop: 14 }}>2. Select the conversation(s)</h2>
          {weekly ? (
            <p className="small">The weekly summary uses your work emails from the last 7 days with medium or high importance (newsletters, promotions, notifications and suspicious mail are excluded). You will see the exact list before confirming.</p>
          ) : (
            <>
              <input placeholder="filter conversations…" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginBottom: 6 }} />
              <div style={{ maxHeight: 260, overflow: "auto", border: "1px solid var(--border)", borderRadius: 6 }}>
                <table className="small">
                  <tbody>
                    {shown.map((t) => (
                      <tr key={t.id} className="clickable" onClick={() => toggle(t.id)}>
                        <td style={{ width: 24 }}>
                          <input type="checkbox" readOnly checked={selected.includes(t.id)} />
                        </td>
                        <td>{t.subject || "(no subject)"}</td>
                        <td>{t.message_count} msg</td>
                        <td>{fmtDate(t.last_date, false)}</td>
                        <td>
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small muted">{selected.length} conversation(s) selected. Pick two or more to compare conversations.</p>
            </>
          )}
          <button className="primary" onClick={prepare} disabled={!weekly && selected.length === 0}>
            3. Prepare preview (nothing is sent yet)
          </button>
          <ErrorBox error={err} />
        </div>
      )}
      {current && <AnalysisView a={current} onChange={(a) => (setCurrent(a), reload())} />}
      <div className="card">
        <h2>History</h2>
        {history?.length === 0 && <p className="muted small">No analyses yet.</p>}
        <table className="small">
          <tbody>
            {history?.map((h) => (
              <tr key={h.id} className="clickable" onClick={() => setCurrent(h)}>
                <td>#{h.id}</td>
                <td>{h.analysis_label}</td>
                <td>{h.processing_label}</td>
                <td>{h.context_preview?.message_count} emails</td>
                <td>
                  <span className="badge">{h.status.replace(/_/g, " ")}</span>
                </td>
                <td>{fmtDate(h.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {current?.sources && current.status === "completed" && (
        <div className="card small">
          <h2>Source references</h2>
          <ul>
            {[...new Map(current.sources.filter((s) => s.role !== "context").map((s) => [s.gmail_id + s.role + s.item_index, s])).values()].map((s, i) => (
              <li key={i}>
                {s.role}
                {s.item_index !== null ? ` #${s.item_index + 1}` : ""} ← <GmailLink url={s.gmail_url} label={s.gmail_id} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
