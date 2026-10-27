import { parseKey, daysBetween } from "./dateUtils";

const INR = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const isNil = (v) => v === null || v === undefined || Number.isNaN(v);

export const formatCurrency = (v) => (isNil(v) ? "—" : INR.format(v));

/** PDF-safe amount: jsPDF's built-in fonts have no ₹ glyph. */
export const formatPlainAmount = (v) => (isNil(v) ? "—" : `Rs. ${NUM.format(v)}`);

export const formatCompactCurrency = (v) => {
  if (isNil(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e7) return `₹${(v / 1e7).toFixed(1)}Cr`;
  if (a >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${Math.round(v)}`;
};

export const formatNumber = (v) => (isNil(v) ? "—" : NUM.format(v));
export const formatPercent = (v, digits = 1) => (isNil(v) ? "—" : `${v.toFixed(digits)}%`);
export const formatRating = (v) => (isNil(v) ? "—" : v.toFixed(1));

export const formatDate = (key) =>
  key ? parseKey(key).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const formatPeriod = (range) =>
  range.from === range.to
    ? formatDate(range.from)
    : `${formatDate(range.from)} – ${formatDate(range.to)} (${daysBetween(range.from, range.to)} days)`;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
