import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Search,
  CalendarDays,
  Package,
  Wallet,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  Filter,
  ArrowUpRight,
  RefreshCw,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const STORAGE_KEY = "vendor_notifications";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const initialNotifications = [
  {
    id: 1,
    title: "New booking received",
    message:
      "A new booking has been received for Manali Mountain Escape. Please review the booking details.",
    category: "Bookings",
    type: "booking",
    time: "5 minutes ago",
    date: new Date().toISOString(),
    read: false,
    priority: "high",
    reference: "BK-2026-1042",
  },
  {
    id: 2,
    title: "Package approved",
    message:
      "Your Goa Beach Holiday package has been approved and is ready to be published.",
    category: "Packages",
    type: "package",
    time: "25 minutes ago",
    date: new Date(Date.now() - 25 * 60000).toISOString(),
    read: false,
    priority: "normal",
    reference: "PKG-1024",
  },
  {
    id: 3,
    title: "Payout processing",
    message:
      "Your payout request of ₹12,500 is currently being processed.",
    category: "Payments",
    type: "payment",
    time: "1 hour ago",
    date: new Date(Date.now() - 60 * 60000).toISOString(),
    read: false,
    priority: "normal",
    reference: "PAY-2026-018",
  },
  {
    id: 4,
    title: "Upcoming trip reminder",
    message:
      "Your Jaipur Heritage Tour is scheduled to depart tomorrow. Review the traveller list before departure.",
    category: "Trips",
    type: "trip",
    time: "3 hours ago",
    date: new Date(Date.now() - 3 * 3600000).toISOString(),
    read: true,
    priority: "high",
    reference: "TRIP-204",
  },
  {
    id: 5,
    title: "Verification completed",
    message:
      "Your business verification is complete. You can continue managing your travel packages.",
    category: "Account",
    type: "account",
    time: "Yesterday",
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    read: true,
    priority: "normal",
    reference: "VER-001",
  },
  {
    id: 6,
    title: "Booking cancelled",
    message:
      "Booking BK-2026-1035 has been cancelled by the traveller. Check the cancellation details.",
    category: "Bookings",
    type: "booking",
    time: "Yesterday",
    date: new Date(Date.now() - 27 * 3600000).toISOString(),
    read: false,
    priority: "high",
    reference: "BK-2026-1035",
  },
  {
    id: 7,
    title: "Package needs attention",
    message:
      "Please update the itinerary details for your Kerala Backwater Retreat package.",
    category: "Packages",
    type: "package",
    time: "2 days ago",
    date: new Date(Date.now() - 48 * 3600000).toISOString(),
    read: true,
    priority: "normal",
    reference: "PKG-1018",
  },
  {
    id: 8,
    title: "Customer review received",
    message:
      "A traveller has submitted a new review for your Ladakh Adventure package.",
    category: "Reviews",
    type: "review",
    time: "3 days ago",
    date: new Date(Date.now() - 72 * 3600000).toISOString(),
    read: true,
    priority: "normal",
    reference: "REV-308",
  },
];

const categoryOptions = [
  "All",
  "Bookings",
  "Packages",
  "Payments",
  "Trips",
  "Account",
  "Reviews",
];

const notificationConfig = {
  booking: {
    icon: CalendarDays,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  package: {
    icon: Package,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  payment: {
    icon: Wallet,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  trip: {
    icon: Clock,
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-100",
  },
  account: {
    icon: ShieldCheck,
    color: "text-teal-700",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  review: {
    icon: CheckCircle2,
    color: "text-pink-700",
    bg: "bg-pink-50",
    border: "border-pink-100",
  },
};

function getStoredNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Unable to load notifications:", error);
  }

  return initialNotifications;
}

function formatNotificationDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("start-ellipsis");

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) pages.push("end-ellipsis");

  pages.push(totalPages);

  return pages;
}

