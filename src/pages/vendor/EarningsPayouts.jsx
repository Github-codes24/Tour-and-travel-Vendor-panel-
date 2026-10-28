import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Clock3,
  CheckCircle2,
  Search,
  Download,
  Eye,
  X,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  FileText,
  CircleAlert,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const initialTransactions = [
  {
    id: "PAY-2026-001",
    bookingId: "BK-2041",
    customer: "Aarav Patil",
    packageName: "Goa Beach Holiday",
    date: "2026-10-25",
    amount: 25998,
    commission: 2600,
    netAmount: 23398,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829103456",
  },
  {
    id: "PAY-2026-002",
    bookingId: "BK-2042",
    customer: "Priya Deshmukh",
    packageName: "Kerala Backwater Escape",
    date: "2026-10-24",
    amount: 38997,
    commission: 3900,
    netAmount: 35097,
    method: "Bank Transfer",
    status: "Pending",
    reference: "Pending",
  },
  {
    id: "PAY-2026-003",
    bookingId: "BK-2038",
    customer: "Rohan Kulkarni",
    packageName: "Manali Mountain Retreat",
    date: "2026-10-22",
    amount: 31998,
    commission: 3200,
    netAmount: 28798,
    method: "Bank Transfer",
    status: "Processing",
    reference: "UTR829103111",
  },
  {
    id: "PAY-2026-004",
    bookingId: "BK-2033",
    customer: "Sneha Joshi",
    packageName: "Rajasthan Heritage Tour",
    date: "2026-10-20",
    amount: 19998,
    commission: 2000,
    netAmount: 17998,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829102678",
  },
  {
    id: "PAY-2026-005",
    bookingId: "BK-2028",
    customer: "Karan Mehta",
    packageName: "Goa Beach Holiday",
    date: "2026-10-18",
    amount: 12999,
    commission: 1300,
    netAmount: 11699,
    method: "Bank Transfer",
    status: "Failed",
    reference: "Not generated",
  },
  {
    id: "PAY-2026-006",
    bookingId: "BK-2021",
    customer: "Neha Sharma",
    packageName: "Kerala Backwater Escape",
    date: "2026-10-15",
    amount: 25998,
    commission: 2600,
    netAmount: 23398,
    method: "Bank Transfer",
    status: "Paid",
    reference: "UTR829101934",
  },
];

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Processing: "bg-blue-50 text-blue-700 ring-blue-200",
  Failed: "bg-red-50 text-red-700 ring-red-200",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Returns e.g. [1, "...", 4, 5, 6, "...", 12]
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);

  return pages;
}

