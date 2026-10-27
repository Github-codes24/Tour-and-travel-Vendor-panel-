import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Bus,
  IndianRupee,
  Search,
  Download,
  Printer,
  CheckCircle2,
  CircleAlert,
  UserRound,
  Phone,
  Route,
  Hotel,
  Utensils,
  ShieldCheck,
  ChevronRight,
  X,
  Info,
  Ticket,
  Timer,
} from "lucide-react";
import {
  BOOKING_STORAGE_KEY,
  PACKAGE_STORAGE_KEY,
  TRIP_STATUS_STORAGE_KEY,
  TRIP_STATUSES,
  buildTrips,
  formatCurrency,
  formatDate,
  getCustomerName,
  getTravellerName,
  saveTripStatus,
} from "../../utils/tripData";

const heroStatusStyles = {
  Scheduled: "bg-blue-500/20 text-blue-100 ring-blue-300/40",
  "In Progress": "bg-amber-500/20 text-amber-100 ring-amber-300/40",
  Completed: "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40",
  Cancelled: "bg-red-500/20 text-red-100 ring-red-300/40",
};

const statusDotStyles = {
  Scheduled: "bg-blue-400",
  "In Progress": "bg-amber-400",
  Completed: "bg-emerald-400",
  Cancelled: "bg-red-400",
};

const statusChipStyles = {
  Scheduled: "border-blue-600 bg-blue-600 text-white",
  "In Progress": "border-amber-500 bg-amber-500 text-white",
  Completed: "border-emerald-600 bg-emerald-600 text-white",
  Cancelled: "border-red-600 bg-red-600 text-white",
};

function loadTrip(id) {
  try {
    return buildTrips().find((item) => item.id === id) || null;
  } catch (error) {
    console.error("Unable to load trip details.", error);
    return null;
  }
}

function getCountdown(date) {
  if (!date) return "";
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const target = new Date(date).getTime();
  if (Number.isNaN(target)) return "";
  const days = Math.round((target - today) / 86400000);

  if (days === 0) return "Departing today";
  if (days === 1) return "Departs tomorrow";
  if (days > 1) return `Departs in ${days} days`;
  if (days === -1) return "Departed yesterday";
  return `Departed ${Math.abs(days)} days ago`;
}

function getInitials(name) {
  return (
    String(name || "?")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?"
  );
}

function bookingStatusClass(status) {
  if (status === "cancelled") return "bg-rose-50 text-rose-700 ring-rose-200";
  if (status === "confirmed")
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}

function getPaymentLabel(booking) {
  const payment =
    booking.paymentStatus || booking.payment?.status || booking.payment;
  return typeof payment === "string" ? payment : "";
}

function StatCard({ icon: Icon, label, value, helper, iconClass }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-bold text-slate-900 sm:text-2xl">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{helper}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Card({ title, subtitle, action, icon: Icon, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <Icon size={18} />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function EmptyState({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm">
        <Icon size={24} />
      </div>
      <p className="mt-3 font-semibold text-slate-800">{title}</p>
      {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    </div>
  );
}

