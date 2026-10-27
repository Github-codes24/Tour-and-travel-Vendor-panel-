import { useMemo, useState } from "react";
import { GRANULARITIES, PAGE_SIZE } from "../../../utils/reportsConfig";
import { formatDate, formatCurrency, formatNumber, formatPercent } from "../../../utils/formatters";
import { HBarChart, LineChart } from "./Charts";
import { Card, DataTable, EmptyState, Pagination, Section, StatusBadge } from "./ui";

const Stat = ({ label, value, hint }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const COLUMNS = [
  { header: "Booking ID", render: (b) => <span className="font-medium text-gray-900">{b.id}</span> },
  { header: "Package", render: (b) => b.packageName ?? "Unavailable package" },
  { header: "Booking date", render: (b) => formatDate(b.bookingDate) },
  { header: "Travel date", render: (b) => formatDate(b.travelDate) },
  { header: "Travellers", align: "right", render: (b) => formatNumber(b.travellers) },
  { header: "Amount", align: "right", render: (b) => formatCurrency(b.amount) },
  { header: "Status", render: (b) => <StatusBadge status={b.status} /> },
];

export default function BookingReports({ report, onGranularity, page, onPage }) {
  const s = report.stats;
  const rows = report.bookingRows;
  const pageRows = useMemo(() => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [rows, page]);
  const [metric, setMetric] = useState("bookings");

  const packageCounts = useMemo(
    () => report.packages.rows.filter((p) => p.bookings > 0).sort((a, b) => b.bookings - a.bookings).map((p) => ({ key: p.key, label: p.name, value: p.bookings })),
    [report],
  );

  return (
    <Section id="booking-reports" title="Booking reports" description="Based on booking date. Cancelled bookings are excluded from traveller counts.">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <Stat label="Total bookings" value={formatNumber(s.total)} />
        <Stat label="Confirmed" value={formatNumber(s.confirmed)} />
        <Stat label="Pending" value={formatNumber(s.pending)} />
        <Stat label="Completed trips" value={formatNumber(s.completed)} />
        <Stat label="Cancelled" value={formatNumber(s.cancelled)} />
        <Stat label="Total travellers" value={formatNumber(s.travellers)} hint="Excludes cancelled" />
        <Stat label="Cancellation rate" value={formatPercent(s.cancellationRate)} hint="Cancelled ÷ total" />
      </div>
      {s.unknown > 0 && <p className="text-xs text-amber-700">{s.unknown} booking(s) have a status this report doesn't recognise (shown as “Unknown”).</p>}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Booking trends"
          subtitle={`Grouped ${GRANULARITIES.find((g) => g.id === report.meta.granularity).label.toLowerCase()}`}
          action={
            <div className="flex flex-wrap gap-1" role="group" aria-label="Trend interval">
              <div className="mr-2 flex gap-1" role="group" aria-label="Trend metric">
                {[["bookings", "Bookings"], ["travellers", "Travellers"]].map(([id, label]) => (
                  <button key={id} aria-pressed={metric === id} onClick={() => setMetric(id)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${metric === id ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{label}</button>
                ))}
              </div>
              {GRANULARITIES.map((g) => (
                <button key={g.id} aria-pressed={report.meta.granularity === g.id} onClick={() => onGranularity(g.id)} className={`rounded-md px-2.5 py-1 text-xs font-medium ${report.meta.granularity === g.id ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{g.label}</button>
              ))}
            </div>
          }
        >
          <LineChart
            label={`${metric} trend`}
            data={report.trend.map((t) => ({ key: t.key, label: t.label, title: t.title, value: t[metric] }))}
            format={formatNumber}
          />
        </Card>
        <Card title="Bookings by package" subtitle="Non-cancelled bookings">
          <HBarChart data={packageCounts.slice(0, 8)} format={formatNumber} />
        </Card>
      </div>

      <Card title="Booking details" subtitle={`${formatNumber(rows.length)} booking${rows.length === 1 ? "" : "s"} match the current filters`}>
        {rows.length === 0 ? (
          <EmptyState title="No bookings found" hint="No bookings match the selected period and filters." />
        ) : (
          <>
            <DataTable caption="Bookings" columns={COLUMNS} rows={pageRows} rowKey={(b, i) => `${b.id}-${i}`} />
            <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={onPage} />
          </>
        )}
      </Card>
    </Section>
  );
}
