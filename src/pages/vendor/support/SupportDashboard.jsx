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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[normalizedStatus] || STATUS_STYLES.Open
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {normalizedStatus}
    </span>
  );
}

function PriorityLabel({ priority }) {
  if (!priority) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-slate-700">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
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
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-500/30";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${base} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
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
                ? "border-teal-700 bg-teal-700 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
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
        className={`${base} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40`}
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
      setTickets(getSupportTickets());
      setPage(1);
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
      description: "All submitted support requests",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets,
      icon: LifeBuoy,
      iconClass: "bg-blue-50 text-blue-700",
      description: "Requests awaiting attention",
    },
    {
      label: "In Progress",
      value: stats.inProgressTickets,
      icon: Clock3,
      iconClass: "bg-amber-50 text-amber-700",
      description: "Requests being worked on",
    },
    {
      label: "Resolved Tickets",
      value: stats.resolvedTickets,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700",
      description: "Successfully resolved requests",
    },
  ];

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  return (
    <main className="w-full min-w-0 space-y-3 px-0 py-2 text-slate-900">
      {/* Page heading: My Tickets page sarkhach header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1.5 bg-teal-700"
        />

        <div className="flex flex-col gap-4 px-5 py-4 sm:pl-8 sm:pr-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700 sm:h-14 sm:w-14">
              <LifeBuoy size={24} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
                Support Center
              </p>

              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px] sm:leading-8">
                Support Tickets
              </h1>

              <p className="mt-1.5 max-w-2xl text-sm leading-5 text-slate-500">
                Manage your requests, monitor ticket status and stay connected
                with the support team.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/vendor/support/help"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              <BookOpen size={17} />
              Help Center
            </Link>

            <Link
              to="/vendor/support/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-100"
            >
              <Plus size={17} />
              Create ticket
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics cards */}
      <section
        aria-label="Ticket statistics"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {cards.map(({ label, value, icon: Icon, iconClass, description }) => (
          <article
            key={label}
            className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{label}</p>

              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </span>
            </div>

            <p className="mt-1.5 text-3xl font-bold leading-tight tracking-tight text-slate-900 tabular-nums">
              {value}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </section>

      {/* Support tickets */}
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Section header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Ticket size={21} />
            </span>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                All Support Tickets
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                View and track your submitted requests.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshTickets}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 sm:self-auto"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:px-5">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={17}
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
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 sm:w-52"
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
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:self-auto"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>

        {/* Empty state */}
        {visibleTickets.length === 0 ? (
          <div className="px-5 py-12 text-center sm:py-14">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              {hasFilters ? <Search size={22} /> : <Ticket size={22} />}
            </span>

            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              {hasFilters
                ? "No tickets match your filters"
                : "No support tickets yet"}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {hasFilters
                ? "Try another search term or select a different status."
                : "Create a support ticket if you need help with your vendor account."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/vendor/support/create"
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                <Plus size={16} />
                Create your first ticket
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Responsive ticket table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[850px] table-auto text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3.5 sm:px-5">Ticket</th>
                    <th className="px-3 py-3.5">Category</th>
                    <th className="px-3 py-3.5">Priority</th>
                    <th className="whitespace-nowrap px-3 py-3.5">Created</th>
                    <th className="whitespace-nowrap px-3 py-3.5">
                      Last updated
                    </th>
                    <th className="px-3 py-3.5">Status</th>
                    <th className="px-4 py-3.5 sm:px-5">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {visibleTickets.map((ticket, index) => {
                    const id = ticket.ticketId || ticket._id || ticket.id;

                    return (
                      <tr
                        key={id || index}
                        className="transition-colors hover:bg-teal-50/30"
                      >
                        <td className="max-w-[280px] px-4 py-3 sm:px-5">
                          <p className="break-words font-semibold leading-5 text-slate-900">
                            {ticket.subject || "Untitled ticket"}
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-500">
                            {id || "—"}
                          </p>
                        </td>

                        <td className="max-w-[200px] px-3 py-4 text-sm text-slate-600">
                          <span className="break-words">
                            {ticket.category || "—"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <PriorityLabel priority={ticket.priority} />
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                          {getDate(ticket.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                          {getDate(ticket.updatedAt || ticket.createdAt)}
                        </td>

                        <td className="px-3 py-4">
                          <StatusBadge status={ticket.status || "Open"} />
                        </td>

                        <td className="px-4 py-4 sm:px-5">
                          {id ? (
                            <Link
                              to={`/vendor/support/tickets/${encodeURIComponent(id)}`}
                              className="inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                            >
                              View details
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
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-600">
                <p aria-live="polite">
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {totalTickets === 0 ? 0 : startIndex + 1}–
                    {startIndex + visibleTickets.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalTickets}
                  </span>{" "}
                  {totalTickets === 1 ? "ticket" : "tickets"}
                </p>

                <label className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-slate-500">
                    Rows per page
                  </span>

                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
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
    </main>
  );
}