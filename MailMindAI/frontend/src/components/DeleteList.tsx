import { useEffect, useState } from "react";
import { api, fmtDate } from "../api";
import { ErrorBox, GmailLink, useLoad } from "./common";

interface Rule {
  id: number;
  pattern: string;
  older_than_days: number;
  enabled: boolean;
  approved: boolean;
  approved_at: string | null;
  last_run_at: string | null;
  total_trashed: number;
  pending_count: number | null;
}
interface Run {
  id: number;
  trigger: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  trashed: number;
  failed: number;
  restored: number;
  undone_at: string | null;
  error: string | null;
}
interface Overview {
  trash_enabled: boolean;
  paused: boolean;
  running: boolean;
  rules: Rule[];
  runs: Run[];
}
interface Preview {
  rule_id: number;
  pattern: string;
  older_than_days: number;
  count: number;
  protected: Record<string, number>;
  sample: { id: number; subject: string | null; from_addr: string | null; date: string; gmail_url: string }[];
  note: string;
}

function PreviewBox({ p, onApprove, onCancel, busy }: { p: Preview; onApprove: () => void; onCancel: () => void; busy: boolean }) {
  const protectedTotal = Object.values(p.protected).reduce((a, b) => a + b, 0);
  return (
    <div className="notice" style={{ margin: "8px 0" }}>
      <b>
        {p.count} email(s) from <code>{p.pattern}</code> older than {p.older_than_days} day(s) would be moved to Trash now
      </b>
      , and future ones automatically after each sync.
      {protectedTotal > 0 && (
        <div className="small">
          Protected and kept:{" "}
          {Object.entries(p.protected)
            .map(([k, v]) => `${v} ${k}`)
            .join(", ")}
        </div>
      )}
      {p.sample.length > 0 && (
        <ul className="small">
          {p.sample.map((x) => (
            <li key={x.id}>
              {fmtDate(x.date, false)} — {x.subject} <GmailLink url={x.gmail_url} label="view" />
            </li>
          ))}
          {p.count > p.sample.length && <li className="muted">…and {p.count - p.sample.length} more</li>}
        </ul>
      )}
      <div className="small muted">{p.note}</div>
      <div className="row" style={{ marginTop: 8 }}>
        <button className="primary" disabled={busy} onClick={onApprove}>
          Approve — move {p.count} to Trash and keep this rule active
        </button>
        <button onClick={onCancel}>Not now</button>
      </div>
    </div>
  );
}

