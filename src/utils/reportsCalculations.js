/**
 * Pure analytics. No React, no I/O. The dashboard AND the PDF/Excel exports consume the single
 * object returned by buildReport(), which guarantees they always show the same numbers.
 *
 * DATE-FIELD RULES (never mixed silently)
 *  - Booking statistics, trends, package performance, earnings, repeat customers → BOOKING date
 *  - Trips (travellers, completed, trip cancellation rate)                       → TRAVEL date
 *  - Upcoming trips = confirmed bookings travelling today … +90 days. This is a point-in-time
 *    metric: it ignores the reporting period (a period ending today can never contain future
 *    travel dates) and honours only the package filter.
 *  - Payout history and "Paid payouts"                                           → PAYOUT date
 *  - Ratings and feedback                                                        → REVIEW date
 *  All ranges are inclusive. "Previous period" = equal-length window right before the selection.
 *
 * FINANCIAL RULES
 *  - A booking counts toward earnings only if its payment was received (paymentStatus paid/refunded).
 *    Unpaid, partially paid and unknown-payment bookings are excluded and reported as `excluded`.
 *  - Total booking value = Σ amount of counted bookings. It is NOT vendor income.
 *  - Platform commission = Σ recorded commission. If any counted booking lacks it → unavailable.
 *  - Refunds & deductions = Σ recorded refund amounts.
 *  - Net vendor earnings = Σ per-booking net, where per-booking net is the backend's `vendor_earning`
 *    when supplied, otherwise amount − commission − refund. If any counted booking can't be
 *    resolved → unavailable (never guessed).
 *  - Eligible payout / awaiting completion come from each booking's payout status. If the backend
 *    doesn't supply payout status → unavailable. Pending is NOT computed as earnings − paid.
 *  - Paid payouts = Σ payout records with status paid, by payout date.
 */
import { bucketIndex, buildBuckets, inRange, pickGranularity, previousRange } from "./dateUtils";


export const sum = (items, fn) => items.reduce((t, x) => t + (fn(x) ?? 0), 0);

/** % change vs previous. Null when no meaningful baseline (previous missing or zero). */
export const pctChange = (current, previous) =>
  current === null || current === undefined || previous === null || previous === undefined || previous === 0
    ? null
    : ((current - previous) / Math.abs(previous)) * 100;

export const packageKeyOf = (b) => b.packageId ?? (b.packageName ? `name:${b.packageName}` : "unknown");

export function filterBookings(bookings, { status = "all", packageId = "all" }) {
  return bookings.filter(
    (b) => (status === "all" || b.status === status) && (packageId === "all" || packageKeyOf(b) === packageId),
  );
}

/* ------------------------------ bookings ------------------------------ */

export function computeBookingStats(bookings) {
  const by = { confirmed: 0, pending: 0, completed: 0, cancelled: 0, unknown: 0 };
  bookings.forEach((b) => { by[b.status] += 1; });
  const total = bookings.length;
  return {
    total,
    ...by,
    // Travellers on bookings that are not cancelled.
    travellers: sum(bookings.filter((b) => b.status !== "cancelled"), (b) => b.travellers),
    cancellationRate: total ? (by.cancelled / total) * 100 : null,
  };
}

function groupByBucket(items, dateOf, buckets) {
  const groups = buckets.map(() => []);
  items.forEach((item) => {
    const i = bucketIndex(buckets, dateOf(item));
    if (i >= 0) groups[i].push(item);
  });
  return groups;
}

/* ------------------------------ finance ------------------------------ */

const netOf = (b) =>
  b.netEarning ??
  (b.commission !== null && b.refund !== null
    ? (b.amount ?? 0) - b.commission - b.refund
    : null);

export function computeFinance(bookings) {
  const paymentDataComplete = bookings.every((b) => b.paymentStatus !== "unknown");
  const received = bookings.filter((b) => b.paymentStatus === "paid" || b.paymentStatus === "refunded");
  const payable = received.filter((b) => b.paymentStatus === "paid" && b.status !== "cancelled");
  const nets = payable.map(netOf);
  const netKnown = nets.every((n) => n !== null);
  const commissionKnown = received.every((b) => b.commission !== null);
  const refundsKnown = received.every((b) => b.refund !== null);
  const payoutKnown = payable.every((b) => b.payoutStatus !== "unknown");

  const sumNetWhere = (status) =>
    payable.reduce((t, b, i) => (b.payoutStatus === status ? t + nets[i] : t), 0);

  return {
    countedBookings: payable.length,
    excludedBookings: bookings.length - payable.length,
    bookingValue: paymentDataComplete ? sum(received, (b) => b.amount) : null,
    commission: paymentDataComplete && commissionKnown ? sum(received, (b) => b.commission) : null,
    refunds: paymentDataComplete && refundsKnown ? sum(received, (b) => b.refund) : null,
    net: paymentDataComplete && netKnown ? nets.reduce((a, n) => a + n, 0) : null,
    eligible: paymentDataComplete && payoutKnown && netKnown ? sumNetWhere("eligible") : null,
    awaitingCompletion: paymentDataComplete && payoutKnown && netKnown ? sumNetWhere("pending") : null,
  };
}

