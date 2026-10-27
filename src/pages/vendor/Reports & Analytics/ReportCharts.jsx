import { BarChart, DonutChart, HBarChart } from "./Charts";
import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { Card } from "./ui";

const STATUS_TONES = {
  confirmed: ["stroke-emerald-500", "bg-emerald-500"],
  pending: ["stroke-amber-500", "bg-amber-500"],
  completed: ["stroke-blue-500", "bg-blue-500"],
  cancelled: ["stroke-rose-500", "bg-rose-500"],
  unknown: ["stroke-gray-400", "bg-gray-400"],
};

export default function ReportCharts({ report }) {
  const statusSegments = report.statusBreakdown.map((item) => ({
    label: item.status[0].toUpperCase() + item.status.slice(1),
    value: item.count,
    stroke: STATUS_TONES[item.status][0],
    dot: STATUS_TONES[item.status][1],
  }));
  const topPackages = [...report.packages.rows]
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 6)
    .map((item) => ({
      key: item.key,
      label: item.name,
      value: item.bookings,
    }));

  return (
    <section aria-label="Report charts" className="grid gap-4 xl:grid-cols-2">
      <Card title="Monthly bookings" subtitle="By booking date">
        <BarChart
          label="Monthly bookings"
          data={report.monthly.map((item) => ({
            key: item.key,
            label: item.label,
            title: item.title,
            value: item.bookings,
          }))}
          format={formatNumber}
        />
      </Card>
      <Card
        title="Monthly earnings"
        subtitle="Net vendor earnings; unavailable without recorded commission and adjustments"
      >
        {report.finance.net === null ? (
          <p className="py-12 text-center text-sm text-gray-500" role="status">
            Earnings chart unavailable until payment, commission, and refund
            data are recorded.
          </p>
        ) : (
          <BarChart
            label="Monthly net vendor earnings"
            data={report.monthly.map((item) => ({
              key: item.key,
              label: item.label,
              title: item.title,
              value: item.net ?? 0,
            }))}
            format={formatCurrency}
          />
        )}
      </Card>
      <Card title="Booking status breakdown" subtitle="Bookings by status">
        <DonutChart
          segments={statusSegments}
          centerValue={formatNumber(report.stats.total)}
          centerLabel="bookings"
          format={formatNumber}
        />
      </Card>
      <Card title="Top-performing packages" subtitle="By non-cancelled bookings">
        <HBarChart data={topPackages} format={formatNumber} />
      </Card>
    </section>
  );
}