export default function VendorNotifications() {
  const [notifications, setNotifications] = useState(
    getStoredNotifications
  );
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error("Unable to save notifications:", error);
    }
  }, [notifications]);

  // Filter / search / page size badalla ki pahilya page var ja
  useEffect(() => {
    setCurrentPage(1);
    setShowDeleteConfirm(null);
  }, [activeCategory, activeFilter, searchQuery, pageSize]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      const matchesReadStatus =
        activeFilter === "all" ||
        (activeFilter === "unread" && !item.read) ||
        (activeFilter === "read" && item.read);

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query) ||
        item.reference.toLowerCase().includes(query);

      return (
        matchesCategory &&
        matchesReadStatus &&
        matchesSearch
      );
    });
  }, [
    notifications,
    activeCategory,
    activeFilter,
    searchQuery,
  ]);

  const filteredCount = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;

  const paginatedNotifications = useMemo(
    () =>
      filteredNotifications.slice(startIndex, startIndex + pageSize),
    [filteredNotifications, startIndex, pageSize]
  );

  const showingFrom = filteredCount === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, filteredCount);

  const updateNotification = (id, updates) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );

    setSelectedNotification((previous) =>
      previous?.id === id
        ? { ...previous, ...updates }
        : previous
    );
  };

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  };

  const markAsRead = (id) => {
    updateNotification(id, { read: true });
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedNotification((previous) =>
      previous?.id === id ? null : previous
    );

    setShowDeleteConfirm(null);
  };

  const clearReadNotifications = () => {
    setNotifications((previous) =>
      previous.filter((item) => !item.read)
    );

    setShowFilters(false);
  };

  const resetDemoNotifications = () => {
    setNotifications(initialNotifications);
    setActiveCategory("All");
    setActiveFilter("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const openNotification = (item) => {
    if (!item.read) {
      markAsRead(item.id);
    }

    setSelectedNotification({
      ...item,
      read: true,
    });
  };

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
    setShowDeleteConfirm(null);
  };

  const totalCount = notifications.length;

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Engagement</span>
              <span>/</span>
              <span className="font-medium text-slate-600">
                Notifications
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Stay updated on bookings, packages, payments, and
              important business activities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetDemoNotifications}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
            >
              <RefreshCw size={16} />
              Reset demo
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total notifications
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  All activity updates
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 p-3.5 text-slate-700">
                <Bell size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unread notifications
                </p>
                <p className="mt-2 text-3xl font-bold text-teal-700">
                  {unreadCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Requires your attention
                </p>
              </div>

              <div className="rounded-2xl bg-teal-50 p-3.5 text-teal-700">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Read notifications
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {totalCount - unreadCount}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Already reviewed
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3.5 text-emerald-700">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Panel */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Search and Filters */}
          <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search notifications..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((value) => !value)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
                    showFilters
                      ? "border-teal-300 bg-teal-50 text-teal-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Filter size={16} />
                  Filters
                </button>

                <button
                  type="button"
                  onClick={clearReadNotifications}
                  disabled={totalCount === unreadCount}
                  className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear read
                </button>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categoryOptions.map((category) => {
                const count =
                  category === "All"
                    ? notifications.length
                    : notifications.filter(
                        (item) => item.category === category
                      ).length;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                      activeCategory === category
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs ${
                        activeCategory === category
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Additional Filters */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
                <span className="mr-1 text-sm font-medium text-slate-600">
                  Status:
                </span>

                {[
                  { label: "All", value: "all" },
                  { label: "Unread", value: "unread" },
                  { label: "Read", value: "read" },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      activeFilter === filter.value
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
            <p className="text-sm font-semibold text-slate-700">
              Recent activity
            </p>

            <p className="text-xs text-slate-500">
              Showing {showingFrom}-{showingTo} of {filteredCount}
            </p>
          </div>

          {/* Notification List */}
          {paginatedNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginatedNotifications.map((item) => {
                const config =
                  notificationConfig[item.type] ||
                  notificationConfig.account;

                const Icon = config.icon;

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col gap-3 p-4 transition hover:bg-slate-50 sm:p-5 lg:flex-row lg:items-center lg:gap-4 ${
                      !item.read ? "bg-teal-50/30" : "bg-white"
                    }`}
                  >
                    {!item.read && (
                      <span className="absolute inset-y-0 left-0 w-1 bg-teal-600" />
                    )}

                    {/* Icon + Content */}
                    <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${config.bg} ${config.color} ${config.border}`}
                      >
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`text-sm ${
                              item.read
                                ? "font-medium text-slate-700"
                                : "font-bold text-slate-900"
                            }`}
                          >
                            {item.title}
                          </h3>

                          {!item.read && (
                            <span className="h-2 w-2 rounded-full bg-teal-600" />
                          )}

                          {item.priority === "high" && (
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                              Important
                            </span>
                          )}
                        </div>

                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                          {item.message}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} />
                            {item.time}
                          </span>

                          <span className="h-1 w-1 rounded-full bg-slate-300" />

                          <span className="rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-600">
                            {item.category}
                          </span>

                          <span className="text-slate-400">
                            ID: {item.reference}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-2 pl-14 sm:pl-15 lg:pl-0">
                      {!item.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700 transition hover:bg-teal-50"
                        >
                          <CheckCheck size={14} />
                          Mark as read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openNotification(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                      >
                        View details
                        <ArrowUpRight size={13} />
                      </button>

                      <button
                        type="button"
                        title="Delete notification"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === item.id && (
                      <div className="absolute right-4 top-14 z-10 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl lg:right-5 lg:top-[calc(50%+1.25rem)]">
                        <p className="text-sm font-semibold text-slate-900">
                          Delete notification?
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          This notification will be removed from your list.
                        </p>

                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(null)}
                            className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteNotification(item.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-5 text-slate-400">
                <Inbox size={34} />
              </div>

              <h3 className="text-base font-semibold text-slate-800">
                No notifications found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                There are no notifications matching your current search or
                filters. Try changing the category or search term.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActiveCategory("All");
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span>
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {showingFrom}-{showingTo}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredCount}
                </span>{" "}
                notifications
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

              <span>
                {unreadCount} unread · {totalCount} total
              </span>

              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(event) =>
                    setPageSize(Number(event.target.value))
                  }
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
              >
                <ChevronLeft size={14} />
                Prev
              </button>

              {getPageNumbers(safePage, totalPages).map((page) =>
                typeof page === "string" ? (
                  <span
                    key={page}
                    className="px-1.5 text-xs text-slate-400"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={page === safePage ? "page" : undefined}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                      page === safePage
                        ? "bg-teal-700 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                {(() => {
                  const config =
                    notificationConfig[selectedNotification.type] ||
                    notificationConfig.account;
                  const Icon = config.icon;

                  return (
                    <div
                      className={`rounded-xl border p-3 ${config.bg} ${config.color} ${config.border}`}
                    >
                      <Icon size={22} />
                    </div>
                  );
                })()}

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-700">
                    {selectedNotification.category}
                  </p>

                  <h2
                    id="notification-modal-title"
                    className="mt-1 text-lg font-bold text-slate-900"
                  >
                    Notification details
                  </h2>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelectedNotification(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedNotification.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {selectedNotification.message}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    Reference ID
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {selectedNotification.reference}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    Category
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedNotification.category}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                  <p className="text-xs text-slate-500">
                    Received on
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatNotificationDate(
                      selectedNotification.date
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                <CheckCircle2 size={18} />
                <span>
                  {selectedNotification.read
                    ? "This notification has been read."
                    : "This notification is unread."}
                </span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 p-4">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}