
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Clock3,
  CheckCircle2,
  Plus,
  RefreshCw,
  LifeBuoy,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
} from "lucide-react";

import { getSupportTickets } from "../../../services/supportStorage";

const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-200",
  "Awaiting Vendor Response": "bg-purple-50 text-purple-700 ring-purple-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

const PRIORITY_STYLES = {
  High: "bg-red-500",
  Medium: "bg-amber-500",
  Low: "bg-emerald-500",
};

const STATUS_OPTIONS = Object.keys(STATUS_STYLES);
const PAGE_SIZES = [5, 10, 20];

function getDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getPageList(total, current) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set([1, total, current - 1, current, current + 1]);

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const result = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push("gap");
    }

    result.push(page);
  });

  return result;
}

function StatusBadge({ status }) {
  const normalizedStatus = status || "Open";

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        STATUS_STYLES[normalizedStatus] || STATUS_STYLES.Open
      }`}
    >
      {normalizedStatus}
    </span>
  );
}

function PriorityLabel({ priority }) {
  if (!priority) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-700">
      <span
        className={`h-2 w-2 rounded-full ${
          PRIORITY_STYLES[priority] || "bg-slate-400"
        }`}
      />
      {priority}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = getPageList(totalPages, page);

  const base =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${base} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50`}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${
              item === page
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${base} border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState(() => getSupportTickets());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  function refreshTickets() {
    setTickets(getSupportTickets());
    setPage(1);
  }

  useEffect(() => {
    function handleStorageChange() {
      refreshTickets();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalTickets: tickets.length,
      openTickets: tickets.filter(
        (ticket) => (ticket.status || "Open") === "Open",
      ).length,
      inProgressTickets: tickets.filter(
        (ticket) => ticket.status === "In Progress",
      ).length,
      resolvedTickets: tickets.filter(
        (ticket) => ticket.status === "Resolved",
      ).length,
    }),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tickets
      .filter((ticket) => {
        const matchesSearch =
          !term ||
          [
            ticket.subject,
            ticket.ticketId,
            ticket._id,
            ticket.id,
            ticket.category,
            ticket.description,
          ].some((value) =>
            String(value || "").toLowerCase().includes(term),
          );

        const matchesStatus =
          !statusFilter || (ticket.status || "Open") === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0).getTime() -
          new Date(a.updatedAt || a.createdAt || 0).getTime(),
      );
  }, [tickets, search, statusFilter]);

  const totalTickets = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalTickets / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleTickets = filteredTickets.slice(
    startIndex,
    startIndex + pageSize,
  );

  const hasFilters = Boolean(search.trim() || statusFilter);

  const cards = [
    {
      label: "Total Tickets",
      value: stats.totalTickets,
      icon: Ticket,
      iconClass: "bg-slate-100 text-slate-700",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      icon: LifeBuoy,
      iconClass: "bg-blue-50 text-blue-700",
    },
    {
      label: "In Progress",
      value: stats.inProgressTickets,
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Resolved Tickets",
      value: stats.resolvedTickets,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  return (
    <div className="w-full space-y-6 text-slate-900">
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-slate-500"
          >
            <span>Vendor Portal</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span>Support</span>
          </nav>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Support Center
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create requests and track updates from the support team.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/vendor/support/help"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <BookOpen size={16} />
            Help Center
          </Link>

          <Link
            to="/vendor/support/create"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Create Ticket
          </Link>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, iconClass }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
            </div>

            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
            >
              <Icon size={22} />
            </span>
          </div>
        ))}
      </div>

      {/* Ticket list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-semibold">Support Tickets</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Your requests and their current status.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshTickets}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:px-6">
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by subject, ID or category"
              aria-label="Search tickets"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 sm:w-56"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:self-auto"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {visibleTickets.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              {hasFilters ? <Search size={22} /> : <Ticket size={22} />}
            </span>

            <h3 className="mt-3 text-sm font-semibold">
              {hasFilters
                ? "No tickets match your filters"
                : "No support tickets yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {hasFilters
                ? "Try another search term or status."
                : "Create a ticket if you need help with your vendor account."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/vendor/support/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
              >
                <Plus size={16} />
                Create your first ticket
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Responsive table */}
            <div className="w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-[1000px] table-fixed text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-[23%] px-4 py-4">Ticket</th>
                    <th className="w-[17%] px-3 py-4">Category</th>
                    <th className="w-[10%] px-3 py-4">Priority</th>
                    <th className="w-[12%] px-3 py-4">Created</th>
                    <th className="w-[12%] px-3 py-4">Last updated</th>
                    <th className="w-[16%] px-3 py-4">Status</th>
                    <th className="w-[10%] px-3 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleTickets.map((ticket, index) => {
                    const id =
                      ticket.ticketId || ticket._id || ticket.id;

                    return (
                      <tr
                        key={id || index}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-4">
                          <p className="break-words font-medium text-slate-900">
                            {ticket.subject || "Untitled ticket"}
                          </p>
                          <p className="mt-0.5 break-all font-mono text-xs text-slate-500">
                            {id || "—"}
                          </p>
                        </td>

                        <td className="break-words px-3 py-4 text-slate-700">
                          {ticket.category || "—"}
                        </td>

                        <td className="px-3 py-4">
                          <PriorityLabel priority={ticket.priority} />
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                          {getDate(ticket.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                          {getDate(ticket.updatedAt || ticket.createdAt)}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={ticket.status || "Open"} />
                        </td>

                        <td className="px-3 py-4">
                          {id ? (
                            <Link
                              to={`/vendor/support/tickets/${encodeURIComponent(id)}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
                            >
                              View
                              <ChevronRight size={14} />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Unavailable
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                <p aria-live="polite">
                  Showing{" "}
                  <span className="font-medium text-slate-900">
                    {startIndex + 1}–{startIndex + visibleTickets.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900">
                    {totalTickets}
                  </span>{" "}
                  {totalTickets === 1 ? "ticket" : "tickets"}
                </p>

                <label className="flex items-center gap-2">
                  <span className="text-slate-500">Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-teal-600"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {totalPages > 1 && (
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onChange={setPage}
                />
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
