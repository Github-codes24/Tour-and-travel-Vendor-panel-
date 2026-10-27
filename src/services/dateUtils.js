/**
 * Date helpers for the Reports module.
 *
 * Conventions
 *  - A "date key" is a calendar day string: YYYY-MM-DD, interpreted in the browser's local timezone.
 *  - Ranges are INCLUSIVE on both ends: { from, to } contains every day from `from` through `to`.
 *  - ISO timestamps from the backend are converted to the local calendar day before comparison.
 */
import { MAX_CUSTOM_RANGE_DAYS } from "../utils/reportsConfig";

const pad = (n) => String(n).padStart(2, "0");

export const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const todayKey = () => toKey(new Date());

export const isValidKey = (key) =>
  typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key) && toKey(parseKey(key)) === key;

export const addDays = (key, n) => {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
};

/** Number of calendar days in an inclusive range. */
export const daysBetween = (from, to) => Math.round((parseKey(to) - parseKey(from)) / 86400000) + 1;

export const endOfMonth = (key) => {
  const d = parseKey(key);
  return toKey(new Date(d.getFullYear(), d.getMonth() + 1, 0));
};

export const inRange = (key, range) => Boolean(key) && key >= range.from && key <= range.to;

/** Converts a backend value (date-only string, ISO timestamp, Date) to a local date key. */
export function toDateKey(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return isValidKey(value) ? value : null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : toKey(d);
}

export function resolveRange(preset, custom, today = todayKey()) {
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "last7":
      return { from: addDays(today, -6), to: today };
    case "thisMonth":
      return { from: `${today.slice(0, 8)}01`, to: today };
    case "lastMonth": {
      const lastOfPrev = addDays(`${today.slice(0, 8)}01`, -1);
      return { from: `${lastOfPrev.slice(0, 8)}01`, to: lastOfPrev };
    }
    case "custom":
      return { from: custom.from, to: custom.to };
    default:
      return { from: addDays(today, -6), to: today };
  }
}

/** Previous period of equivalent duration, ending the day before `range.from`. */
export function previousRange(range) {
  const n = daysBetween(range.from, range.to);
  return { from: addDays(range.from, -n), to: addDays(range.from, -1) };
}

export function validateCustomRange({ from, to }) {
  if (!from || !to) return "Select both a start and an end date.";
  if (!isValidKey(from) || !isValidKey(to)) return "Enter valid dates.";
  if (from > to) return "Start date must be on or before the end date.";
  if (daysBetween(from, to) > MAX_CUSTOM_RANGE_DAYS) return `Choose a range of ${MAX_CUSTOM_RANGE_DAYS} days or fewer.`;
  return null;
}

/* ------------------------------ buckets ------------------------------ */

const fmt = (key, opts) => parseKey(key).toLocaleDateString("en-IN", opts);

export function pickGranularity(range) {
  const n = daysBetween(range.from, range.to);
  if (n <= 31) return "day";
  if (n <= 120) return "week";
  return "month";
}

/** Contiguous, gap-free buckets covering the range. Weeks start on Monday and are clipped to the range. */
export function buildBuckets(range, granularity) {
  const buckets = [];
  let cursor = range.from;
  while (cursor <= range.to) {
    let end = cursor;
    if (granularity === "week") {
      const dow = (parseKey(cursor).getDay() + 6) % 7;
      end = addDays(cursor, 6 - dow);
    } else if (granularity === "month") {
      end = endOfMonth(cursor);
    }
    if (end > range.to) end = range.to;

    const label =
      granularity === "month"
        ? fmt(cursor, { month: "short", year: "2-digit" })
        : fmt(cursor, { day: "numeric", month: "short" });
    const title =
      granularity === "day"
        ? fmt(cursor, { day: "numeric", month: "short", year: "numeric" })
        : granularity === "month"
          ? fmt(cursor, { month: "long", year: "numeric" })
          : `${fmt(cursor, { day: "numeric", month: "short" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;

    buckets.push({ key: cursor, from: cursor, to: end, label, title });
    cursor = addDays(end, 1);
  }
  return buckets;
}

/** Index of the bucket containing `key`, or -1. Buckets are sorted and contiguous. */
export function bucketIndex(buckets, key) {
  let lo = 0;
  let hi = buckets.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (key < buckets[mid].from) hi = mid - 1;
    else if (key > buckets[mid].to) lo = mid + 1;
    else return mid;
  }
  return -1;
}
