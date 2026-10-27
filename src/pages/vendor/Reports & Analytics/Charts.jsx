/** Dependency-free SVG charts (Tailwind classes only). Each handles empty data and exposes hover/focus readouts. */
import { useState } from "react";
import { EmptyState } from "./ui";

const niceMax = (v) => {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};
const hasData = (data) => data.length > 0 && data.some((d) => d.value > 0);

function Readout({ item, format }) {
  return (
    <p className="mb-1 h-5 text-xs text-gray-500" aria-live="polite">
      {item ? <><span className="font-medium text-gray-800">{item.title ?? item.label}</span>: {format(item.value)}</> : "Hover or focus a point for details"}
    </p>
  );
}

const W = 640;
const PAD = { l: 52, r: 10, t: 10, b: 26 };

function Axes({ max, H, data, formatAxis }) {
  const ih = H - PAD.t - PAD.b;
  const every = Math.ceil(data.length / 8);
  const step = (W - PAD.l - PAD.r) / data.length;
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + ih - t * ih;
        return (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} className="stroke-gray-100" />
            <text x={PAD.l - 6} y={y + 3} textAnchor="end" className="fill-gray-400 text-[10px]">{formatAxis(t * max)}</text>
          </g>
        );
      })}
      {data.map((d, i) => (i % every === 0 ? (
        <text key={d.key ?? d.label} x={PAD.l + i * step + step / 2} y={H - 8} textAnchor="middle" className="fill-gray-500 text-[10px]">{d.label}</text>
      ) : null))}
    </>
  );
}

export function BarChart({ data, format = String, formatAxis = format, height = 230, label }) {
  const [hover, setHover] = useState(null);
  if (!hasData(data)) return <EmptyState compact title="Nothing to chart" hint="No data in the selected period." />;
  const H = height;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.t - PAD.b;
  const step = (W - PAD.l - PAD.r) / data.length;
  const bw = Math.min(40, step * 0.66);
  return (
    <div>
      <Readout item={hover !== null ? data[hover] : null} format={format} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        <Axes max={max} H={H} data={data} formatAxis={formatAxis} />
        {data.map((d, i) => {
          const h = (d.value / max) * ih;
          return (
            <rect
              key={d.key ?? d.label}
              tabIndex={0}
              role="img"
              aria-label={`${d.title ?? d.label}: ${format(d.value)}`}
              x={PAD.l + i * step + (step - bw) / 2}
              y={PAD.t + ih - h}
              width={bw}
              height={Math.max(h, 0)}
              rx={2}
              className={`${hover === i ? "fill-teal-700" : "fill-teal-500"} outline-none focus-visible:stroke-teal-900`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
            />
          );
        })}
      </svg>
    </div>
  );
}

export function LineChart({ data, format = String, formatAxis = format, height = 230, label }) {
  const [hover, setHover] = useState(null);
  if (!hasData(data)) return <EmptyState compact title="Nothing to chart" hint="No data in the selected period." />;
  const H = height;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const ih = H - PAD.t - PAD.b;
  const step = (W - PAD.l - PAD.r) / data.length;
  const pts = data.map((d, i) => [PAD.l + i * step + step / 2, PAD.t + ih - (d.value / max) * ih]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${PAD.t + ih} L${pts[0][0].toFixed(1)},${PAD.t + ih} Z`;
  return (
    <div>
      <Readout item={hover !== null ? data[hover] : null} format={format} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        <Axes max={max} H={H} data={data} formatAxis={formatAxis} />
        <path d={area} className="fill-teal-50" />
        <path d={line} fill="none" strokeWidth="2" strokeLinejoin="round" className="stroke-teal-600" />
        {data.map((d, i) => (
          <g key={d.key ?? d.label}>
            <rect
              x={PAD.l + i * step} y={PAD.t} width={step} height={ih} className="fill-transparent outline-none"
              tabIndex={0} role="img" aria-label={`${d.title ?? d.label}: ${format(d.value)}`}
              onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}
            />
            {(hover === i || data.length <= 31) && <circle cx={pts[i][0]} cy={pts[i][1]} r={hover === i ? 4 : 2.5} className="fill-teal-600 stroke-white" strokeWidth="1" />}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function DonutChart({ segments, centerValue, centerLabel, format = String }) {
  const total = segments.reduce((t, s) => t + s.value, 0);
  if (!total) return <EmptyState compact title="Nothing to chart" hint="No data in the selected period." />;
  const visibleSegments = segments.filter((s) => s.value > 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-0" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
          <circle cx="21" cy="21" r="15.915" fill="none" strokeWidth="5" className="stroke-gray-100" />
          {visibleSegments.map((s, index) => {
            const pct = (s.value / total) * 100;
            const offset = visibleSegments
              .slice(0, index)
              .reduce((sum, segment) => sum + (segment.value / total) * 100, 0);
            return (
              <circle
                key={s.label}
                cx="21"
                cy="21"
                r="15.915"
                fill="none"
                strokeWidth="5"
                className={s.stroke}
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={25 - offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-gray-900">{centerValue}</span>
          <span className="text-xs text-gray-500">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-700"><span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}</span>
            <span className="tabular-nums text-gray-900">{format(s.value)} <span className="text-gray-400">({((s.value / total) * 100).toFixed(0)}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HBarChart({ data, format = String }) {
  if (!hasData(data)) return <EmptyState compact title="Nothing to chart" hint="No data in the selected period." />;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.key ?? d.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-gray-700" title={d.label}>{d.label}</span>
            <span className="shrink-0 tabular-nums font-medium text-gray-900">{format(d.value)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100" role="presentation">
            <div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.max((d.value / max) * 100, 2)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({ values, label }) {
  if (!values.some((v) => v > 0)) return <span className="text-xs text-gray-400">—</span>;
  const max = Math.max(...values);
  const pts = values.map((v, i) => `${values.length === 1 ? 40 : (i / (values.length - 1)) * 80},${22 - (v / max) * 20}`).join(" ");
  return (
    <svg viewBox="0 0 80 24" className="h-6 w-20" role="img" aria-label={label}>
      <polyline points={pts} fill="none" strokeWidth="1.5" className="stroke-teal-600" />
    </svg>
  );
}
