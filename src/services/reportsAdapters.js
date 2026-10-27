/**
 * Adapters: the ONLY place that knows what raw backend records look like.
 * Everything downstream (calculations, UI, exports) uses the normalised shapes below.
 *
 * Privacy: customer identity is reduced to an opaque `customerKey` used solely for repeat-customer
 * counting. Names, emails and phone numbers are never copied into report data.
 */
import { toDateKey } from "../utils/dateUtils";

const pick = (obj, keys) => {
  for (const k of keys) if (obj?.[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  return null;
};
const num = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const token = (v) => String(v ?? "").toLowerCase().trim().replace(/[\s-]+/g, "_");

/** Accepts a bare array or the first array-valued wrapper key. Adjust here if your API wraps differently. */
export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  for (const k of ["data", "results", "items", "records"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
}

export function normalizeBookingStatus(raw) {
  const s = token(raw);
  if (!s) return "unknown";
  if (s.includes("cancel")) return "cancelled";
  if (["completed", "complete", "finished", "trip_completed"].includes(s)) return "completed";
  if (["confirmed", "approved", "booked", "accepted"].includes(s)) return "confirmed";
  if (["pending", "awaiting", "initiated", "awaiting_payment"].includes(s)) return "pending";
  return "unknown";
}

export function normalizePaymentStatus(raw) {
  const s = token(raw);
  if (["paid", "success", "captured", "completed"].includes(s)) return "paid";
  if (s.includes("refund")) return "refunded";
  if (s.includes("partial")) return "partial";
  if (["unpaid", "pending", "failed", "created"].includes(s)) return "unpaid";
  return "unknown";
}

export function normalizeBookingPayoutStatus(raw) {
  const s = token(raw);
  if (["eligible", "ready", "ready_for_payout"].includes(s)) return "eligible";
  if (["pending", "on_hold", "not_eligible", "awaiting_completion"].includes(s)) return "pending";
  if (["paid", "settled", "processed"].includes(s)) return "paid";
  return "unknown";
}

export function normalizePayoutStatus(raw) {
  const s = token(raw);
  if (["paid", "success", "completed", "settled"].includes(s)) return "paid";
  if (["processing", "in_progress", "initiated"].includes(s)) return "processing";
  if (s === "pending") return "pending";
  if (["failed", "rejected", "reversed"].includes(s)) return "failed";
  return "unknown";
}

export function adaptBooking(raw) {
  const packageId = pick(raw, ["package_id", "packageId", "pkgId"]);
  const customer = pick(raw, ["customer_id", "customerId", "user_id", "userId"]);
  const travellers = pick(raw, ["travellers", "travelers", "number_of_travellers", "pax"]);
  return {
    id: String(pick(raw, ["booking_id", "bookingId", "id", "_id"]) ?? "—"),
    packageId: packageId === null ? null : String(packageId),
    packageName: pick(raw, ["package_name", "packageName", "package_title", "pkgTitle"]),
    bookingDate: toDateKey(pick(raw, ["booked_at", "booking_date", "bookingDate", "created_at", "createdAt"])),
    travelDate: toDateKey(pick(raw, ["travel_date", "travelDate", "departure_date", "start_date", "date"])),
    travellers: Array.isArray(travellers) ? travellers.length : num(travellers) ?? 0,
    amount: num(pick(raw, ["total_amount", "amount", "booking_amount", "bookingAmount", "total"])),
    commission: num(pick(raw, ["commission_amount", "commission", "platform_commission"])),
    refund: num(pick(raw, ["refund_amount", "refund", "refunded_amount"])),
    netEarning: num(pick(raw, ["vendor_earning", "net_vendor_earning", "netEarning"])),
    status: normalizeBookingStatus(pick(raw, ["status", "booking_status"])),
    paymentStatus: normalizePaymentStatus(pick(raw, ["payment_status", "paymentStatus"])),
    payoutStatus: normalizeBookingPayoutStatus(pick(raw, ["payout_status", "payoutStatus"])),
    customerKey: customer === null ? null : String(customer),
  };
}

export function adaptPackage(raw) {
  const s = token(pick(raw, ["status", "package_status"]));
  return {
    id: String(pick(raw, ["package_id", "packageId", "id", "_id"]) ?? ""),
    name: pick(raw, ["name", "title", "package_name"]) ?? "Untitled package",
    status: ["active", "published", "live", "approved"].includes(s) ? "active" : "inactive",
  };
}

export function adaptReview(raw) {
  const rating = num(pick(raw, ["rating", "stars"]));
  const pid = pick(raw, ["package_id", "packageId"]);
  return {
    id: String(pick(raw, ["review_id", "reviewId", "id", "_id"]) ?? ""),
    packageId: pid === null ? null : String(pid),
    rating: rating !== null && rating >= 1 && rating <= 5 ? rating : null,
    comment: pick(raw, ["comment", "feedback", "review"]) ?? "",
    date: toDateKey(pick(raw, ["created_at", "createdAt", "date", "reviewed_at"])),
  };
}

export function adaptPayout(raw) {
  return {
    id: String(pick(raw, ["payout_id", "payoutId", "id", "_id"]) ?? "—"),
    date: toDateKey(pick(raw, ["payout_date", "payoutDate", "processed_at", "created_at"])),
    amount: num(pick(raw, ["amount", "net_amount", "payout_amount"])),
    status: normalizePayoutStatus(pick(raw, ["status", "payout_status"])),
    reference: pick(raw, ["reference", "utr", "transaction_reference", "reference_no"]),
  };
}
