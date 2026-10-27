import { formatCurrency, formatNumber } from "../../../utils/formatters";
import { BarChart } from "./Charts";
import { Card, DataTable, EmptyState, Section, Unavailable } from "./ui";

export default function SalesReport({ report }) {
  const columns = [
    { header: "Period", render: (row) => row.title },
    { header: "Bookings", align: "right", render: (row) => formatNumber(row.bookings) },
    { header: "Booking value", align: "right", render: (row) => formatCurrency(row.bookingValue) },
  ];

  return (
    <Section
      id="sales"
      title="Sales report"
      description="Sales are measured as booking value, not vendor earnings. Booking date is used for the selected period."
    >
      <Card
        title="Booking value"
        subtitle="Sum of booking amounts for records with a known payment status"
      >
        {report.finance.bookingValue === null ? (
          <Unavailable reason="Payment status is missing for one or more bookings in this period" />
        ) : (
          <p className="text-2xl font-semibold text-gray-900">
            {formatCurrency(report.finance.bookingValue)}
          </p>
        )}
      </Card>

      <Card title="Sales trend" subtitle="Booking value grouped by month">
        {report.finance.bookingValue === null ? (
          <p className="py-12 text-center text-sm text-gray-500" role="status">
            Sales trend is unavailable because payment status is missing for
            one or more bookings.
          </p>
        ) : (
          <BarChart
            label="Monthly booking value"
            data={report.monthly.map((row) => ({
              key: row.key,
              label: row.label,
              title: row.title,
              value: row.bookingValue ?? 0,
            }))}
            format={formatCurrency}
          />
        )}
      </Card>

      <Card title="Sales by period">
        {report.monthly.length === 0 ? (
          <EmptyState compact title="No sales data" hint="No bookings match this reporting period." />
        ) : (
          <DataTable
            caption="Sales by month"
            columns={columns}
            rows={report.monthly}
            rowKey={(row) => row.key}
          />
        )}
      </Card>
    </Section>
  );
}
