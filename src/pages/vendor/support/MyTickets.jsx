import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RotateCcw, LoaderCircle, Plus } from "lucide-react";
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

function Status({ value }) {
  const classes = {
    Open: "bg-blue-50 text-blue-700",
    "In Progress": "bg-amber-50 text-amber-700",
    "Awaiting Vendor Response": "bg-purple-50 text-purple-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Closed: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[value] || "bg-slate-100 text-slate-600"}`}>
      {value || "Unknown"}
    </span>
  );
}

export default function MyTickets() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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
        setTickets(
          Array.isArray(data) ? data : data.tickets || data.results || []
        );
        setPages(Math.max(1, Number(data.totalPages || data.pagination?.totalPages || 1)));
      } catch (err) {
        if (active) setError(err.message || "Unable to load tickets.");
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
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({
      search: "",
      status: "",
      category: "",
      priority: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700">Support Center</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="mt-2 text-sm text-slate-500">
            Search your requests and track their progress.
          </p>
        </div>

        <Link
          to="/vendor/support/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          <Plus size={17} /> Create Ticket
        </Link>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-3">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            name="search"
            value={filters.search}
            onChange={updateFilter}
            placeholder="Search ticket ID or subject"
            className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-600"
          />
        </div>

        <select
          name="status"
          value={filters.status}
          onChange={updateFilter}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
        >
          <option value="">All statuses</option>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={updateFilter}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
        >
          <option value="">All categories</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={updateFilter}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
        >
          <option value="">All priorities</option>
          <option value="Low">Low priority</option>
          <option value="Medium">Medium priority</option>
          <option value="High">High priority</option>
        </select>

        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={updateFilter}
          className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-teal-600"
        >
          <option value="createdAt">Sort by created date</option>
          <option value="updatedAt">Sort by last updated</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw size={16} /> Clear filters
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <LoaderCircle className="animate-spin" size={20} /> Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-semibold text-slate-800">No matching tickets</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing your filters or create a new ticket.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {["Ticket", "Category", "Priority", "Created", "Updated", "Status", "Action"].map((heading) => (
                      <th key={heading} className="px-5 py-4">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => {
                    const id = ticket.ticketId || ticket._id;
                    return (
                      <tr key={id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">{ticket.subject}</p>
                          <p className="mt-1 text-xs text-slate-500">{ticket.ticketId || ticket._id}</p>
                        </td>
                        <td className="px-5 py-4">{ticket.category}</td>
                        <td className="px-5 py-4">{ticket.priority}</td>
                        <td className="px-5 py-4">{formatDate(ticket.createdAt)}</td>
                        <td className="px-5 py-4">{formatDate(ticket.updatedAt)}</td>
                        <td className="px-5 py-4"><Status value={ticket.status} /></td>
                        <td className="px-5 py-4">
                          <Link className="font-semibold text-teal-700 hover:underline" to={`/vendor/support/tickets/${encodeURIComponent(id)}`}>
                            View details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-4 md:hidden">
              {tickets.map((ticket) => {
                const id = ticket.ticketId || ticket._id;
                return (
                  <article key={id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{ticket.subject}</p>
                        <p className="mt-1 text-xs text-slate-500">{ticket.ticketId || ticket._id}</p>
                      </div>
                      <Status value={ticket.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{ticket.category} · {ticket.priority} priority</p>
                    <p className="mt-1 text-xs text-slate-500">Updated {formatDate(ticket.updatedAt)}</p>
                    <Link to={`/vendor/support/tickets/${encodeURIComponent(id)}`} className="mt-3 inline-block text-sm font-semibold text-teal-700">
                      View details →
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
              <span className="text-xs text-slate-500">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}