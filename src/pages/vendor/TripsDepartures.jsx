import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  MapPin,
  Users,
  Clock3,
  Search,
  Eye,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CircleAlert,
  RefreshCw,
} from "lucide-react";

import {
  BOOKING_STORAGE_KEY,
  PACKAGE_STORAGE_KEY,
  TRIP_STATUS_STORAGE_KEY,
  buildTrips,
  formatCurrency,
  formatDate,
} from "../../utils/tripData";

const statusBadge = {
  Scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  "In Progress": "border-amber-200 bg-amber-50 text-amber-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

const statCardTones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getToday() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
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

function StatCard({ title, value, description, icon: Icon, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500">{title}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{description}</p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${statCardTones[tone]}`}
        >
          <Icon size={19} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold tracking-tight ${
        statusBadge[status] || "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

function Seats({ booked, total }) {
  const capacity = Number(total) || 0;
  const occupied = Number(booked) || 0;
  const percentage =
    capacity > 0 ? Math.min(100, (occupied / capacity) * 100) : 0;

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <p className="text-sm font-semibold tabular-nums text-slate-900">
          {occupied}{" "}
          <span className="font-normal text-slate-400">/ {capacity}</span>
        </p>
        <span className="text-[10px] font-medium tabular-nums text-slate-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div
        className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Seats booked"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentage)}
      >
        <span
          className="block h-full rounded-full bg-violet-600 transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ViewButton({ onClick, label, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800 ${className}`}
    >
      <Eye size={15} />
      View Details
    </button>
  );
}

export default function TripsDepartures() {
  const navigate = useNavigate();

  const [tripState, setTripState] = useState(() => {
    try {
      return { trips: buildTrips(), error: "" };
    } catch (error) {
      console.error("Unable to load trips and bookings.", error);
      return {
        trips: [],
        error:
          "Unable to load departures. Please check the saved package and booking data.",
      };
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const trips = tripState.trips;
  const today = getToday();

  useEffect(() => {
    const refreshTrips = () => {
      try {
        setTripState({ trips: buildTrips(), error: "" });
      } catch (error) {
        console.error("Unable to refresh trips and bookings.", error);
        setTripState({
          trips: [],
          error: "Unable to refresh trips. Check your saved data.",
        });
        toast.error("Unable to refresh trips and departures.");
      }
    };

    const handleStorage = (event) => {
      if (
        event.key === PACKAGE_STORAGE_KEY ||
        event.key === BOOKING_STORAGE_KEY ||
        event.key === TRIP_STATUS_STORAGE_KEY ||
        event.key === null
      ) {
        refreshTrips();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshTrips);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshTrips);
    };
  }, []);

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return trips.filter((trip) => {
      const matchesSearch =
        !query ||
        String(trip.packageName || "").toLowerCase().includes(query) ||
        String(trip.destination || "").toLowerCase().includes(query) ||
        String(trip.id || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || trip.status === statusFilter;

      const departureDate = String(trip.departureDate || "");
      const matchesDate =
        dateFilter === "All" ||
        (dateFilter === "Upcoming" &&
          departureDate >= today &&
          trip.status === "Scheduled") ||
        (dateFilter === "Past" && departureDate < today);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [trips, search, statusFilter, dateFilter, today]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / pageSize));
  const displayedPage = Math.min(currentPage, totalPages);
  const pageTrips = useMemo(
    () =>
      filteredTrips.slice(
        (displayedPage - 1) * pageSize,
        displayedPage * pageSize,
      ),
    [filteredTrips, displayedPage, pageSize],
  );

  const scheduledCount = trips.filter((t) => t.status === "Scheduled").length;
  const inProgressCount = trips.filter((t) => t.status === "In Progress").length;
  const completedCount = trips.filter((t) => t.status === "Completed").length;
  const totalTravellers = trips
    .filter((trip) => trip.status !== "Cancelled")
    .reduce((total, trip) => total + (Number(trip.bookedSeats) || 0), 0);

  const filtersActive =
    search.trim() !== "" || statusFilter !== "All" || dateFilter !== "All";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("All");
    setCurrentPage(1);
  };

  const openTrip = (trip) => {
    navigate(`/vendor/trips/${encodeURIComponent(trip.id)}`);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-6">
      {/* Page heading */}
      <header>
        <p className="mb-1.5 text-xs font-medium text-slate-500">
          Operations <span className="mx-1.5 text-slate-300">/</span> Trips
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Trips & Departures
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Monitor departure schedules, seat occupancy and trip status.
        </p>
      </header>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Scheduled Trips"
          value={scheduledCount}
          description="Awaiting departure"
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          description="Currently running"
          icon={PlayCircle}
          tone="amber"
        />
        <StatCard
          title="Completed Trips"
          value={completedCount}
          description="Successfully completed"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          title="Total Travellers"
          value={totalTravellers}
          description="Across non-cancelled trips"
          icon={Users}
          tone="violet"
        />
      </section>

      {/* Departure schedule */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Departure Schedule
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review package departures, seat bookings and trip progress.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <label className="relative sm:w-64">
              <span className="sr-only">Search trips</span>
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search trip, destination or ID..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10"
              />
            </label>

            <label className="relative sm:w-40">
              <span className="sr-only">Filter by status</span>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10"
              >
                <option value="All">All statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </label>

            <label className="relative sm:w-36">
              <span className="sr-only">Filter by departure date</span>
              <select
                value={dateFilter}
                onChange={(event) => {
                  setDateFilter(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10"
              >
                <option value="All">All dates</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Past">Past trips</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </label>

            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {tripState.error && (
          <div
            role="alert"
            className="mx-5 mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to display departures</p>
              <p className="mt-1">{tripState.error}</p>
              <button
                type="button"
                onClick={() => {
                  try {
                    setTripState({ trips: buildTrips(), error: "" });
                  } catch {
                    toast.error("Could not reload departure data.");
                  }
                }}
                className="mt-3 inline-flex items-center gap-2 font-semibold underline underline-offset-4"
              >
                <RefreshCw size={14} />
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Desktop table */}
        {!tripState.error && pageTrips.length > 0 && (
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[960px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr className="text-[11px] uppercase tracking-[0.08em] text-slate-500">
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold">Trip / Package</th>
                  <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Destination</th>
                  <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Departure</th>
                  <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Seats</th>
                  <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Price</th>
                  <th className="whitespace-nowrap px-4 py-3.5 font-semibold">Status</th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {pageTrips.map((trip) => (
                  <tr
                    key={trip.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-4">
                      <p className="max-w-[260px] truncate text-sm font-semibold text-slate-900">
                        {trip.packageName}
                      </p>
                      <p className="mt-1 max-w-[260px] truncate font-mono text-[11px] text-slate-400">
                        {trip.id}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin size={14} className="shrink-0 text-slate-400" />
                        {trip.destination}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {formatDate(trip.departureDate)}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={12} />
                        {trip.departureTime || "Time not specified"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <Seats booked={trip.bookedSeats} total={trip.totalSeats} />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(trip.price)}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={trip.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <ViewButton
                        onClick={() => openTrip(trip)}
                        label={`View details of ${trip.packageName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile / tablet cards */}
        {!tripState.error && pageTrips.length > 0 && (
          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 p-4 sm:grid-cols-2 lg:hidden">
            {pageTrips.map((trip) => (
              <article
                key={trip.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                      {trip.packageName}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} className="shrink-0 text-slate-400" />
                      <span className="truncate">{trip.destination}</span>
                    </p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-800">
                      {formatDate(trip.departureDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Seats
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold tabular-nums text-slate-800">
                      {trip.bookedSeats} / {trip.totalSeats}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Price
                    </p>
                    <p className="mt-1 truncate text-xs font-semibold tabular-nums text-slate-800">
                      {formatCurrency(trip.price)}
                    </p>
                  </div>
                </div>

                <ViewButton
                  onClick={() => openTrip(trip)}
                  label={`View details of ${trip.packageName}`}
                  className="mt-3 w-full"
                />
              </article>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!tripState.error && filteredTrips.length === 0 && (
          <div className="border-t border-slate-100 px-5 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
              <Search size={21} />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              No departures found
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              No trips match your current search and filters.
            </p>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                <X size={15} />
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!tripState.error && filteredTrips.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <p>
                Showing{" "}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {(displayedPage - 1) * pageSize + 1}–
                  {Math.min(displayedPage * pageSize, filteredTrips.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800 tabular-nums">
                  {filteredTrips.length}
                </span>{" "}
                departures
                {filteredTrips.length !== trips.length && (
                  <span className="text-slate-400">
                    {" "}
                    (filtered from {trips.length})
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
    </div>
  );
}