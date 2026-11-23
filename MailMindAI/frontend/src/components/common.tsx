import { useCallback, useEffect, useState } from "react";
import type { Classification } from "../types";

/** Load data from the API with loading / error state and a reload function. */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[]): { data: T | undefined; error: string | null; loading: boolean; reload: () => void } {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    run()
      .then((d) => alive && (setData(d), setError(null)))
      .catch((e) => alive && setError(String(e.message || e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [run, tick]);
  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}

const STATUS_LABEL: Record<string, string> = {
  needs_reply: "Needs reply",
  awaiting_reply: "Awaiting reply",
  action_later: "Action for later",
  informational: "Informational",
  completed: "Completed",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`badge st-${status}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function ImportanceBadge({ c }: { c: Classification | null }) {
  if (!c) return null;
  return (
    <span className={`badge st-${c.importance_level}`} title={`score ${c.importance}/100, confidence ${Math.round(c.confidence * 100)}%`}>
      {c.importance_level} · {c.importance}
    </span>
  );
}

export function Categories({ c }: { c: Classification | null }) {
  if (!c) return null;
  return (
    <>
      {c.categories.map((k) => (
        <span key={k} className="badge">
          {k}
        </span>
      ))}
      {c.projects.map((p) => (
        <span key={p} className="badge" title="project">
          ◆ {p}
        </span>
      ))}
      {c.confidence < 0.6 && (
        <span className="badge" title="Low local confidence. MailMind never sends this to Claude automatically.">
          low confidence
        </span>
      )}
    </>
  );
}

export function ErrorBox({ error }: { error: string | null | undefined }) {
  return error ? <div className="err">{error}</div> : null;
}

/** Render a search snippet where [[...]] marks matches - as React text, never HTML. */
export function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((p, i) => (p.startsWith("[[") && p.endsWith("]]") ? <mark key={i}>{p.slice(2, -2)}</mark> : <span key={i}>{p}</span>))}
    </>
  );
}

export function GmailLink({ url, label = "Open in Gmail" }: { url: string; label?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {label} ↗
    </a>
  );
}
