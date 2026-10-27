/**
 * Data access for Reports & Analytics.
 *
 * IMPORTANT – verify before production:
 *  - `api` must be your existing authenticated Axios instance (token interceptor included).
 *  - REPORT_ENDPOINTS below is a PROPOSED contract. It was not verified against your backend:
 *    point each entry at your real endpoint, and adjust services/reportsAdapters.js if the
 *    response fields differ.
 *  - No vendor id is ever sent. The backend must derive the vendor from the auth token and
 *    scope every query itself. Frontend filtering is NOT authorization.
 */
import api from "../../../services/api"; // TODO: point to your existing API client
import { addDays, previousRange, todayKey } from "../utils/dateUtils";
import { adaptBooking, adaptPackage, adaptPayout, adaptReview, unwrapList } from "./reportsAdapters";

export const REPORT_ENDPOINTS = {
  bookings: "/vendor/reports/bookings", // params: from, to, dateField = bookingDate | travelDate
  payouts: "/vendor/reports/payouts", // params: from, to (filtered by payout date)
  reviews: "/vendor/reports/reviews", // params: from, to (filtered by review date)
  packages: "/vendor/packages", // the authenticated vendor's packages
};

/** Explicit opt-in, development builds only. Production builds can never enable it. */
export const UPCOMING_DAYS = 90;

export const IS_MOCK_MODE = import.meta.env.DEV && import.meta.env.VITE_REPORTS_USE_MOCK === "true";

const get = async (url, params, signal) => (await api.get(url, { params, signal })).data;

const liveApi = {
  bookings: (params, signal) => get(REPORT_ENDPOINTS.bookings, params, signal),
  payouts: (params, signal) => get(REPORT_ENDPOINTS.payouts, params, signal),
  reviews: (params, signal) => get(REPORT_ENDPOINTS.reviews, params, signal),
  packages: (signal) => get(REPORT_ENDPOINTS.packages, undefined, signal),
};

async function resolveSource() {
  if (IS_MOCK_MODE) return (await import("./reportsMockData")).mockApi; // dynamic: excluded from prod bundle
  return liveApi;
}

/**
 * Fetches everything one reporting period needs. Any failure rejects (no silent fallback).
 *  - bookings: by BOOKING date over [previous period start … range end] (current + comparison period)
 *  - trips:    by TRAVEL date over the selected range
 *  - upcoming: by TRAVEL date over the next UPCOMING_DAYS days (independent of the selected period)
 *  - payouts:  by PAYOUT date over the selected range
 *  - reviews:  by REVIEW date over [previous period start … range end]
 */
export async function loadReportData(range, signal) {
  const source = await resolveSource();
  const wide = { from: previousRange(range).from, to: range.to };

  const today = todayKey();
  const [bookings, trips, upcoming, payouts, reviews, packages] = await Promise.all([
    source.bookings({ ...wide, dateField: "bookingDate" }, signal),
    source.bookings({ ...range, dateField: "travelDate" }, signal),
    source.bookings({ from: today, to: addDays(today, UPCOMING_DAYS), dateField: "travelDate" }, signal),
    source.payouts(range, signal),
    source.reviews(wide, signal),
    source.packages(signal),
  ]);

  return {
    bookings: unwrapList(bookings).map(adaptBooking),
    trips: unwrapList(trips).map(adaptBooking),
    upcoming: unwrapList(upcoming).map(adaptBooking),
    payouts: unwrapList(payouts).map(adaptPayout),
    reviews: unwrapList(reviews).map(adaptReview).filter((r) => r.rating !== null),
    packages: unwrapList(packages).map(adaptPackage),
  };
}
