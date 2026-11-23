import { Link } from "react-router-dom";
import { api, fmtDate } from "../api";
import { ColumnChart, HBars } from "../components/Charts";
import { ErrorBox, useLoad } from "../components/common";

interface Overview {
  emails_total: number;
  threads_total: number;
  unread: number;
  senders_total: number;
  needs_reply: number;
  awaiting_reply: number;
  action_later: number;
  completed: number;
  open_actions: number;
  overdue_actions: number;
  open_followups: number;
  overdue_followups: number;
  pending_cleanup: number;
  ai_analyses: number;
  by_category: Record<string, number>;
  by_importance: Record<string, number>;
  per_day: { date: string; count: number }[];
  top_senders: { email: string; name: string | null; count: number; relationship: string }[];
  sync: { account: string | null; status: string; last_full_sync_at: string | null; last_incremental_at: string | null; last_run: { kind: string; status: string; finished_at: string | null; error: string | null } | null };
}

function Tile({ v, l, to }: { v: number; l: string; to?: string }) {
  const body = (
    <div className="tile">
      <div className="v">{v}</div>
      <div className="l">{l}</div>
    </div>
  );
  return to ? (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      {body}
    </Link>
  ) : (
    body
  );
}

export default function OverviewPage({ refreshKey }: { refreshKey: number }) {
  const { data: o, error } = useLoad(() => api<Overview>("/stats/overview"), [refreshKey]);
  return (
    <>
      <h1>Overview</h1>
      <ErrorBox error={error} />
      {o && (
        <>
          {o.emails_total === 0 && (
            <div className="notice card">
              No emails cached yet. Connect Gmail (see <Link to="/settings">Settings</Link>) and press <b>Sync now</b>.
            </div>
          )}
          <div className="grid tiles" style={{ marginBottom: 16 }}>
            <Tile v={o.needs_reply} l="Conversations need your reply" to="/emails?status=needs_reply" />
            <Tile v={o.awaiting_reply} l="Awaiting someone else" to="/followups" />
            <Tile v={o.action_later} l="Actions for later" to="/actions" />
            <Tile v={o.open_actions} l={`Open actions (${o.overdue_actions} overdue)`} to="/actions" />
            <Tile v={o.open_followups} l={`Open follow-ups (${o.overdue_followups} overdue)`} to="/followups" />
            <Tile v={o.emails_total} l="Emails cached locally" to="/emails" />
            <Tile v={o.unread} l="Unread (not the same as pending)" />
            <Tile v={o.threads_total} l="Conversations" />
            <Tile v={o.pending_cleanup} l="Cleanup suggestions" to="/cleanup" />
            <Tile v={o.ai_analyses} l="Claude analyses" to="/claude" />
          </div>
          <div className="grid two">
            <div className="card">
              <h2>Emails per day (last 30 days)</h2>
              <ColumnChart data={o.per_day} label="Emails received or sent per day" />
            </div>
            <div className="card">
              <h2>Primary category</h2>
              <HBars data={Object.entries(o.by_category).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }))} />
              <h3>Importance</h3>
              <HBars data={["high", "medium", "low"].map((k) => ({ label: k, value: o.by_importance[k] ?? 0 }))} />
            </div>
            <div className="card">
              <h2>Top senders</h2>
              <table className="small">
                <tbody>
                  {o.top_senders.map((s) => (
                    <tr key={s.email}>
                      <td>{s.name || s.email}</td>
                      <td>
                        <span className="badge">{s.relationship}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card">
              <h2>Synchronisation</h2>
              <p className="small">
                Account: <b>{o.sync.account ?? "not connected"}</b>
                <br />
                Status: {o.sync.status}
                <br />
                Last full sync: {fmtDate(o.sync.last_full_sync_at)}
                <br />
                Last incremental sync: {fmtDate(o.sync.last_incremental_at)}
                {o.sync.last_run && (
                  <>
                    <br />
                    Last run: {o.sync.last_run.kind} — {o.sync.last_run.status} {fmtDate(o.sync.last_run.finished_at)}
                    {o.sync.last_run.error && <span className="err"> {o.sync.last_run.error}</span>}
                  </>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
