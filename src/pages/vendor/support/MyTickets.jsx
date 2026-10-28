import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RotateCcw,
  LoaderCircle,
  Plus,
  LifeBuoy,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Ticket,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { supportService } from "../../../services/supportService";

const statuses = [
  "Open",
  "In Progress",
  "Awaiting Vendor Response",
  "Resolved",
  "Closed",
];

const categories = [
  "Booking Issues",
  "Payment & Payout Issues",
  "Package Management",
  "Account Issues",
  "Documents & Verification",
  "Technical Issues",
  "Other",
];

const initialFilters = {
  search: "",
  status: "",
  category: "",
  priority: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

function unwrap(response) {
  return response?.data ?? response;
}

function formatDate(value) {
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

function StatusBadge({ value }) {
  const styles = {
    Open: "bg-sky-50 text-sky-700 ring-sky-600/15",
    "In Progress": "bg-amber-50 text-amber-700 ring-amber-600/15",
    "Awaiting Vendor Response":
      "bg-violet-50 text-violet-700 ring-violet-600/15",
    Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    Closed: "bg-slate-100 text-slate-600 ring-slate-500/15",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
        styles[value] || "bg-slate-100 text-slate-600 ring-slate-500/15"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value || "Unknown"}
    </span>
  );
}

function PriorityBadge({ value }) {
  const styles = {
    High: "bg-rose-50 text-rose-700 ring-rose-600/15",
    Medium: "bg-amber-50 text-amber-700 ring-amber-600/15",
    Low: "bg-slate-100 text-slate-600 ring-slate-500/15",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[value] || "bg-slate-50 text-slate-500 ring-slate-300"
      }`}
    >
      {value || "Not set"}
    </span>
  );
}

function FilterField({ label, htmlFor, children }) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-600 focus:ring-4 focus:ring-violet-600/10";

function TicketDetailsLink({ id }) {
  return (
    <Link
      to={`/vendor/support/tickets/${encodeURIComponent(id)}`}
      className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-violet-600 hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-600/10"
    >
      View details
      <ArrowUpRight size={14} />
    </Link>
  );
}

export default function MyTickets() {
  const [filters, setFilters] = useState(initialFilters);
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTickets() {
      setLoading(true);
      setError("");

      try {
        const response = await supportService.getTickets({
          ...filters,
          page,
          limit: 10,
        });

        if (!active) return;

        const data = unwrap(response);
        const items = Array.isArray(data)
          ? data
          : data?.tickets || data?.results || [];

        setTickets(items);
        setPages(
          Math.max(
            1,
            Number(data?.totalPages || data?.pagination?.totalPages || 1),
          ),
        );
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load tickets.");
          setTickets([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTickets();

    return () => {
      active = false;
    };
  }, [filters, page]);

  function updateFilter(event) {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));

    setPage(1);
  }

  function clearFilters() {
    setFilters({ ...initialFilters });
    setPage(1);
  }

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "" ||
    filters.category !== "" ||
    filters.priority !== "" ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  const firstTicket = tickets.length ? (page - 1) * 10 + 1 : 0;

  const lastTicket = Math.min(
    (page - 1) * 10 + tickets.length,
    (page - 1) * 10 + 10,
  );

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-6 pb-8">
      {/* Page header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1 bg-violet-700" />

        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
              <LifeBuoy size={24} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">
                  Support Center
                </p>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                My Tickets
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Manage your support requests, follow updates and communicate
                with our support team.
              </p>
            </div>
          </div>

          <Link
            to="/vendor/support/create"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-violet-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-600/20"
          >
            <Plus size={18} />
            Create ticket
          </Link>
        </div>
      </section>

      {/* Filters */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200">
              <SlidersHorizontal size={19} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Find a ticket
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Search and filter your support requests.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-600/10 disabled:cursor-not-allowed disabled:opacity-40 lg:self-center"
          >
            <RotateCcw size={15} />
            Reset filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
          <FilterField label="Search" htmlFor="ticket-search">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="ticket-search"
                name="search"
                type="search"
                value={filters.search}
                onChange={updateFilter}
                placeholder="Ticket ID or subject"
                className={`${inputClass} pl-10`}
              />
            </div>
          </FilterField>

          <FilterField label="Status" htmlFor="ticket-status">
            <select
              id="ticket-status"
              name="status"
              value={filters.status}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Category" htmlFor="ticket-category">
            <select
              id="ticket-category"
              name="category"
              value={filters.category}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Priority" htmlFor="ticket-priority">
            <select
              id="ticket-priority"
              name="priority"
              value={filters.priority}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="">All priorities</option>
              <option value="Low">Low priority</option>
              <option value="Medium">Medium priority</option>
              <option value="High">High priority</option>
            </select>
          </FilterField>

          <FilterField label="Sort by" htmlFor="ticket-sort">
            <select
              id="ticket-sort"
              name="sortBy"
              value={filters.sortBy}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="createdAt">Created date</option>
              <option value="updatedAt">Last updated</option>
            </select>
          </FilterField>

          <FilterField label="Order" htmlFor="ticket-sort-order">
            <select
              id="ticket-sort-order"
              name="sortOrder"
              value={filters.sortOrder}
              onChange={updateFilter}
              className={inputClass}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </FilterField>
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to load tickets
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Ticket list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Ticket size={18} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Support requests
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Your submitted tickets and their current status
              </p>
            </div>
          </div>

          {!loading && !error && (
            <p className="text-xs font-medium text-slate-500">
              {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} on
              this page
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-16">
            <LoaderCircle size={27} className="animate-spin text-violet-700" />
            <p className="text-sm font-medium text-slate-600">
              Loading your tickets...
            </p>
            <p className="text-xs text-slate-400">
              Please wait while we fetch your requests.
            </p>
          </div>
        ) : error ? (
          <div className="flex min-h-52 flex-col items-center justify-center px-5 py-12 text-center">
            <AlertCircle size={25} className="text-red-500" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Something went wrong
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Please check your connection and try again.
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200">
              <Inbox size={27} strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No tickets found
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              {hasActiveFilters
                ? "No support requests match your filters. Try adjusting your search criteria."
                : "You haven't submitted any support requests yet. Create a ticket if you need assistance."}
            </p>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={15} />
                Clear filters
              </button>
            ) : (
              <Link
                to="/vendor/support/create"
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                <Plus size={16} />
                Create your first ticket
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop and tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1000px] table-auto text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "Ticket details",
                      "Category",
                      "Priority",
                      "Created",
                      "Last updated",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="whitespace-nowrap px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 first:pl-6 last:pr-6"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => {
                    const id = ticket.ticketId || ticket._id;

                    return (
                      <tr
                        key={id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="max-w-[270px] px-5 py-4 pl-6">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                              <Ticket size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold leading-5 text-slate-800">
                                {ticket.subject || "Untitled ticket"}
                              </p>
                              <p className="mt-1.5 break-all font-mono text-xs text-slate-400">
                                {ticket.ticketId || ticket._id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[180px] px-5 py-4">
                          <span className="break-words text-sm text-slate-600">
                            {ticket.category || "—"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <PriorityBadge value={ticket.priority} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarDays
                              size={15}
                              className="shrink-0 text-slate-400"
                            />
                            {formatDate(ticket.createdAt)}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock3
                              size={15}
                              className="shrink-0 text-slate-400"
                            />
                            {formatDate(ticket.updatedAt)}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <StatusBadge value={ticket.status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 pr-6">
                          <TicketDetailsLink id={id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile ticket cards */}
            <div className="space-y-3 p-4 md:hidden">
              {tickets.map((ticket) => {
                const id = ticket.ticketId || ticket._id;

                return (
                  <article
                    key={id}
                    className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-violet-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                        <Ticket size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-semibold leading-5 text-slate-900">
                          {ticket.subject || "Untitled ticket"}
                        </h3>
                        <p className="mt-1 break-all font-mono text-xs text-slate-400">
                          {ticket.ticketId || ticket._id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <StatusBadge value={ticket.status} />
                      <PriorityBadge value={ticket.priority} />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-3">
                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Category
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-700">
                          {ticket.category || "—"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Created
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {formatDate(ticket.createdAt)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Last updated
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            {formatDate(ticket.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/vendor/support/tickets/${encodeURIComponent(id)}`}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-violet-600 hover:bg-violet-50 hover:text-violet-800"
                    >
                      View ticket details
                      <ArrowUpRight size={16} />
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {firstTicket}–{lastTicket}
                </span>{" "}
                tickets
                <span className="mx-1.5 text-slate-300">|</span>
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {page}
                </span> of{" "}
                <span className="font-semibold text-slate-700">{pages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= pages || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
