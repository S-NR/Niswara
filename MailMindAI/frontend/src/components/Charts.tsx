import { useState } from "react";

/**
 * Single-series column chart (one hue, magnitude only).
 * 4px rounded data-ends anchored to the baseline, 2px gaps, hover tooltip with
 * oversized hit targets, recessive axis, and a table view toggle.
 */
export function ColumnChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  if (!data.length) return <p className="muted">No data yet — run a sync.</p>;
  const W = 420, H = 190, PAD_B = 18, PAD_T = 10;
  const max = Math.max(...data.map((d) => d.count), 1);
  const slot = W / data.length;
  const barW = Math.max(2, slot - 2);
  const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - v / max);
  const r = Math.min(4, barW / 2);
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="small muted">{label}</span>
        <button className="small" onClick={() => setTable(!table)}>
          {table ? "Chart view" : "Table view"}
        </button>
      </div>
      {table ? (
        <table className="small">
          <thead>
            <tr>
              <th>Date</th>
              <th>Emails</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="chart" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
            {ticks.map((t) => (
              <g key={t}>
                <line x1={0} x2={W} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
                <text x={W} y={y(t) - 2} textAnchor="end" fontSize={10} fill="var(--muted)">
                  {t}
                </text>
              </g>
            ))}
            {data.map((d, i) => {
              const x = i * slot + 1;
              const top = y(d.count);
              const base = y(0);
              const h = base - top;
              const path = h <= 0 ? "" : `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${base} Z`;
              return (
                <g key={d.date} onMouseEnter={() => setHover(i)}>
                  <rect x={i * slot} y={0} width={slot} height={H} fill="transparent" />
                  {path && <path d={path} fill="var(--series-1)" opacity={hover === null || hover === i ? 1 : 0.55} />}
                </g>
              );
            })}
            <text x={0} y={H - 4} fontSize={10} fill="var(--muted)">
              {data[0].date}
            </text>
            <text x={W} y={H - 4} fontSize={10} fill="var(--muted)" textAnchor="end">
              {data[data.length - 1].date}
            </text>
          </svg>
          {hover !== null && (
            <div className="tip" style={{ left: `${((hover + 0.5) / data.length) * 100}%`, top: `${(y(data[hover].count) / H) * 100}%` }}>
              {data[hover].date}: <b>{data[hover].count}</b> email(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Horizontal magnitude bars (single hue); value printed as text in text ink. */
export function HBars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  if (!data.length) return <p className="muted">No data yet.</p>;
  return (
    <div>
      {data.map((d) => (
        <div className="hbar" key={d.label} title={`${d.label}: ${d.value}`}>
          <span className="small">{d.label}</span>
          <div className="bar" style={{ width: `${(d.value / max) * 100}%` }} />
          <span className="n small">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
