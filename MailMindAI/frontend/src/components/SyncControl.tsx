import { useEffect, useRef, useState } from "react";
import { api } from "../api";

interface Progress {
  running: boolean;
  mode: string | null;
  phase: string;
  listed: number;
  fetched: number;
  estimated_total: number;
  error: string | null;
}

function isoDay(d: Date): string {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

export function SyncControl({ onDone }: { onDone?: () => void }) {
  const [p, setP] = useState<Progress | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<number>();
  const wasRunning = useRef(false);

  const poll = async () => {
    try {
      const s = await api<{ progress: Progress }>("/sync/status");
      setP(s.progress);
      if (wasRunning.current && !s.progress.running) onDone?.();
      wasRunning.current = s.progress.running;
      timer.current = window.setTimeout(poll, s.progress.running ? 800 : 5000);
    } catch (e) {
      setErr(String((e as Error).message));
      timer.current = window.setTimeout(poll, 8000);
    }
  };
  useEffect(() => {
    poll();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showRange, setShowRange] = useState(false);
  const today = isoDay(new Date());
  const [from, setFrom] = useState(isoDay(monthsAgo(6)));
  const [to, setTo] = useState(today);
  const rangeOk = !!from && !!to && from <= to && to <= today;

  const start = async (body: Record<string, string> = { mode: "auto" }) => {
    setErr(null);
    try {
      await api("/sync", { json: body });
      setShowRange(false);
      wasRunning.current = true;
      window.clearTimeout(timer.current);
      poll();
    } catch (e) {
      setErr(String((e as Error).message));
    }
  };
  const pct = p && p.estimated_total ? Math.min(100, Math.round((p.fetched / Math.max(1, p.estimated_total)) * 100)) : 0;
  return (
    <div className="row">
      {p?.running ? (
        <>
          <div className="progress" aria-label="sync progress">
            <div style={{ width: `${p.phase === "fetching" ? pct : 15}%` }} />
          </div>
          <span className="small">
            {p.mode} sync · {p.phase} · {p.fetched} fetched
            {p.estimated_total ? ` / ~${p.estimated_total}` : ""}
          </span>
        </>
      ) : (
        p && <span className="small muted">Last sync: {p.phase}{p.error ? ` — ${p.error}` : ""}</span>
      )}
      <button className="primary" onClick={() => start()} disabled={!!p?.running}>
        ⟳ Sync now
      </button>
      <span className="range-anchor">
        <button onClick={() => setShowRange((v) => !v)} disabled={!!p?.running} aria-expanded={showRange}>
          Date range…
        </button>
        {showRange && (
          <div className="range-pop card" role="dialog" aria-label="Sync a date range">
            <strong>Sync emails from a date range</strong>
            <p className="small muted">
              Fetches every email dated in this window (both days included). Emails already synced are skipped, so
              you can widen the window later. Large windows take a while because of Gmail's rate limits.
            </p>
            <div className="row">
              {[
                ["3 months", 3],
                ["6 months", 6],
                ["1 year", 12],
                ["2 years", 24],
              ].map(([label, n]) => (
                <button key={label} className="small" onClick={() => (setFrom(isoDay(monthsAgo(Number(n)))), setTo(today))}>
                  Last {label}
                </button>
              ))}
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <label className="small">
                From
                <input type="date" value={from} max={to || today} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="small">
                To
                <input type="date" value={to} min={from} max={today} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="primary" disabled={!rangeOk} onClick={() => start({ mode: "range", date_from: from, date_to: to })}>
                Sync this range
              </button>
              <button onClick={() => setShowRange(false)}>Cancel</button>
            </div>
            {!rangeOk && <p className="err small">“From” must be on or before “To”, and “To” can't be in the future.</p>}
          </div>
        )}
      </span>
      {err && <span className="err small">{err}</span>}
    </div>
  );
}
