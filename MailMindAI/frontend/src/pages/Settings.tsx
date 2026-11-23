import { useState } from "react";
import { api, fmtDate } from "../api";
import { ErrorBox, useLoad } from "../components/common";

interface Rule {
  id: number;
  rule_type: string;
  pattern: string;
  label: string | null;
  enabled: boolean;
  notes: string | null;
}

interface AppSettings {
  ai_api_enabled: boolean;
  followup_days: number;
  my_addresses: string[];
  body_retention_days: number | null;
  auto_sync_minutes: number;
  static: Record<string, string | number | boolean>;
}

const AUTO_SYNC_OPTIONS: [number, string][] = [
  [0, "only when I press Sync now (off)"],
  [15, "every 15 minutes"],
  [30, "every 30 minutes"],
  [60, "every hour"],
  [180, "every 3 hours"],
  [360, "every 6 hours"],
  [720, "every 12 hours"],
  [1440, "once a day"],
];

function RulesManager() {
  const { data: types } = useLoad(() => api<Record<string, string>>("/rules/types"), []);
  const { data: rules, error, reload } = useLoad(() => api<Rule[]>("/rules"), []);
  const [form, setForm] = useState({ rule_type: "manager", pattern: "", label: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await api("/rules", { json: { ...form, label: form.label || null } });
      setForm({ ...form, pattern: "", label: "" });
      reload();
      setMsg("Rule added. Press “Re-analyse” to apply it to existing email.");
    } catch (ex) {
      setErr(String((ex as Error).message));
    }
  };
  const del = async (id: number) => {
    await api(`/rules/${id}`, { method: "DELETE" });
    reload();
  };
  const toggle = async (r: Rule) => {
    await api(`/rules/${r.id}`, { method: "PUT", json: { ...r, enabled: !r.enabled } });
    reload();
  };
  const reanalyse = async () => {
    const r = await api<{ threads_analysed: number }>("/rules/reanalyse", { method: "POST" });
    setMsg(`Re-analysed ${r.threads_analysed} conversation(s) locally.`);
  };
  const isKeyword = form.rule_type.endsWith("keyword");
  return (
    <div className="card">
      <h2>Rules — trusted senders, managers, clients, domains and project keywords</h2>
      <p className="small muted">
        Use an exact address (<code>name@company.com</code>) or a whole domain (<code>@company.com</code>, which also matches subdomains). Keywords match whole words, case-insensitively.
      </p>
      <form className="filters" onSubmit={add}>
        <label>
          Type
          <select value={form.rule_type} onChange={(e) => setForm({ ...form, rule_type: e.target.value })}>
            {types &&
              Object.keys(types).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
          </select>
        </label>
        <label>
          {isKeyword ? "Keyword" : "Address or @domain"}
          <input required value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} />
        </label>
        <label>
          Label {form.rule_type === "project_keyword" ? "(project name)" : "(optional)"}
          <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </label>
        <button className="primary" type="submit">
          Add rule
        </button>
        <button type="button" onClick={reanalyse}>
          Re-analyse all email
        </button>
      </form>
      {types && <p className="small muted">{types[form.rule_type]}</p>}
      <ErrorBox error={error || err} />
      {msg && <p className="small">{msg}</p>}
      <table className="small">
        <thead>
          <tr>
            <th>Type</th>
            <th>Pattern</th>
            <th>Label</th>
            <th>Enabled</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rules?.map((r) => (
            <tr key={r.id}>
              <td>{r.rule_type.replace(/_/g, " ")}</td>
              <td>
                <code>{r.pattern}</code>
              </td>
              <td>{r.label}</td>
              <td>
                <input type="checkbox" checked={r.enabled} onChange={() => toggle(r)} />
              </td>
              <td>
                <button className="danger" onClick={() => del(r.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SettingsPage() {
  const { data: s, error, reload } = useLoad(() => api<AppSettings>("/settings"), []);
  const { data: auth } = useLoad(() => api<{ client_secret_present: boolean; token_present: boolean; scopes: string[]; trash_enabled: boolean }>("/auth/status"), []);
  const { data: audit } = useLoad(() => api<{ id: number; ts: string; actor: string; action: string; target_type: string | null; target_id: string | null; details: Record<string, unknown> }[]>("/audit?limit=100"), []);
  const [addr, setAddr] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [phrase, setPhrase] = useState("");

  const save = async (patch: Partial<AppSettings>) => {
    setErr(null);
    try {
      await api("/settings", { method: "PUT", json: patch });
      reload();
      setMsg("Saved.");
    } catch (e) {
      setErr(String((e as Error).message));
    }
  };
  const wipe = async (scope: string) => {
    try {
      const r = await api<{ removed: Record<string, number> }>("/cache/wipe", { json: { scope, confirm: phrase } });
      setMsg(`Local cache cleared: ${JSON.stringify(r.removed)}. Gmail was not touched.`);
      setPhrase("");
    } catch (e) {
      setErr(String((e as Error).message));
    }
  };
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setMsg("Gmail token removed from this computer.");
  };

  return (
    <>
      <h1>Settings</h1>
      <ErrorBox error={error || err} />
      {msg && <p className="notice small">{msg}</p>}
      <div className="card">
        <h2>Gmail connection (read-only)</h2>
        {auth && (
          <p className="small">
            OAuth client file: {auth.client_secret_present ? "✓ present" : "✗ missing (see docs/INSTALL.md)"}
            <br />
            Signed in: {auth.token_present ? "✓ token stored (encrypted with Windows DPAPI)" : "✗ not signed in — run scripts\\login.ps1"}
            <br />
            Permissions: <code>{auth.scopes.join(" ")}</code>
            <br />
            {auth.trash_enabled
              ? "Cleanup mode ON: approved Delete-list rules may move mail to Trash. MailMind still cannot send, permanently delete or change anything else."
              : "Read-only: MailMind cannot send, modify, archive or delete mail. (Run scripts\login.ps1 -EnableCleanup to use the Delete list.)"}
          </p>
        )}
        {auth?.token_present && (
          <button className="danger" onClick={logout}>
            Disconnect (delete local token)
          </button>
        )}
      </div>
      {s && (
        <div className="card">
          <h2>Automatic sync</h2>
          <label className="small">
            Sync this account{" "}
            <select value={s.auto_sync_minutes} onChange={(e) => save({ auto_sync_minutes: Number(e.target.value) })}>
              {AUTO_SYNC_OPTIONS.map(([v, label]) => (
                <option key={v} value={v}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className="small muted">
            Runs while MailMind is running. Each automatic sync fetches new mail and then applies your approved Delete-list rules
            {auth?.trash_enabled ? "" : " (once cleanup mode is enabled for this account)"}. New rules still need your approval here first.
            To have MailMind start by itself when you log in to Windows, run <code>scripts\autostart.ps1</code> (add{" "}
            <code>-DataDir &lt;folder&gt; -Port &lt;port&gt;</code> for a second account).
          </p>
        </div>
      )}
      <RulesManager />
      {s && (
        <div className="grid two">
          <div className="card">
            <h2>Your addresses</h2>
            <p className="small muted">The synced account is always “you”. Add aliases or other addresses you send from.</p>
            <ul className="small">
              {s.my_addresses.map((a) => (
                <li key={a}>
                  {a}{" "}
                  <button className="small" onClick={() => save({ my_addresses: s.my_addresses.filter((x) => x !== a) })}>
                    remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="row">
              <input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="alias@example.com" />
              <button onClick={() => (save({ my_addresses: [...s.my_addresses, addr] }), setAddr(""))}>Add</button>
            </div>
            <h2 style={{ marginTop: 16 }}>Follow-ups</h2>
            <label className="small">
              Flag an unanswered conversation after{" "}
              <input type="number" min={1} max={60} value={s.followup_days} onChange={(e) => save({ followup_days: Number(e.target.value) })} style={{ width: 60 }} /> day(s)
            </label>
          </div>
          <div className="card">
            <h2>Claude via Anthropic API (optional)</h2>
            <p className="small">
              Off by default. Claude Code (local Skill + MCP) works without this. Enabling the API requires the config flag <code>MAILMIND_ANTHROPIC_API_ALLOWED=true</code> (
              {s.static.anthropic_api_allowed ? "✓" : "✗"}) and an API key in <code>.env</code> ({s.static.anthropic_api_key_present ? "✓ present" : "✗ missing"}). Every request is still
              previewed and confirmed individually.
            </p>
            <label className="row small">
              <input type="checkbox" checked={s.ai_api_enabled} onChange={(e) => save({ ai_api_enabled: e.target.checked })} />
              Allow confirmed analyses to be sent to the Anthropic API ({String(s.static.anthropic_model)})
            </label>
          </div>
          <div className="card">
            <h2>Local data &amp; retention</h2>
            <p className="small">
              Data folder: <code>{String(s.static.data_dir)}</code>
              <br />
              Initial sync window: {String(s.static.initial_sync_days)} days · backfill: {String(s.static.backfill_days)} days · store bodies: {String(s.static.store_bodies)}
            </p>
            <label className="small">
              Remove cached email text older than{" "}
              <input
                type="number"
                min={1}
                max={3650}
                value={s.body_retention_days ?? Number(s.static.default_body_retention_days)}
                onChange={(e) => save({ body_retention_days: Number(e.target.value) })}
                style={{ width: 70 }}
              />{" "}
              days (applied after each sync; metadata is kept; Gmail is never touched)
            </label>
            <h3>Delete local cache</h3>
            <p className="small muted">Type DELETE LOCAL CACHE to enable. Original Gmail messages are not affected.</p>
            <input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="DELETE LOCAL CACHE" />
            <div className="row" style={{ marginTop: 6 }}>
              <button className="danger" disabled={phrase !== "DELETE LOCAL CACHE"} onClick={() => wipe("bodies")}>
                Remove all cached email text
              </button>
              <button className="danger" disabled={phrase !== "DELETE LOCAL CACHE"} onClick={() => wipe("all_mail")}>
                Remove all cached mail &amp; analysis
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="card">
        <h2>Audit log</h2>
        <div style={{ maxHeight: 360, overflow: "auto" }}>
          <table className="small">
            <tbody>
              {audit?.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(a.ts)}</td>
                  <td>{a.actor}</td>
                  <td>{a.action}</td>
                  <td>{a.target_type ? `${a.target_type} #${a.target_id}` : ""}</td>
                  <td className="muted">{JSON.stringify(a.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