/* ------------------------------ packages ------------------------------ */

function computePackagePerformance({ bookings, packages, reviews, buckets }) {
  const rows = new Map();
  packages.forEach((p) => rows.set(p.id, { key: p.id, name: p.name, status: p.status, removed: false, items: [] }));

  bookings.forEach((b) => {
    const key = packageKeyOf(b);
    if (!rows.has(key)) {
      rows.set(key, {
        key,
        name: b.packageName ? `${b.packageName} (unavailable)` : "Unavailable package",
        status: "inactive",
        removed: true,
        items: [],
      });
    }
    rows.get(key).items.push(b);
  });

  const reviewsByPkg = new Map();
  reviews.forEach((r) => {
    if (r.packageId === null) return;
    reviewsByPkg.set(r.packageId, [...(reviewsByPkg.get(r.packageId) ?? []), r]);
  });

  return [...rows.values()].map((row) => {
    const live = row.items.filter((b) => b.status !== "cancelled"); // cancelled bookings don't count as "booked"
    const fin = computeFinance(live);
    const rv = reviewsByPkg.get(row.key) ?? [];
    return {
      key: row.key,
      name: row.name,
      status: row.status,
      removed: row.removed,
      bookings: live.length,
      cancelled: row.items.length - live.length,
      travellers: sum(live, (b) => b.travellers),
      bookingValue: fin.bookingValue,
      netEarnings: fin.net,
      avgRating: rv.length ? sum(rv, (r) => r.rating) / rv.length : null,
      reviewCount: rv.length,
      trend: groupByBucket(live, (b) => b.bookingDate, buckets).map((g) => g.length),
    };
  });
}

/* ------------------------------ customers & ratings ------------------------------ */

/** Repeat customer = same customerKey on 2+ non-cancelled bookings made inside the selected period. */
export function computeRepeatCustomers(bookings, customerIdsAvailable = true) {
  if (!customerIdsAvailable) {
    return { available: false, unique: 0, repeat: 0, rate: null };
  }

  const live = bookings.filter((b) => b.status !== "cancelled" && b.customerKey);
  if (!live.length) return { available: true, unique: 0, repeat: 0, rate: null };
  const counts = new Map();
  live.forEach((b) => counts.set(b.customerKey, (counts.get(b.customerKey) ?? 0) + 1));
  const unique = counts.size;
  const repeat = [...counts.values()].filter((n) => n >= 2).length;
  return { available: true, unique, repeat, rate: (repeat / unique) * 100 };
}

export function computeRatings(reviews) {
  const count = reviews.length;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length }));
  return {
    count,
    average: count ? sum(reviews, (r) => r.rating) / count : null,
    distribution,
    recent: [...reviews]
      .filter((r) => r.comment)
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
      .slice(0, 5),
  };
}

/* ------------------------------ main builder ------------------------------ */

