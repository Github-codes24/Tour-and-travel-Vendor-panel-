import { CalendarCheck, Package, Star, Wallet } from "lucide-react";
import { formatCurrency, formatNumber, formatRating } from "../../../utils/formatters";
import { Delta, Skeleton, Unavailable } from "./ui";

function Metric({ icon: Icon, label, definition, loading, children, change, showDelta = true }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <span className="rounded-lg bg-violet-50 p-2 text-violet-600"><Icon size={18} /></span>
      </div>
      {loading ? (
        <div className="mt-3 space-y-2"><Skeleton className="h-8 w-28" /><Skeleton className="h-3 w-40" /></div>
      ) : (
        <>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{children}</p>
          <p className="mt-1 text-xs text-gray-500">{definition}</p>
          {showDelta && <div className="mt-2"><Delta value={change} /></div>}
        </>
      )}
    </div>
  );
}

export default function OverviewCards({ report, loading }) {
  const o = report?.overview;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={CalendarCheck} label="Total bookings" loading={loading} change={o?.totalBookings.change} definition="All bookings made in the period, any status">
        {formatNumber(o?.totalBookings.value)}
      </Metric>
      <Metric icon={Wallet} label="Total earnings" loading={loading} change={o?.totalEarnings.change} definition="Paid booking earnings after recorded commission and refunds">
        {o?.totalEarnings.value === null ? <Unavailable reason="Commission or adjustment data is missing" /> : formatCurrency(o?.totalEarnings.value)}
      </Metric>
      <Metric icon={Package} label="Active packages" loading={loading} showDelta={false} definition="Live packages right now (not period-based)">
        {formatNumber(o?.activePackages.value)}
      </Metric>
      <Metric icon={Star} label="Average rating" loading={loading} change={o?.avgRating.change} definition={`${o?.avgRating.count ?? 0} review${o?.avgRating.count === 1 ? "" : "s"} in the period`}>
        {!report?.ratingsAvailable ? <Unavailable reason="Review data is not connected" /> : o?.avgRating.value === null ? <Unavailable reason="No reviews in this period" /> : `${formatRating(o?.avgRating.value)} / 5`}
      </Metric>
    </div>
  );
}
