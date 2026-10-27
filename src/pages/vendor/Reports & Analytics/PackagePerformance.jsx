import { formatCurrency, formatNumber, formatRating } from "../../../utils/formatters";
import { Sparkline } from "./Charts";
import { Card, DataTable, EmptyState, Section, Unavailable } from "./ui";

function RankList({ title, subtitle, items, empty }) {
  return (
    <Card title={title} subtitle={subtitle}>
      {items.length === 0 ? <EmptyState compact title={empty} hint="" /> : (
        <ol className="space-y-2.5">
          {items.map((p, i) => (
            <li key={p.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">{i + 1}</span>
                <span className="truncate text-gray-800" title={p.name}>{p.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-gray-600">{p.bookings === 0 ? "No bookings" : `${formatNumber(p.bookings)} booking${p.bookings === 1 ? "" : "s"}`}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function PackagePerformance({ report }) {
  const { rows, mostBooked, leastBooked } = report.packages;
  const columns = [
    { header: "Package", render: (p) => <span className="font-medium text-gray-900">{p.name}</span> },
    { header: "Status", render: (p) => (p.removed ? "Removed" : p.status === "active" ? "Active" : "Inactive") },
    { header: "Bookings", align: "right", render: (p) => formatNumber(p.bookings) },
    { header: "Travellers", align: "right", render: (p) => formatNumber(p.travellers) },
    { header: "Booking value", align: "right", render: (p) => formatCurrency(p.bookingValue) },
    { header: "Net earnings", align: "right", render: (p) => (p.netEarnings === null ? <Unavailable reason="Commission data missing" /> : formatCurrency(p.netEarnings)) },
    { header: "Avg rating", align: "right", render: (p) => (p.avgRating === null ? "—" : `${formatRating(p.avgRating)} (${p.reviewCount})`) },
    { header: "Trend", render: (p) => <Sparkline values={p.trend} label={`${p.name} booking trend`} /> },
  ];

  return (
    <Section id="packages" title="Package performance" description="Your packages only. Cancelled bookings are not counted; packages with no bookings are listed with zero.">
      <div className="grid gap-4 md:grid-cols-2">
        <RankList title="Most booked" subtitle="Active packages with bookings" items={mostBooked} empty="No bookings yet" />
        <RankList title="Least booked" subtitle="Active packages, including those with none" items={leastBooked} empty="No active packages" />
      </div>
      <Card title="All packages" subtitle="Booking value is what customers paid; net earnings is after commission and refunds">
        {rows.length === 0 ? <EmptyState compact title="No packages" hint="No packages match the current filters." /> : (
          <DataTable caption="Package performance" columns={columns} rows={[...rows].sort((a, b) => b.bookings - a.bookings)} rowKey={(p) => p.key} />
        )}
      </Card>
    </Section>
  );
}
