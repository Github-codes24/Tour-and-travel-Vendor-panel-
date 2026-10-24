import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  MapPin,
  Users,
  CalendarDays,
  Package,
  X,
  CheckCircle2,
  Clock,
  Ban,
  MoreHorizontal,
  Send,
  AlertCircle,
} from "lucide-react";

import initialPackages from "../../data/Package";
import AddPackage from "./AddPackage";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  Published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Draft: "bg-slate-100 text-slate-700 ring-slate-500/20",
  "Pending Review": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.Draft
      }`}
    >
      {status || "Draft"}
    </span>
  );
}

function MetricCard({ title, subtitle, value, icon: Icon, color, iconBg }) {
  return (
    <div className="flex min-h-[130px] items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition hover:shadow-md sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${iconBg} ${color}`}
      >
        <Icon size={24} />
      </div>
    </div>
  );
}

export default function MyPackages() {
  const [packages, setPackages] = useState(() =>
    Array.isArray(initialPackages) ? initialPackages : [],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  const filteredPackages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = packages.filter((item) => {
      const name = String(item.name || "").toLowerCase();
      const destination = String(item.destination || "").toLowerCase();

      const matchesSearch =
        !query || name.includes(query) || destination.includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "bookings") {
      result.sort((a, b) => Number(b.booked || 0) - Number(a.booked || 0));
    }

    return result;
  }, [packages, searchQuery, statusFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPackages.length / pageSize));

  const activePage = Math.min(currentPage, totalPages);

  const visiblePackages = filteredPackages.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  );

  const publishedCount = packages.filter(
    (item) => item.status === "Published",
  ).length;

  const pendingCount = packages.filter(
    (item) => item.status === "Pending Review",
  ).length;

  const totalBookings = packages.reduce(
    (sum, item) => sum + (Number(item.booked) || 0),
    0,
  );

  const triggerToast = (message) => {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage((current) => (current === message ? "" : current));
    }, 3000);
  };

  const handleDeletePackage = () => {
    if (!deleteTarget) return;

    setPackages((prev) => prev.filter((item) => item.id !== deleteTarget.id));

    setDeleteTarget(null);
    setOpenMenuId(null);
    triggerToast("Package deleted successfully.");
  };

  const handleTogglePublish = (item) => {
    if (item.status === "Pending Review") return;

    const nextStatus = item.status === "Published" ? "Draft" : "Published";

    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === item.id ? { ...pkg, status: nextStatus } : pkg,
      ),
    );

    setOpenMenuId(null);

    triggerToast(
      nextStatus === "Published"
        ? "Package successfully published."
        : "Package moved to draft.",
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setSortBy("default");
    setCurrentPage(1);
  };

  return (
    <div
      className="w-full space-y-6 pb-10"
      onClick={(event) => {
        if (
          openMenuId !== null &&
          !event.target.closest("[data-package-menu]")
        ) {
          setOpenMenuId(null);
        }
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            My Packages
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, manage and track your travel destination packages
            seamlessly.
          </p>
        </div>

        <Link
          to="/vendor/packages/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-2xs transition hover:bg-emerald-800"
        >
          <Plus size={20} />
          Add New Package
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Packages"
          subtitle="All created packages"
          value={packages.length}
          icon={Package}
          color="text-emerald-700"
          iconBg="bg-emerald-50"
        />

        <MetricCard
          title="Published"
          subtitle="Live on website"
          value={publishedCount}
          icon={CheckCircle2}
          color="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <MetricCard
          title="Pending Review"
          subtitle="Awaiting admin approval"
          value={pendingCount}
          icon={Clock}
          color="text-amber-600"
          iconBg="bg-amber-50"
        />

        <MetricCard
          title="Total Bookings"
          subtitle="Across all listings"
          value={totalBookings}
          icon={Users}
          color="text-blue-600"
          iconBg="bg-blue-50"
        />
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by package name or destination..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-3 focus:ring-emerald-600/10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-600"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-600"
            >
              <option value="All">All Categories</option>
              <option value="Beach">Beach</option>
              <option value="Adventure">Adventure</option>
              <option value="Nature">Nature</option>
              <option value="Heritage">Heritage</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-600"
            >
              <option value="default">Sort: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="bookings">Most Booked</option>
            </select>

            {(searchQuery ||
              statusFilter !== "All" ||
              categoryFilter !== "All" ||
              sortBy !== "default") && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <X size={17} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Package Cards */}
      {visiblePackages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <AlertCircle size={40} className="mx-auto text-slate-300" />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No packages found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your search criteria or filters.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visiblePackages.map((item) => {
            const booked = Number(item.booked) || 0;
            const seats = Number(item.seats) || 0;
            const availableSeats = Math.max(0, seats - booked);

            const bookedPercentage = Math.round(
              seats > 0 ? (booked / seats) * 100 : 0,
            );

            return (
              <article
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition duration-200 hover:shadow-md"
              >
                {/* Package Image */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name || "Travel package"}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Package size={42} />
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <span className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-xs">
                      {item.category || "General"}
                    </span>
                  </div>

                  <div className="absolute right-4 top-4">
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Package Details */}
                <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="line-clamp-1 text-xl font-bold text-slate-900">
                        {item.name}
                      </h2>

                      <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <MapPin size={17} className="shrink-0 text-slate-400" />
                        {item.destination || "Destination not set"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-slate-400" />
                        {item.duration || "Duration not set"}
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="flex items-center gap-1.5">
                        <Users size={15} className="text-slate-400" />
                        {seats} seats
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={15} className="text-slate-400" />
                        {formatDate(item.departure)}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex flex-col gap-3">
                        <div>
                          <span className="text-2xl font-extrabold text-slate-900">
                            {formatCurrency(item.price)}
                          </span>
                          <span className="text-sm text-slate-400">
                            {" "}
                            /person
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-600">
                            {booked} booked
                          </span>

                          <span
                            className={`text-sm font-semibold ${
                              availableSeats === 0
                                ? "text-red-600"
                                : "text-emerald-700"
                            }`}
                          >
                            {availableSeats} available
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              bookedPercentage >= 100
                                ? "bg-emerald-500"
                                : bookedPercentage > 50
                                  ? "bg-teal-600"
                                  : "bg-teal-500"
                            }`}
                            style={{
                              width: `${Math.min(100, bookedPercentage)}%`,
                            }}
                          />
                        </div>

                        <span className="min-w-[38px] text-right text-sm font-medium text-slate-500">
                          {bookedPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/vendor/packages/${item.id}`}
                        state={{ packageData: item }}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={16} />
                        View
                      </Link>

                      <Link
                        to={`/vendor/packages/new?edit=${encodeURIComponent(
                          item.id,
                        )}`}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-teal-200 px-3.5 text-sm font-medium text-teal-700 hover:bg-teal-50"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>

                      <div className="relative" data-package-menu>
                        <button
                          type="button"
                          aria-label={`More actions for ${item.name}`}
                          aria-expanded={openMenuId === item.id}
                          onClick={(event) => {
                            event.stopPropagation();

                            setOpenMenuId((current) =>
                              current === item.id ? null : item.id,
                            );
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {openMenuId === item.id && (
                          <div className="absolute bottom-12 left-0 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-sm shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(item);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.status === "Published" ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Ban size={15} />
                        Draft
                      </button>
                    ) : item.status === "Pending Review" ? (
                      <button
                        type="button"
                        disabled
                        className="flex h-10 cursor-not-allowed items-center gap-1.5 rounded-lg bg-amber-50 px-3.5 text-sm font-semibold text-amber-700 opacity-80"
                      >
                        <Clock size={15} />
                        Pending
                      </button>
                    ) : item.status === "Rejected" ? (
                      <button
                        type="button"
                        disabled
                        title="This package needs to be corrected before publishing."
                        className="flex h-10 cursor-not-allowed items-center gap-1.5 rounded-lg bg-rose-50 px-3.5 text-sm font-semibold text-rose-700 opacity-80"
                      >
                        <AlertCircle size={15} />
                        Rejected
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                      >
                        <Send size={15} />
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {/* Create New Package Card */}
          <Link
            to="/vendor/packages/new"
            className="group flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/20 p-10 text-center transition duration-200 hover:border-emerald-500 hover:bg-emerald-50/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:scale-105">
              <Package size={32} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Create New Package
            </h3>

            <p className="mt-2 max-w-[220px] text-sm text-slate-500">
              Add a new travel package and start reaching more travellers.
            </p>

            <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-2xs group-hover:bg-emerald-800">
              <Plus size={17} />
              Add New Package
            </span>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {(activePage - 1) * pageSize + 1} -{" "}
              {Math.min(activePage * pageSize, filteredPackages.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {filteredPackages.length}
            </span>{" "}
            packages
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-2 text-sm font-semibold text-slate-600">
              Page {activePage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={activePage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-2xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteTarget(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-package-title"
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 size={24} />
            </div>

            <h2
              id="delete-package-title"
              className="mt-5 text-xl font-bold text-slate-900"
            >
              Delete package?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                {deleteTarget.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePackage}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
