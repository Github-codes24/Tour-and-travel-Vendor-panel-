import { Star } from "lucide-react";
import { formatDate, formatNumber, formatPercent, formatRating } from "../../../utils/formatters";
import { Card, EmptyState, Section } from "./ui";

const Stat = ({ label, value, hint }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    {hint && <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{hint}</p>}
  </div>
);

export default function CustomerTripReports({ report, packageName }) {
  const { trips, repeat, ratings } = report;
  const max = Math.max(1, ...ratings.distribution.map((d) => d.count));
  return (
    <Section id="customers" title="Customer & trip reports" description="Trips use travel date. No customer names or contact details are shown.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Total travellers" value={formatNumber(trips.travellers)} hint="Trips with travel dates in the period, excl. cancelled" />
        <Stat label="Upcoming trips" value={formatNumber(trips.upcoming)} hint="Confirmed, next 90 days (ignores the period)" />
        <Stat label="Completed trips" value={formatNumber(trips.completed)} hint="Travel date in the period" />
        <Stat label="Trip cancellation rate" value={formatPercent(trips.cancellationRate)} hint="Cancelled ÷ all trips in the period" />
        <Stat
          label="Repeat customers"
          value={repeat.available ? (repeat.rate === null ? "—" : formatPercent(repeat.rate)) : "Unavailable"}
          hint={repeat.available ? `${repeat.repeat} of ${repeat.unique} customers booked 2+ times in this period` : "Customer reference missing from booking data"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2" title="Customer ratings" subtitle={packageName}>
          {!report.ratingsAvailable ? (
            <p className="py-8 text-center text-sm text-gray-500" role="status">
              Review records are not connected to this Vendor Panel data source.
            </p>
          ) : ratings.count === 0 ? <EmptyState compact title="No reviews" hint="No reviews in this period." /> : (
            <>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-gray-900">{formatRating(ratings.average)}</span>
                <span className="text-sm text-gray-500">/ 5 · {formatNumber(ratings.count)} reviews</span>
              </div>
              <ul className="space-y-2">
                {ratings.distribution.map((d) => (
                  <li key={d.star} className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex w-8 items-center gap-0.5">{d.star}<Star size={11} className="fill-amber-400 text-amber-400" /></span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(d.count / max) * 100}%` }} /></div>
                    <span className="w-6 text-right tabular-nums">{d.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
        <Card className="lg:col-span-3" title="Recent feedback">
          {!report.ratingsAvailable ? (
            <p className="py-8 text-center text-sm text-gray-500" role="status">
              Review records are not connected to this Vendor Panel data source.
            </p>
          ) : ratings.recent.length === 0 ? <EmptyState compact title="No written feedback" hint="Reviews with comments appear here." /> : (
            <ul className="divide-y divide-gray-100">
              {ratings.recent.map((r) => (
                <li key={r.id || `${r.date}-${r.comment}`} className="py-3 first:pt-0 last:pb-0">
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={12} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />)}</span>
                    <span className="ml-1">{formatDate(r.date)}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Section>
  );
}