export default function TripDepartureDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [trip, setTrip] = useState(() => loadTrip(id));
  const [status, setStatus] = useState(trip?.status || "Scheduled");
  const [statusMessage, setStatusMessage] = useState("");
  const [search, setSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === PACKAGE_STORAGE_KEY ||
        event.key === BOOKING_STORAGE_KEY ||
        event.key === TRIP_STATUS_STORAGE_KEY ||
        event.key === null
      ) {
        const fresh = loadTrip(id);
        setTrip(fresh);
        if (fresh) setStatus(fresh.status);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [id]);

  const bookings = trip?.bookings || [];

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const names = (booking.travellers || []).map(getTravellerName).join(" ");
      const matchesSearch =
        !query ||
        getCustomerName(booking).toLowerCase().includes(query) ||
        String(booking.bookingId || "").toLowerCase().includes(query) ||
        names.toLowerCase().includes(query);

      const bookingStatus = booking.status || "pending";
      const matchesFilter =
        bookingFilter === "All" || bookingStatus === bookingFilter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, bookingFilter]);

  if (!trip) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <CircleAlert size={30} />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Trip details not found
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          This departure is not available. It may have been removed or the
          package may no longer be published.
        </p>
        <button
          type="button"
          onClick={() => navigate("/vendor/trips")}
          className="mt-5 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const availableSeats = Math.max(0, trip.totalSeats - trip.bookedSeats);
  const occupancy = trip.totalSeats
    ? Math.min(100, Math.round((trip.bookedSeats / trip.totalSeats) * 100))
    : 0;
  const filledSegments =
    occupancy > 0 ? Math.max(1, Math.round(occupancy / 10)) : 0;
  const isLocked = trip.status === "Completed" || trip.status === "Cancelled";
  const countdown = getCountdown(trip.departureDate);

  function applyStatus(newStatus) {
    try {
      saveTripStatus(trip.id, newStatus);
      setTrip((current) => ({ ...current, status: newStatus }));
      setStatus(newStatus);
      setStatusMessage(`Trip status updated to ${newStatus}.`);
    } catch (error) {
      console.error("Unable to save trip status.", error);
      toast.error("Unable to save trip status. Please try again.");
    }
  }

  function saveStatus() {
    if (!TRIP_STATUSES.includes(status) || status === trip.status) return;

    if (trip.status === "Completed" && status !== "Completed") {
      setStatusMessage("Completed trips cannot be moved to another status.");
      return;
    }

    if (trip.status === "Cancelled" && status !== "Cancelled") {
      setStatusMessage("A cancelled trip cannot be reactivated.");
      return;
    }

    if (status === "Cancelled") {
      setShowCancelConfirm(true);
      return;
    }

    applyStatus(status);
  }

  function confirmCancellation() {
    applyStatus("Cancelled");
    setShowCancelConfirm(false);
  }

  function exportTravellers() {
    const headers = [
      "Booking ID",
      "Customer",
      "Traveller",
      "Booking Status",
      "Payment",
    ];

    const rows = bookings.flatMap((booking) => {
      const list = Array.isArray(booking.travellers) ? booking.travellers : [];
      const base = [booking.bookingId || "", getCustomerName(booking)];
      const tail = [booking.status || "pending", getPaymentLabel(booking)];

      if (list.length === 0) return [[...base, "", ...tail]];
      return list.map((traveller) => [
        ...base,
        getTravellerName(traveller),
        ...tail,
      ]);
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${trip.id}-travellers.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const heroChips = [
    { icon: CalendarDays, text: formatDate(trip.departureDate) },
    { icon: Clock3, text: trip.departureTime },
    { icon: Timer, text: trip.duration },
    { icon: Users, text: `${trip.bookedSeats}/${trip.totalSeats} seats` },
  ];

  const departureInfo = [
    {
      icon: CalendarDays,
      label: "Departure Date",
      value: formatDate(trip.departureDate),
    },
    {
      icon: CalendarDays,
      label: "Return Date",
      value: trip.returnDate ? formatDate(trip.returnDate) : "",
    },
    { icon: Clock3, label: "Departure Time", value: trip.departureTime },
    { icon: MapPin, label: "Meeting Point", value: trip.meetingPoint },
    { icon: Bus, label: "Transportation", value: trip.vehicle },
    { icon: UserRound, label: "Trip Coordinator", value: trip.coordinator },
    { icon: Phone, label: "Coordinator Contact", value: trip.coordinatorPhone },
  ];

  const tabs = [
    { key: "overview", label: "Overview", icon: Info },
    { key: "itinerary", label: "Itinerary", icon: Route, count: trip.itinerary.length },
    { key: "bookings", label: "Bookings", icon: Ticket, count: bookings.length },
    {
      key: "package",
      label: "Package",
      icon: Hotel,
      count: trip.inclusions.length + trip.exclusions.length,
    },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 print:hidden">
        <button
          type="button"
          onClick={() => navigate("/vendor/trips")}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-white hover:text-teal-700"
        >
          <ArrowLeft size={16} />
          Trips & Departures
        </button>
        <ChevronRight size={15} />
        <span className="font-medium text-slate-800">Trip Details</span>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  heroStatusStyles[trip.status]
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusDotStyles[trip.status]}`}
                />
                {trip.status}
              </span>

              {countdown && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-50 ring-1 ring-inset ring-white/20">
                  {countdown}
                </span>
              )}

              <span className="max-w-full break-all rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-teal-100">
                {trip.id}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {trip.packageName}
            </h1>

            <p className="mt-2 flex items-center gap-2 text-sm text-teal-100">
              <MapPin size={17} className="shrink-0" />
              {trip.destination}
            </p>

            {trip.description && (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-teal-50/90">
                {trip.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {heroChips.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-sm font-medium text-white ring-1 ring-inset ring-white/15 backdrop-blur"
                >
                  <Icon size={15} className="text-teal-200" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 transition hover:bg-white/20"
            >
              <Printer size={16} />
              Print
            </button>

            <button
              type="button"
              onClick={() => navigate("/vendor/trips")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
            >
              <ArrowLeft size={16} />
              Back to Trips
            </button>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarDays}
          label="Departure"
          value={formatDate(trip.departureDate)}
          helper={`At ${trip.departureTime}`}
          iconClass="bg-blue-50 text-blue-700"
        />
        <StatCard
          icon={Users}
          label="Booked Seats"
          value={`${trip.bookedSeats} / ${trip.totalSeats}`}
          helper={`${availableSeats} seats remaining`}
          iconClass="bg-teal-50 text-teal-700"
        />
        <StatCard
          icon={IndianRupee}
          label="Price Per Person"
          value={formatCurrency(trip.price)}
          helper="Package price"
          iconClass="bg-amber-50 text-amber-700"
        />
        <StatCard
          icon={Ticket}
          label="Bookings"
          value={bookings.length}
          helper={`${formatCurrency(trip.price * trip.bookedSeats)} est. value`}
          iconClass="bg-violet-50 text-violet-700"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="min-w-0 space-y-6 xl:col-span-2">
          {/* Tabs */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm print:hidden">
            <div className="flex min-w-max gap-1">
              {tabs.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    activeTab === key
                      ? "bg-teal-700 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-teal-800"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {count !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        activeTab === key
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <Card
              icon={Info}
              title="Departure Information"
              subtitle="Pickup and trip coordination details"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {departureInfo.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition hover:border-teal-100 hover:bg-teal-50/40"
                  >
                    <div className="rounded-lg bg-white p-2.5 text-teal-700 shadow-sm">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500">
                        {label}
                      </p>
                      <p
                        className={`mt-1 break-words text-sm font-semibold ${
                          value ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {value || "Not specified"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Itinerary */}
          {activeTab === "itinerary" && (
            <Card
              icon={Route}
              title="Trip Itinerary"
              subtitle="Planned schedule for the entire trip"
            >
              {trip.itinerary.length > 0 ? (
                <div>
                  {trip.itinerary.map((item, index) => (
                    <div
                      key={`${item.day}-${index}`}
                      className="relative flex gap-4 pb-6 last:pb-0"
                    >
                      <div className="relative flex flex-col items-center">
                        <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white shadow-sm ring-4 ring-teal-50">
                          {index + 1}
                        </div>
                        {index !== trip.itinerary.length - 1 && (
                          <div className="absolute bottom-0 top-10 w-px bg-teal-100" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                        <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold uppercase tracking-wide text-teal-700">
                          {item.day}
                        </span>
                        <h3 className="mt-3 font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Route}
                  title="No itinerary added"
                  text="Add itinerary days in the package to see them here."
                />
              )}
            </Card>
          )}

          {/* Bookings */}
          {activeTab === "bookings" && (
            <Card
              icon={Ticket}
              title={`Bookings for this departure (${bookings.length})`}
              subtitle="Customers and travellers booked on this date"
              action={
                <button
                  type="button"
                  onClick={exportTravellers}
                  disabled={bookings.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
                >
                  <Download size={15} />
                  Export CSV
                </button>
              }
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row print:hidden">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search customer, traveller or booking ID..."
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <select
                  value={bookingFilter}
                  onChange={(event) => setBookingFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 sm:w-44"
                >
                  <option value="All">All bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {filteredBookings.length > 0 ? (
                <ul className="space-y-3">
                  {filteredBookings.map((booking) => {
                    const list = Array.isArray(booking.travellers)
                      ? booking.travellers
                      : [];
                    const customer = getCustomerName(booking);
                    const payment = getPaymentLabel(booking);

                    return (
                      <li
                        key={booking.bookingId}
                        className="rounded-xl border border-slate-100 p-4 transition hover:border-teal-100 hover:bg-teal-50/30"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                              {getInitials(customer)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {customer}
                              </p>
                              <p className="mt-0.5 break-all text-xs text-slate-500">
                                {booking.bookingId}
                              </p>
                              {booking.contact?.phone && (
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                  <Phone size={12} />
                                  {booking.contact.phone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {payment && (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                                {payment}
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${bookingStatusClass(
                                booking.status
                              )}`}
                            >
                              {booking.status || "pending"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 border-t border-slate-100 pt-3">
                          <p className="text-xs font-semibold text-slate-500">
                            {list.length}{" "}
                            {list.length === 1 ? "traveller" : "travellers"}
                          </p>
                          {list.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {list.map((traveller, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                >
                                  <UserRound size={12} />
                                  {getTravellerName(traveller)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No bookings found"
                  text="No bookings are linked to this departure yet."
                />
              )}
            </Card>
          )}

          {/* Package */}
          {activeTab === "package" && (
            <Card
              icon={Hotel}
              title="Package Details"
              subtitle="Services included and excluded from the trip"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Hotel size={17} className="text-emerald-700" />
                    Included
                  </h3>
                  {trip.inclusions.length > 0 ? (
                    <ul className="space-y-3">
                      {trip.inclusions.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Not specified.</p>
                  )}
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5">
                  <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Utensils size={17} className="text-rose-700" />
                    Excluded
                  </h3>
                  {trip.exclusions.length > 0 ? (
                    <ul className="space-y-3">
                      {trip.exclusions.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2 text-sm text-slate-700"
                        >
                          <X
                            size={16}
                            className="mt-0.5 shrink-0 text-rose-500"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">Not specified.</p>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 print:hidden">
          {/* Seat availability */}
          <Card title="Seat Availability">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-4xl font-bold text-slate-900">
                  {availableSeats}
                </p>
                <p className="mt-1 text-sm text-slate-500">Seats available</p>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800">
                {occupancy}% booked
              </span>
            </div>

            <div className="mt-5 flex gap-1.5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-3 flex-1 rounded-full ${
                    index < filledSegments ? "bg-teal-600" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>{trip.bookedSeats} booked</span>
              <span>{trip.totalSeats} total seats</span>
            </div>

            {trip.totalSeats > 0 && availableSeats === 0 && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs font-medium text-amber-800">
                This departure is fully booked.
              </p>
            )}
          </Card>

          {/* Booking summary */}
          <Card title="Booking Summary">
            <div className="rounded-xl bg-gradient-to-br from-teal-50 to-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated booking value</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(trip.price * trip.bookedSeats)}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Price per person</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(trip.price)}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Booked seats</span>
                <span className="font-semibold text-slate-800">
                  {trip.bookedSeats}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Total capacity</span>
                <span className="font-semibold text-slate-800">
                  {trip.totalSeats}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Estimated value only. Actual revenue should come from payment
              records.
            </p>
          </Card>

          {/* Status management */}
          <Card
            title="Trip Status"
            subtitle="Manage the operational state of this departure."
          >
            <div className="grid grid-cols-2 gap-2">
              {TRIP_STATUSES.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    setStatus(item);
                    setStatusMessage("");
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    status === item
                      ? statusChipStyles[item]
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {!isLocked && (
              <button
                type="button"
                onClick={saveStatus}
                disabled={status === trip.status}
                className="mt-3 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Changes
              </button>
            )}

            {statusMessage && (
              <p
                role="status"
                className="mt-3 flex items-start gap-2 text-sm leading-5 text-teal-700"
              >
                <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                {statusMessage}
              </p>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                Trip dates and seat capacity come from the linked package.
                Status changes are saved on this device.
              </p>
            </div>
          </Card>

          {/* Coordinator */}
          {(trip.coordinator || trip.coordinatorPhone) && (
            <section className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                  {getInitials(trip.coordinator)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                    Trip Coordinator
                  </p>
                  {trip.coordinator && (
                    <p className="truncate font-semibold text-teal-950">
                      {trip.coordinator}
                    </p>
                  )}
                </div>
              </div>
              {trip.coordinatorPhone && (
                <a
                  href={`tel:${trip.coordinatorPhone}`}
                  className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                >
                  <Phone size={15} />
                  {trip.coordinatorPhone}
                </a>
              )}
            </section>
          )}
        </aside>
      </div>

      {/* Cancellation confirmation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-heading"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CircleAlert size={23} />
            </div>

            <h2
              id="cancel-heading"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Cancel this departure?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will mark the trip as cancelled. Confirm any affected
              bookings and refunds separately.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Trip
              </button>

              <button
                type="button"
                onClick={confirmCancellation}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}