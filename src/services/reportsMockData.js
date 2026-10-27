/**
 * DEVELOPMENT-ONLY MOCK DATA.
 * Loaded exclusively when `import.meta.env.DEV` is true AND `VITE_REPORTS_USE_MOCK=true`.
 * It is never merged with real responses and never used as a fallback when a request fails.
 *
 * Records use the same snake_case shape the adapters expect from a backend, so the adapter
 * layer is exercised exactly as it would be with real data.
 */
import { addDays, toKey, inRange } from "../utils/dateUtils";

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PACKAGES = [
  { package_id: "pkg_goa", title: "Goa Beach Escape", status: "active", price: 14500 },
  { package_id: "pkg_manali", title: "Manali Snow Adventure", status: "active", price: 18900 },
  { package_id: "pkg_kerala", title: "Kerala Backwaters Retreat", status: "active", price: 22400 },
  { package_id: "pkg_rajasthan", title: "Royal Rajasthan Tour", status: "active", price: 27800 },
  { package_id: "pkg_andaman", title: "Andaman Island Getaway", status: "active", price: 41200 },
  { package_id: "pkg_ladakh", title: "Leh Ladakh Expedition", status: "active", price: 36500 },
  { package_id: "pkg_sikkim", title: "Sikkim Himalayan Trail", status: "active", price: 24900 }, // zero bookings on purpose
  { package_id: "pkg_old", title: "Ooty Weekend Break", status: "inactive", price: 9800 },
];
const LEGACY = { package_id: "pkg_legacy", title: "Shimla Honeymoon (legacy)", price: 19900 }; // not in package list

const COMMENTS = [
  "Well organised trip, the itinerary was smooth.",
  "Great guide and comfortable stay.",
  "Value for money. Would book again.",
  "Pickup was late on day one, otherwise a lovely trip.",
  "Hotels were better than expected.",
  "Good experience overall.",
  "",
];

function build() {
  const rand = rng(20261027);
  const today = toKey(new Date());
  const bookings = [];
  const reviews = [];

  for (let i = 0; i < 340; i += 1) {
    const offset = Math.floor(Math.pow(rand(), 1.35) * 420);
    const bookedKey = addDays(today, -offset);
    const travelKey = addDays(bookedKey, 10 + Math.floor(rand() * 50));
    const pool = [...PACKAGES.filter((p) => p.package_id !== "pkg_sikkim" && p.package_id !== "pkg_old"), LEGACY];
    const weights = [5, 3, 4, 3, 2, 2, 1];
    let pick = pool[pool.length - 1];
    const roll = rand() * weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    for (let k = 0; k < weights.length; k += 1) {
      acc += weights[k];
      if (roll <= acc) { pick = pool[k]; break; }
    }
    const travellers = 1 + Math.floor(rand() * 5);
    const amount = pick.price * travellers;
    const past = travelKey < today;

    let status;
    const r = rand();
    if (past) status = r < 0.1 ? "cancelled" : "completed";
    else status = r < 0.15 ? "cancelled" : r < 0.35 ? "pending" : "confirmed";

    let payment = "paid";
    let refund = 0;
    if (status === "pending") payment = rand() < 0.6 ? "unpaid" : "paid";
    if (status === "cancelled") {
      refund = Math.round(amount * 0.85);
      payment = "refunded";
    }
    const commission = payment === "paid" || payment === "refunded" ? Math.round((amount - refund) * 0.12) : 0;
    const net = amount - refund - commission;
    let payoutStatus = "pending";
    if (status === "completed") payoutStatus = rand() < 0.7 ? "paid" : "eligible";

    bookings.push({
      booking_id: `BK${String(10000 + i)}`,
      package_id: pick.package_id,
      package_name: i === 7 ? null : pick.title,
      booked_at: `${bookedKey}T12:00:00`,
      travel_date: travelKey,
      travellers,
      total_amount: amount,
      commission_amount: commission,
      refund_amount: refund,
      vendor_earning: payment === "paid" || payment === "refunded" ? net : 0,
      status: i === 11 ? "on-hold-review" : status, // an unmapped status on purpose
      payment_status: payment,
      payout_status: payoutStatus,
      customer_id: `cust_${Math.floor(rand() * 150)}`,
    });

    if (status === "completed" && rand() < 0.6) {
      const w = rand();
      reviews.push({
        review_id: `RV${reviews.length + 1}`,
        package_id: pick.package_id,
        rating: w < 0.5 ? 5 : w < 0.8 ? 4 : w < 0.93 ? 3 : w < 0.98 ? 2 : 1,
        comment: COMMENTS[Math.floor(rand() * COMMENTS.length)],
        created_at: `${addDays(travelKey, 3)}T12:00:00`,
      });
    }
  }

  // Payouts: one per month for completed+paid vendor earnings, plus one in-process payout.
  const byMonth = new Map();
  bookings
    .filter((b) => b.payout_status === "paid")
    .forEach((b) => {
      const m = b.travel_date.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + b.vendor_earning);
    });
  const payouts = [...byMonth.entries()].map(([month, amount], idx) => {
    const d = new Date(Number(month.slice(0, 4)), Number(month.slice(5)), 5);
    return {
      payout_id: `PO${2000 + idx}`,
      payout_date: toKey(d),
      amount,
      status: toKey(d) <= today ? "paid" : "processing",
      reference: `UTR${700000 + idx * 137}`,
    };
  });

  return { bookings, reviews, payouts, packages: PACKAGES.map(({ price, ...p }) => p) };
}

let cache;
const data = () => (cache ??= build());
const delay = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("Aborted", "AbortError")); });
  });

const KEY = { bookingDate: (b) => b.booked_at.slice(0, 10), travelDate: (b) => b.travel_date };

export const mockApi = {
  async bookings({ from, to, dateField }, signal) {
    await delay(350, signal);
    return data().bookings.filter((b) => inRange(KEY[dateField](b), { from, to }));
  },
  async payouts({ from, to }, signal) {
    await delay(250, signal);
    return data().payouts.filter((p) => inRange(p.payout_date, { from, to }));
  },
  async reviews({ from, to }, signal) {
    await delay(250, signal);
    return data().reviews.filter((r) => inRange(r.created_at.slice(0, 10), { from, to }));
  },
  async packages(signal) {
    await delay(150, signal);
    return data().packages;
  },
};