export function DeleteListPanel({ prefill, onPrefillUsed }: { prefill?: string | null; onPrefillUsed?: () => void }) {
  const { data, error, reload } = useLoad(() => api<Overview>("/delete-list"), []);
  const [pattern, setPattern] = useState("");
  const [days, setDays] = useState(7);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (prefill) {
      setPattern(prefill);
      onPrefillUsed?.();
      document.getElementById("delete-list")?.scrollIntoView({ behavior: "smooth" });
    }
  }, [prefill, onPrefillUsed]);

  useEffect(() => {
    if (!data?.running) return;
    const t = window.setTimeout(reload, 2000);
    return () => window.clearTimeout(t);
  }, [data, reload]);

  const act = async (fn: () => Promise<unknown>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(String((e as Error).message));
    } finally {
      setBusy(false);
      reload();
    }
  };
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    act(async () => {
      const r = await api<{ preview: Preview }>("/delete-list/rules", { json: { pattern, older_than_days: days } });
      setPreview(r.preview);
      setPattern("");
    });
  };
  const showPreview = (id: number) => act(async () => setPreview(await api<Preview>(`/delete-list/rules/${id}/preview`)));
  const approve = (p: Preview) =>
    act(async () => {
      await api(`/delete-list/rules/${p.rule_id}/approve`, { json: { seen_count: p.count } });
      setPreview(null);
    });

  return (
    <div className="card" id="delete-list">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Delete list — automatic “move to Trash”</h2>
        {data && (
          <label className="row small">
            <input type="checkbox" checked={data.paused} onChange={(e) => act(() => api("/delete-list/pause", { method: "PUT", json: { paused: e.target.checked } }))} />
            Pause all
          </label>
        )}
      </div>
      <p className="small muted">
        Old mail from these senders is moved to Gmail's Trash after every sync (recoverable for 30 days, and every run can be undone here). Starred and Important emails, your
        own mail, and senders in your trusted/manager/client rules are never touched. Each rule only becomes active after you approve its preview.
      </p>
      {data && !data.trash_enabled && (
        <div className="err small">
          Cleanup mode is not enabled yet, so rules can be added and previewed but not run. In PowerShell run <code>scripts\login.ps1 -EnableCleanup</code> (first add the{" "}
          <code>gmail.modify</code> scope in Google Cloud → Data Access), then reload this page.
        </div>
      )}
      <form className="filters" onSubmit={add} style={{ marginTop: 10 }}>
        <label>
          Sender address (or @domain)
          <input required value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="offers@shop.example" style={{ minWidth: 260 }} />
        </label>
        <label>
          Only emails older than (days)
          <input type="number" min={0} max={3650} value={days} onChange={(e) => setDays(Number(e.target.value))} style={{ width: 90 }} />
        </label>
        <button className="primary" type="submit" disabled={busy}>
          Add &amp; preview
        </button>
      </form>
      <ErrorBox error={error || err} />
      {preview && <PreviewBox p={preview} busy={busy} onApprove={() => approve(preview)} onCancel={() => setPreview(null)} />}
      {data && data.rules.length > 0 && (
        <table className="small">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Older than</th>
              <th>Status</th>
              <th>Waiting now</th>
              <th>Trashed so far</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.rules.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.pattern}</code>
                </td>
                <td>{r.older_than_days} d</td>
                <td>{!r.approved ? <span className="badge st-medium">needs approval</span> : r.enabled ? <span className="badge st-completed">active</span> : <span className="badge">disabled</span>}</td>
                <td>{r.pending_count ?? "—"}</td>
                <td>{r.total_trashed}</td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {!r.approved && <button onClick={() => showPreview(r.id)}>Preview &amp; approve</button>}{" "}
                  {r.approved && <button onClick={() => act(() => api(`/delete-list/rules/${r.id}`, { method: "PATCH", json: { enabled: !r.enabled } }))}>{r.enabled ? "Disable" : "Enable"}</button>}{" "}
                  <button className="danger" onClick={() => act(() => api(`/delete-list/rules/${r.id}`, { method: "DELETE" }))}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {data && data.trash_enabled && data.rules.some((r) => r.approved && r.enabled) && (
        <div className="row" style={{ marginTop: 8 }}>
          <button disabled={busy || data.running} onClick={() => act(() => api("/delete-list/run", { method: "POST" }))}>
            {data.running ? "Running…" : "Run now"}
          </button>
          <span className="small muted">Runs automatically after every sync.</span>
        </div>
      )}
      {data && data.runs.length > 0 && (
        <>
          <h3>Recent runs</h3>
          <table className="small">
            <tbody>
              {data.runs.map((r) => (
                <tr key={r.id}>
                  <td>{fmtDate(r.started_at)}</td>
                  <td>{r.trigger.replace("_", " ")}</td>
                  <td>
                    <span className="badge">{r.status}</span>
                  </td>
                  <td>
                    {r.trashed} trashed{r.failed ? `, ${r.failed} failed` : ""}
                    {r.restored ? `, ${r.restored} restored` : ""}
                    {r.error && <div className="muted">{r.error}</div>}
                  </td>
                  <td>
                    {r.trashed > 0 && !r.undone_at && (
                      <button disabled={busy} onClick={() => act(() => api(`/delete-list/runs/${r.id}/undo`, { method: "POST" }))}>
                        Undo (restore from Trash)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