export function buildReport({ data, range, filters, granularity, vendorName, today }) {
  const prevRange = previousRange(range);
  const gran = granularity ?? pickGranularity(range);
  const buckets = buildBuckets(range, gran);
  const monthBuckets = buildBuckets(range, "month");

  const packageOptions = (() => {
    const map = new Map(data.packages.map((p) => [p.id, p.name]));
    [...data.bookings, ...data.trips].forEach((b) => {
      const k = packageKeyOf(b);
      if (!map.has(k)) map.set(k, b.packageName ? `${b.packageName} (unavailable)` : "Unavailable package");
    });
    return [...map.entries()].map(([id, label]) => ({ id, label }));
  })();

  const scoped = filterBookings(data.bookings, filters);
  const current = scoped.filter((b) => inRange(b.bookingDate, range));
  const previous = scoped.filter((b) => inRange(b.bookingDate, prevRange));

  const stats = computeBookingStats(current);
  const prevStats = computeBookingStats(previous);
  const finance = computeFinance(current);
  const prevFinance = computeFinance(previous);

  const scopedReviews = data.reviews.filter((r) => filters.packageId === "all" || r.packageId === filters.packageId);
  const reviewsNow = scopedReviews.filter((r) => inRange(r.date, range));
  const reviewsPrev = scopedReviews.filter((r) => inRange(r.date, prevRange));
  const ratings = computeRatings(reviewsNow);
  const prevRatings = computeRatings(reviewsPrev);
  const ratingsAvailable = data.availability?.reviews ?? true;

  // Trend + monthly series
  const groups = groupByBucket(current, (b) => b.bookingDate, buckets);
  const trend = buckets.map((bk, i) => ({
    ...bk,
    bookings: groups[i].length,
    travellers: sum(groups[i].filter((b) => b.status !== "cancelled"), (b) => b.travellers),
  }));
  const earningsHistory = buckets.map((bk, i) => ({ ...bk, bookings: groups[i].length, ...computeFinance(groups[i]) }));
  const monthGroups = groupByBucket(current, (b) => b.bookingDate, monthBuckets);
  const monthly = monthBuckets.map((bk, i) => {
    const f = computeFinance(monthGroups[i]);
    return { ...bk, bookings: monthGroups[i].length, bookingValue: f.bookingValue, net: f.net };
  });

  // Packages
  const pkgScope = data.packages.filter((p) => filters.packageId === "all" || p.id === filters.packageId);
  const packageRows = computePackagePerformance({ bookings: current, packages: pkgScope, reviews: reviewsNow, buckets });
  const rankable = packageRows.filter((p) => p.status === "active" && !p.removed);
  const mostBooked = [...rankable].sort((a, b) => b.bookings - a.bookings).filter((p) => p.bookings > 0).slice(0, 5);
  const leastBooked = [...rankable].sort((a, b) => a.bookings - b.bookings).slice(0, 5);

  // Payouts (by payout date)
  const payoutRows = (data.payouts || []).filter((p) => inRange(p.date, range)).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  const payoutTotals = (status) => sum(payoutRows.filter((p) => p.status === status), (p) => p.amount);
  const payouts = {
    rows: payoutRows,
    available: data.availability?.payouts ?? true,
    paid: data.availability?.payouts === false ? null : payoutTotals("paid"),
    inProcess: data.availability?.payouts === false ? null : payoutTotals("processing") + payoutTotals("pending"),
    byStatus: ["paid", "processing", "pending", "failed", "unknown"].map((s) => ({
      status: s,
      count: payoutRows.filter((p) => p.status === s).length,
      amount: payoutTotals(s),
    })),
  };

  // Trips (by travel date)
  const trips = filterBookings(data.trips, filters).filter((b) => inRange(b.travelDate, range));
  const tripStats = computeBookingStats(trips);
  const tripReport = {
    total: trips.length,
    travellers: tripStats.travellers,
    upcoming: data.upcoming.filter(
      (b) => b.status === "confirmed" && b.travelDate >= today && (filters.packageId === "all" || packageKeyOf(b) === filters.packageId),
    ).length,
    completed: tripStats.completed,
    cancellationRate: tripStats.cancellationRate,
  };

  const bookingRows = [...current].sort(
    (a, b) => (b.bookingDate ?? "").localeCompare(a.bookingDate ?? "") || b.id.localeCompare(a.id),
  );

  const nameOf = (id) => packageOptions.find((p) => p.id === id)?.label ?? "Package";

  return {
    meta: {
      vendorName,
      range,
      prevRange,
      granularity: gran,
      filters,
      filterLabels: {
        status: filters.status === "all" ? "All statuses" : filters.status,
        package: filters.packageId === "all" ? "All packages" : nameOf(filters.packageId),
      },
      generatedAt: new Date().toISOString(),
    },
    packageOptions,
    overview: {
      totalBookings: { value: stats.total, change: pctChange(stats.total, prevStats.total) },
      totalEarnings: { value: finance.net, change: pctChange(finance.net, prevFinance.net) },
      activePackages: { value: data.packages.filter((p) => p.status === "active").length, change: null },
      avgRating: {
        value: ratingsAvailable ? ratings.average : null,
        count: ratings.count,
        change: ratingsAvailable ? pctChange(ratings.average, prevRatings.average) : null,
      },
    },
    stats,
    prevStats,
    trend,
    monthly,
    statusBreakdown: ["confirmed", "pending", "completed", "cancelled", "unknown"].map((s) => ({ status: s, count: stats[s] })),
    bookingRows,
    finance,
    earningsHistory,
    payouts,
    ratingsAvailable,
    packages: { rows: packageRows, mostBooked, leastBooked },
    trips: tripReport,
    repeat: computeRepeatCustomers(
      current,
      data.bookings.length > 0 && data.bookings.every((booking) => booking.customerKey),
    ),
    ratings,
    isEmpty: current.length === 0 && payoutRows.length === 0 && trips.length === 0,
  };
}