function StatCard({ icon: Icon, label, amount, helper, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {formatMoney(amount)}
          </p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function EarningsPayouts() {
  const [transactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const navigate = useNavigate();

  const totals = useMemo(() => {
    const paid = transactions.filter((item) => item.status === "Paid");
    const pending = transactions.filter((item) =>
      ["Pending", "Processing"].includes(item.status),
    );

    return {
      gross: transactions.reduce((sum, item) => sum + item.amount, 0),
      paid: paid.reduce((sum, item) => sum + item.netAmount, 0),
      pending: pending.reduce((sum, item) => sum + item.netAmount, 0),
      commission: transactions.reduce((sum, item) => sum + item.commission, 0),
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((item) => {
      const matchesSearch = [
        item.id,
        item.bookingId,
        item.customer,
        item.packageName,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const transactionDate = new Date(`${item.date}T00:00:00`);
      const now = new Date("2026-10-26T00:00:00");

      let matchesDate = true;

      if (dateFilter === "7 days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        matchesDate = transactionDate >= start && transactionDate <= now;
      }

      if (dateFilter === "30 days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        matchesDate = transactionDate >= start && transactionDate <= now;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, search, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );
  const displayedPage = Math.min(currentPage, totalPages);
  const pageTransactions = useMemo(
    () =>
      filteredTransactions.slice(
        (displayedPage - 1) * pageSize,
        displayedPage * pageSize,
      ),
    [filteredTransactions, displayedPage, pageSize],
  );

  const filtersActive =
    search.trim() !== "" || statusFilter !== "All" || dateFilter !== "All";

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("All");
    setCurrentPage(1);
  }

  function exportCSV() {
    const headers = [
      "Payout ID",
      "Booking ID",
      "Customer",
      "Package",
      "Date",
      "Gross Amount",
      "Commission",
      "Net Amount",
      "Method",
      "Status",
      "Reference",
    ];

    const rows = filteredTransactions.map((item) => [
      item.id,
      item.bookingId,
      item.customer,
      item.packageName,
      item.date,
      item.amount,
      item.commission,
      item.netAmount,
      item.method,
      item.status,
      item.reference,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "safar2you-earnings-payouts.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-700">
            Finance & Insights
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Earnings & Payouts
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track your earnings, platform commission and payout transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800"
        >
          <Download size={17} />
          Export Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Total Gross Bookings"
          amount={totals.gross}
          helper="Gross value in sample records"
          iconStyle="bg-violet-50 text-violet-700"
        />
        <StatCard
          icon={CheckCircle2}
          label="Net Payouts Paid"
          amount={totals.paid}
          helper="Net amount marked as paid"
          iconStyle="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          icon={Clock3}
          label="Pending Payouts"
          amount={totals.pending}
          helper="Pending and processing amounts"
          iconStyle="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Platform Commission"
          amount={totals.commission}
          helper="Commission in sample records"
          iconStyle="bg-blue-50 text-blue-700"
        />
      </div>

      {/* Payout account */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
              <Building2 size={23} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Payout Account</h2>
              <p className="mt-1 text-sm text-slate-500">
                Registered bank account for vendor settlements
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                HDFC Bank •••• 4821
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Account holder: Travel Vendor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:self-center">
            <CheckCircle2 size={14} />
            Verified
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500 sm:px-6">
          Demo account details only. Replace with the verified payout account
          returned by your backend.
        </div>
      </section>

      {/* Transaction history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payout Transactions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review payment settlements and transaction references.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-0 flex-1 sm:min-w-64">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search payout, booking, customer..."
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                aria-label="Filter by payout status"
              >
                <option value="All">All statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Failed">Failed</option>
              </select>

              <select
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500"
                aria-label="Filter by date"
              >
                <option value="All">All dates</option>
                <option value="7 days">Last 7 days</option>
                <option value="30 days">Last 30 days</option>
              </select>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-4 font-semibold">Payout / Booking</th>
                <th className="px-5 py-4 font-semibold">Customer & Package</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Gross Amount</th>
                <th className="px-5 py-4 font-semibold">Commission</th>
                <th className="px-5 py-4 font-semibold">Net Payout</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="whitespace-nowrap px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pageTransactions.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.id}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.bookingId}
                    </p>
                  </td>

                  <td className="max-w-64 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.customer}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.packageName}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatDate(item.date)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">
                    {formatMoney(item.amount)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatMoney(item.commission)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-900">
                    {formatMoney(item.netAmount)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        statusStyles[item.status]
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/vendor/earnings/${item.id}`)}
                      className="inline-flex min-w-[132px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold leading-none text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="px-5 py-14 text-center">
              <Filter size={30} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-800">
                No transactions found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
                >
                  <X size={15} />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <p>
                Showing{" "}
                <span className="font-semibold tabular-nums text-slate-800">
                  {(displayedPage - 1) * pageSize + 1}–
                  {Math.min(
                    displayedPage * pageSize,
                    filteredTransactions.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold tabular-nums text-slate-800">
                  {filteredTransactions.length}
                </span>{" "}
                transactions
                {filteredTransactions.length !== transactions.length && (
                  <span className="text-slate-400">
                    {" "}
                    (filtered from {transactions.length})
                  </span>
                )}
              </p>

              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <span className="relative">
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-9 appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </span>
              </label>
            </div>

            <nav
              className="flex flex-wrap items-center gap-1.5"
              aria-label="Pagination"
            >
              <button
                type="button"
                disabled={displayedPage === 1}
                onClick={() => setCurrentPage(displayedPage - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {getPageNumbers(displayedPage, totalPages).map((page, index) =>
                page === "..." ? (
                  <span
                    key={`dots-${index}`}
                    className="flex h-9 w-6 items-center justify-center text-sm text-slate-400"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === displayedPage ? "page" : undefined}
                    className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold tabular-nums transition ${
                      page === displayedPage
                        ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={displayedPage === totalPages}
                onClick={() => setCurrentPage(displayedPage + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          </div>
        )}
      </section>

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payout-details-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                  Payout Details
                </p>
                <h2
                  id="payout-details-title"
                  className="mt-2 text-xl font-bold text-slate-900"
                >
                  {selectedTransaction.id}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Booking {selectedTransaction.bookingId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                aria-label="Close payout details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Net payout amount</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatMoney(selectedTransaction.netAmount)}
                </p>
                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    statusStyles[selectedTransaction.status]
                  }`}
                >
                  {selectedTransaction.status}
                </span>
              </div>

              <div className="space-y-4">
                {[
                  ["Customer", selectedTransaction.customer],
                  ["Package", selectedTransaction.packageName],
                  ["Transaction date", formatDate(selectedTransaction.date)],
                  ["Gross amount", formatMoney(selectedTransaction.amount)],
                  [
                    "Platform commission",
                    formatMoney(selectedTransaction.commission),
                  ],
                  ["Payment method", selectedTransaction.method],
                  ["Transaction reference", selectedTransaction.reference],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                  >
                    <span className="text-sm text-slate-500">{label}</span>
                    <span className="max-w-[60%] break-words text-right text-sm font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {selectedTransaction.status === "Failed" && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <CircleAlert size={17} className="mt-0.5 shrink-0" />
                  This payout is marked failed in the sample data. Check the
                  payment provider before attempting another settlement.
                </div>
              )}

              {selectedTransaction.status === "Pending" && (
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                  <Clock3 size={17} className="mt-0.5 shrink-0" />
                  This payout is awaiting processing in the sample data.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}