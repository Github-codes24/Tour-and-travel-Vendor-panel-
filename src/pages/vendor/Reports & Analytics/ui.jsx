import { useEffect } from "react";
import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Inbox, RefreshCw } from "lucide-react";
import { PAYOUT_STATUS_META, STATUS_META } from "../../../utils/reportsConfig";

export const Skeleton = ({ className = "" }) => <div aria-hidden="true" className={`animate-pulse rounded bg-gray-200 ${className}`} />;

export function Section({ id, title, description, action, children }) {
  return (
    <section aria-labelledby={`${id}-title`} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={`${id}-title`} className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ title = "No data for this period", hint = "Try a different date range or filter.", compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-14"}`}>
      <Inbox size={28} className="text-gray-300" />
      <p className="mt-2 text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertCircle size={28} className="text-red-500" />
      <p className="mt-2 text-sm font-semibold text-red-800">Couldn't load reports</p>
      <p className="mt-1 max-w-md text-sm text-red-700">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}

export function Unavailable({ reason }) {
  return <span title={reason} className="text-sm font-medium text-gray-400">Unavailable</span>;
}

export function StatusBadge({ status, meta = STATUS_META }) {
  const m = meta[status] ?? meta.unknown;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${m.badge}`}>{m.label}</span>;
}
export const PayoutBadge = ({ status }) => <StatusBadge status={status} meta={PAYOUT_STATUS_META} />;

/** % change chip. `value === null` means there is no comparable previous period. */
export function Delta({ value }) {
  if (value === null || value === undefined) return <span className="text-xs text-gray-400">No prior data to compare</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-600" : "text-red-600"}`}>
      <Icon size={14} /> {Math.abs(value).toFixed(1)}% <span className="font-normal text-gray-500">vs previous period</span>
    </span>
  );
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn = "rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500";
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600">
      <span>Showing {from}–{to} of {total}</span>
      <div className="flex items-center gap-2">
        <button className={btn} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
        <span>Page {page} of {pages}</span>
        <button className={btn} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </nav>
  );
}

export function DataTable({ columns, rows, rowKey, caption }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={`whitespace-nowrap px-4 py-3 text-xs font-semibold text-gray-600 ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)} className="hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.header} className={`whitespace-nowrap px-4 py-3 text-gray-700 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);
  if (!toast) return null;
  const error = toast.type === "error";
  return (
    <div role="status" className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${error ? "bg-red-600" : "bg-gray-900"}`}>
      {error ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {toast.message}
    </div>
  );
}
