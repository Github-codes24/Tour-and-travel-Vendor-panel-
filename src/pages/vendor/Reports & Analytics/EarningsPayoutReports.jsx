import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "../../../utils/formatters";
import { BarChart } from "./Charts";
import {
  Card,
  DataTable,
  EmptyState,
  PayoutBadge,
  Section,
} from "./ui";

function Metric({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  );
}

export default function EarningsPayoutReports({ report }) {
  const { finance, payouts } = report;
  const earningsRows = report.earningsHistory;
  const columns = [
    { header: "Period", render: (row) => row.title },
    { header: "Bookings", align: "right", render: (row) => formatNumber(row.bookings) },
    { header: "Booking value", align: "right", render: (row) => formatCurrency(row.bookingValue) },
    { header: "Commission", align: "right", render: (row) => formatCurrency(row.commission) },
    { header: "Refunds", align: "right", render: (row) => formatCurrency(row.refunds) },
    { header: "Net vendor earnings", align: "right", render: (row) => formatCurrency(row.net) },
  ];
  const payoutColumns = [
    { header: "Payout ID", render: (row) => row.id },
    { header: "Payout date", render: (row) => formatDate(row.date) },
    { header: "Reference", render: (row) => row.reference || "—" },
    { header: "Amount", align: "right", render: (row) => formatCurrency(row.amount) },
    { header: "Status", render: (row) => <PayoutBadge status={row.status} /> },
  ];

  return (
    <Section
      id="earnings"
      title="Earnings & payout reports"
      description="Booking value is not vendor income. Earnings count only records with received payment and supported commission/adjustment data."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <Metric label="Total booking value" value={formatCurrency(finance.bookingValue)} hint="Paid or refunded bookings only" />
        <Metric label="Platform commission" value={formatCurrency(finance.commission)} hint="Unavailable if commission is missing" />
        <Metric label="Refunds & adjustments" value={formatCurrency(finance.refunds)} hint="Recorded refunds only" />
        <Metric label="Net vendor earnings" value={formatCurrency(finance.net)} hint="After recorded commission and refunds" />
        <Metric label="Paid payouts" value={formatCurrency(payouts.paid)} hint="By payout date" />
        <Metric label="Payouts in process" value={formatCurrency(payouts.inProcess)} hint="Pending or processing payouts" />
        <Metric label="Eligible for payout" value={formatCurrency(finance.eligible)} hint="Backend payout eligibility status required" />
        <Metric label="Awaiting trip completion" value={formatCurrency(finance.awaitingCompletion)} hint="Calculated only from recorded payout status" />
      </div>

      {finance.excludedBookings > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {formatNumber(finance.excludedBookings)} booking(s) were excluded from payable earnings because they are unpaid, refunded, cancelled, or have no confirmed payment record.
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Earnings history" subtitle="By booking date">
          {finance.net === null ? (
            <p className="py-12 text-center text-sm text-gray-500" role="status">
              Earnings history is unavailable because commission or refund records are missing.
            </p>
          ) : earningsRows.length === 0 ? (
            <EmptyState compact title="No earnings history" hint="No bookings match this reporting period." />
          ) : (
            <BarChart
              label="Earnings history"
              data={earningsRows.map((row) => ({
                key: row.key,
                label: row.label,
                title: row.title,
                value: row.net ?? 0,
              }))}
              format={formatCurrency}
            />
          )}
        </Card>
        <Card title="Payout transaction history" subtitle="Filtered by payout date">
          {!payouts.available ? (
            <p className="py-12 text-center text-sm text-gray-500" role="status">
              Payout records are not connected to this Vendor Panel data source.
            </p>
          ) : payouts.rows.length === 0 ? (
            <EmptyState compact title="No payouts found" hint="No payout transactions match this date range." />
          ) : (
            <DataTable
              caption="Payout transactions"
              columns={payoutColumns}
              rows={payouts.rows}
              rowKey={(row) => row.id}
            />
          )}
        </Card>
      </div>

      <Card title="Earnings detail" subtitle="Full selected period; not limited by visible booking table pagination">
        {earningsRows.length === 0 ? (
          <EmptyState compact title="No earnings history" hint="No bookings match this reporting period." />
        ) : (
          <DataTable
            caption="Earnings history by period"
            columns={columns}
            rows={earningsRows}
            rowKey={(row) => row.key}
          />
        )}
      </Card>
    </Section>
  );
}
