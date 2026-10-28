
const toneClasses = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-rose-50 text-rose-700 ring-rose-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

const statusTone = {
  Published: "green", Approved: "green", Verified: "green", Confirmed: "green",
  Completed: "green", Paid: "green", Available: "green", Resolved: "green",
  Draft: "slate", Archived: "slate", Closed: "slate", Upcoming: "blue",
  Open: "blue", Processing: "blue", "In Progress": "blue",
  Pending: "amber", "Pending Approval": "amber", "Under Review": "amber",
  "Pending Payout": "amber", Limited: "amber", Missing: "red",
  Rejected: "red", Cancelled: "red", "Sold Out": "red",
  "Cancellation Requested": "red", Expired: "red",
};

export function StatusBadge({ status, tone }) {
  const t = toneClasses[tone || statusTone[status] || "slate"];
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${t}`}>
      {status}
    </span>
  );
}

export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {Icon && (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
          <Icon size={22} />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

export function PageIntro({ children, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-2xl text-sm text-slate-600">{children}</p>
      {action}
    </div>
  );
}

const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const btnVariants = {
  primary: "bg-violet-600 text-white hover:bg-violet-700",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
  ghost: "text-violet-700 hover:bg-violet-50",
};

export function Button({ variant = "primary", className = "", ...props }) {
  return <button type="button" className={`${btnBase} ${btnVariants[variant]} ${className}`} {...props} />;
}

const inputBase = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-500";

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block text-left ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className={inputBase} {...props} />;
}
export function Textarea(props) {
  return <textarea rows={4} className={inputBase} {...props} />;
}
export function Select({ children, ...props }) {
  return <select className={inputBase} {...props}>{children}</select>;
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${checked ? "bg-violet-600" : "bg-slate-300"}`}
    >
      <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

export function Table({ columns, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
            {columns.map((c) => (
              <th key={c} className="whitespace-nowrap px-4 py-3">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}
export const Td = ({ className = "", ...p }) => <td className={`px-4 py-3 align-middle text-slate-700 ${className}`} {...p} />;

export function EmptyState({ title, text }) {
  return (
    <div className="py-10 text-center">
      <p className="font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            value === t ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Notice({ tone = "blue", children }) {
  const t = { blue: "border-sky-200 bg-sky-50 text-sky-800", amber: "border-amber-200 bg-amber-50 text-amber-800", red: "border-rose-200 bg-rose-50 text-rose-800", green: "border-emerald-200 bg-emerald-50 text-emerald-800" }[tone];
  return <div className={`rounded-lg border px-4 py-3 text-left text-sm ${t}`}>{children}</div>;
}

export const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;