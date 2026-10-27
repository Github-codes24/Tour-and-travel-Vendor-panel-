export const MAX_CUSTOM_RANGE_DAYS = 366;
export const PAGE_SIZE = 10;

export const PRESETS = [
  { id: "today", label: "Today" },
  { id: "last7", label: "Last 7 days" },
  { id: "thisMonth", label: "This month" },
  { id: "lastMonth", label: "Last month" },
  { id: "custom", label: "Custom range" },
];

export const GRANULARITIES = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
];

export const STATUS_META = {
  confirmed: { label: "Confirmed", badge: "bg-emerald-50 text-emerald-700" },
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  completed: { label: "Completed", badge: "bg-blue-50 text-blue-700" },
  cancelled: { label: "Cancelled", badge: "bg-rose-50 text-rose-700" },
  unknown: { label: "Unknown", badge: "bg-gray-100 text-gray-600" },
};

export const PAYOUT_STATUS_META = {
  paid: { label: "Paid", badge: "bg-emerald-50 text-emerald-700" },
  processing: { label: "Processing", badge: "bg-blue-50 text-blue-700" },
  pending: { label: "Pending", badge: "bg-amber-50 text-amber-700" },
  failed: { label: "Failed", badge: "bg-rose-50 text-rose-700" },
  unknown: { label: "Unknown", badge: "bg-gray-100 text-gray-600" },
};
