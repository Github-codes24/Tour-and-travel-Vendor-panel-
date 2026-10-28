import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Search,
  CalendarDays,
  Users,
  IndianRupee,
  Eye,
  MapPin,
  Clock3,
  Phone,
  Mail,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  BedDouble,
  IdCard,
  Plane,
  Printer,
  ShieldAlert,
  Utensils,
} from "lucide-react";
import {
  BOOKING_STORAGE_KEY,
  getBookings,
  saveBooking,
  updateBooking,
} from "../../utils/bookingStorage";
import packages from "../../data/Package.js";

const statusStyles = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  completed: "bg-blue-50 text-blue-700 ring-blue-200",
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) => {
  if (!date) return "—";
  const value = new Date(date.length === 10 ? `${date}T00:00:00` : date);
  if (Number.isNaN(value.getTime())) return "—";
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

function toVendorBooking(booking) {
  const travellers = Array.isArray(booking.travellers)
    ? booking.travellers
    : [];
  const leadTraveller = travellers[0];
  const contact = booking.contact || {};

  return {
    ...booking,
    id: booking.bookingId,
    customer:
      contact.name ||
      contact.fullName ||
      leadTraveller?.name ||
      [leadTraveller?.firstName, leadTraveller?.lastName]
        .filter(Boolean)
        .join(" ") ||
      "Customer",
    email: contact.email || "",
    phone: [contact.code, contact.mobile || contact.phone]
      .filter(Boolean)
      .join(" "),
    packageName: booking.pkgTitle || "Tour package",
    destination: booking.city || "—",
    departureDate: booking.date || "",
    bookedOn: booking.createdAt || "",
    travelers: travellers.length,
    amount: Number(booking.total) || 0,
    status: booking.status || "pending",
  };
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status === "confirmed" && <CheckCircle2 size={13} />}
      {status === "pending" && <Clock size={13} />}
      {status === "cancelled" && <XCircle size={13} />}
      <span className="capitalize">{status}</span>
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </h3>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function BookingDetailsPageContent({ booking, onStatusChange }) {
  if (!booking) return null;
  const travellers = Array.isArray(booking.travellers)
    ? booking.travellers
    : [];
  const rooms = Array.isArray(booking.rooms) ? booking.rooms : [];
  const emergency = booking.emergencyContact || {};
  const departureTime = booking.departureDate
    ? new Date(booking.departureDate).setHours(0, 0, 0, 0)
    : Number.NaN;
  const daysUntilDeparture = Number.isNaN(departureTime)
    ? null
    : Math.ceil((departureTime - new Date().setHours(0, 0, 0, 0)) / 86400000);
  const tripCountdown =
    booking.status === "cancelled"
      ? "Cancelled"
      : daysUntilDeparture === null
        ? "Date not provided"
        : daysUntilDeparture < 0
          ? "Trip completed"
          : daysUntilDeparture === 0
            ? "Departure today"
            : daysUntilDeparture === 1
              ? "Departure tomorrow"
              : `Departure in ${daysUntilDeparture} days`;
  const timeline = [
    { label: "Booking received", date: booking.bookedOn },
    booking.updatedAt && {
      label: "Booking details last updated",
      date: booking.updatedAt,
    },
    booking.status === "confirmed" && {
      label: "Booking confirmed",
      date: booking.updatedAt || booking.bookedOn,
    },
    booking.status === "cancelled" && {
      label: "Booking cancelled",
      date: booking.cancelledAt || booking.updatedAt,
    },
    { label: "Departure", date: booking.departureDate },
  ].filter(Boolean);

  return (
    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
      <section className="relative isolate overflow-hidden bg-violet-950 px-5 py-8 text-white sm:px-8 sm:py-10">
        {booking.pkgImage && (
          <img
            src={booking.pkgImage}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20 blur-sm"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-950/95 via-violet-900/90 to-violet-900/80" />
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <Link
              to="/vendor/bookings"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <ArrowLeft size={16} />
              Back to bookings
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StatusBadge status={booking.status} />
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
                {tripCountdown}
              </span>
            </div>
            <h1
              id="booking-details-title"
              className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              {booking.packageName}
            </h1>
            {booking.isDemo && (
              <span className="mt-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">
                Sample booking
              </span>
            )}
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-violet-100">
              <Ticket size={16} />
              Booking ID
              <span className="font-mono font-semibold text-white">
                {booking.id}
              </span>
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-violet-100/90">
              <MapPin size={16} />
              {booking.destination}
            </p>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-violet-900 ring-4 ring-white/80">
            {booking.pkgImage ? (
              <img
                src={booking.pkgImage}
                alt={booking.packageName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-violet-100">
                <Plane size={42} />
              </div>
            )}
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-violet-800">
              {booking.destination}
            </span>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-5xl space-y-6 px-4 pb-8 sm:px-6">
        <section className="relative -mt-5 grid overflow-hidden rounded-2xl bg-white shadow-lg sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Travel date",
              value: formatDate(booking.departureDate),
              Icon: CalendarDays,
            },
            { label: "Departure", value: booking.destination, Icon: MapPin },
            {
              label: "Travellers",
              value: `${travellers.length} ${travellers.length === 1 ? "person" : "people"}`,
              Icon: Users,
            },
            {
              label: "Total amount",
              value: formatCurrency(booking.amount),
              Icon: IndianRupee,
            },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0 sm:border-r lg:border-b-0"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {label}
                </p>
                <p className="truncate font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer & contact details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Primary contact for this booking
                </p>
              </div>
              <Users className="text-violet-700" size={22} />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer name
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {booking.customer}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Booking date
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {formatDate(booking.bookedOn)}
                </p>
              </div>
              <p className="flex min-w-0 items-center gap-2 break-all text-sm text-slate-600">
                <Mail size={16} className="shrink-0 text-violet-700" />
                {booking.email || "Email not provided"}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={16} className="shrink-0 text-violet-700" />
                {booking.phone || "Phone not provided"}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 text-white">
                <Clock size={19} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Booking timeline
              </h2>
            </div>
            <ol className="mt-5 space-y-4">
              {timeline.map((event, index) => (
                <li
                  key={`${event.label}-${index}`}
                  className="relative flex gap-3"
                >
                  {index < timeline.length - 1 && (
                    <span className="absolute left-[11px] top-6 h-[calc(100%+0.25rem)] w-px bg-slate-200" />
                  )}
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700">
                    {index === timeline.length - 1 ? (
                      <Plane size={13} />
                    ) : (
                      <CheckCircle2 size={14} />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {event.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Room & guest breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {rooms.length} {rooms.length === 1 ? "room" : "rooms"} ·{" "}
                {travellers.length}{" "}
                {travellers.length === 1 ? "traveller" : "travellers"}
              </p>
            </div>
            <BedDouble className="text-violet-700" size={22} />
          </div>
          {rooms.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, index) => (
                <div
                  key={`${booking.id}-room-${index}`}
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="font-semibold text-slate-800">
                    Room {index + 1}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {[
                      room.adult && `${room.adult} adults`,
                      room.childBed && `${room.childBed} children (with bed)`,
                      room.childNoBed &&
                        `${room.childNoBed} children (without bed)`,
                      room.infant && `${room.infant} infants`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Guest count not provided"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No room breakdown was provided.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Traveller details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Identity, room and travel preferences
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {travellers.length}{" "}
              {travellers.length === 1 ? "person" : "people"}
            </span>
          </div>
          {travellers.length ? (
            <ul className="mt-5 grid gap-4 md:grid-cols-2">
              {travellers.map((traveller, index) => {
                const name =
                  traveller.name ||
                  [traveller.firstName, traveller.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  `Traveller ${index + 1}`;
                const idNumber = traveller.idNumber || traveller.passport || "";
                const idType =
                  traveller.idType || (traveller.passport ? "Passport" : "ID");
                const age =
                  traveller.age ??
                  (traveller.dob && booking.departureDate
                    ? Math.floor(
                        (new Date(booking.departureDate) -
                          new Date(traveller.dob)) /
                          31557600000,
                      )
                    : null);
                return (
                  <li
                    key={`${booking.id}-traveller-${index}`}
                    className="overflow-hidden rounded-2xl border border-slate-200"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-violet-600 to-violet-500" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {traveller.title ? `${traveller.title} ` : ""}
                            {name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {[
                              traveller.gender,
                              age !== null && age >= 0 ? `${age} yrs` : "",
                            ]
                              .filter(Boolean)
                              .join(" · ") || "Personal details"}
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {traveller.type && (
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                            {traveller.type}
                          </span>
                        )}
                        {traveller.room && (
                          <span className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                            <BedDouble size={13} /> Room {traveller.room}
                          </span>
                        )}
                        {traveller.meal && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
                            <Utensils size={13} /> {traveller.meal}
                          </span>
                        )}
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-dashed border-slate-200 pt-3 text-xs">
                        {traveller.dob && (
                          <div>
                            <dt className="text-slate-400">Date of birth</dt>
                            <dd className="mt-0.5 text-slate-700">
                              {formatDate(traveller.dob)}
                            </dd>
                          </div>
                        )}
                        {traveller.nationality && (
                          <div>
                            <dt className="text-slate-400">Nationality</dt>
                            <dd className="mt-0.5 text-slate-700">
                              {traveller.nationality}
                            </dd>
                          </div>
                        )}
                        <div className="col-span-2 flex items-start gap-2">
                          <IdCard
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <div>
                            <dt className="text-slate-400">
                              {idNumber ? idType : "Identification"}
                            </dt>
                            <dd className="break-all font-mono text-slate-700">
                              {idNumber || "Not provided"}
                            </dd>
                          </div>
                        </div>
                        {traveller.passportIssue && (
                          <div>
                            <dt className="text-slate-400">Passport issued</dt>
                            <dd className="mt-0.5 text-slate-700">
                              {formatDate(traveller.passportIssue)}
                            </dd>
                          </div>
                        )}
                        {traveller.passportExpiry && (
                          <div>
                            <dt className="text-slate-400">Passport expires</dt>
                            <dd className="mt-0.5 text-slate-700">
                              {formatDate(traveller.passportExpiry)}
                            </dd>
                          </div>
                        )}
                      </dl>
                      {traveller.special && (
                        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          Special request: {traveller.special}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No traveller details were provided.
            </p>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-amber-700" size={20} />
              <h2 className="font-bold text-slate-900">Emergency contact</h2>
            </div>
            {emergency.name || emergency.mobile ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-slate-500">Name</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {emergency.name || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Relation</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {emergency.relation || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Mobile</dt>
                  <dd className="mt-1 font-semibold text-slate-800">
                    {emergency.mobile || "Not provided"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                No emergency contact was provided.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
            <div>
              <p className="text-sm text-slate-600">Total booking amount</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(booking.amount)}
              </p>
            </div>
            <IndianRupee size={30} className="text-violet-700" />
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 print:hidden"
          >
            <Printer size={16} /> Print details
          </button>
          {booking.status === "pending" && (
            <button
              type="button"
              onClick={() => onStatusChange(booking.id, "confirmed")}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 print:hidden"
            >
              Confirm booking
            </button>
          )}
          {booking.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => onStatusChange(booking.id, "cancelled")}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 print:hidden"
            >
              Cancel booking
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const refreshBookings = () => {
      try {
        let savedBookings = getBookings();
        if (savedBookings.length === 0) {
          const pkg = packages.find((item) => item.status === "Published");
          if (pkg) {
            const price = Number(pkg.tourTypes?.[0]?.price ?? pkg.price ?? 0);
            savedBookings = [
              saveBooking({
                bookingId: `DEMO-${pkg.slug}`,
                pkgId: pkg.id,
                pkgSlug: pkg.slug,
                pkgTitle: pkg.title,
                pkgImage: pkg.images?.[0] || "",
                international: pkg.category === "International",
                city: pkg.destination,
                date: pkg.departure,
                contact: {
                  name: "Demo Customer",
                  email: "demo@example.com",
                  code: "+91",
                  mobile: "9000000000",
                },
                travellers: [
                  {
                    title: "Mr",
                    name: "Demo Customer",
                    type: "Adult",
                    room: 1,
                    gender: "Male",
                    dob: "1995-05-15",
                    age: 31,
                    nationality: "Indian",
                    idType: "Passport",
                    idNumber: "DEMO12345",
                    passport: "DEMO12345",
                    passportIssue: "2022-01-01",
                    passportExpiry: "2032-01-01",
                    meal: "Vegetarian",
                  },
                  {
                    title: "Ms",
                    name: "Demo Traveller",
                    type: "Adult",
                    room: 1,
                    gender: "Female",
                    dob: "1997-08-20",
                    age: 29,
                    nationality: "Indian",
                    idType: "Passport",
                    idNumber: "DEMO67890",
                    passport: "DEMO67890",
                    passportIssue: "2022-02-01",
                    passportExpiry: "2032-02-01",
                    meal: "Vegetarian",
                  },
                ],
                rooms: [{ adult: 2, childBed: 0, childNoBed: 0, infant: 0 }],
                emergencyContact: {
                  name: "Demo Emergency Contact",
                  relation: "Friend",
                  mobile: "9000000001",
                },
                total: price * 2,
                status: "pending",
                createdAt: new Date().toISOString(),
                isDemo: true,
              }),
            ];
          }
        }
        setBookings(savedBookings.map(toVendorBooking));
      } catch (error) {
        console.error("Unable to load bookings from local storage.", error);
        toast.error("Unable to load bookings. Check the saved booking data.");
      }
    };

    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") refreshBookings();
    };

    refreshBookings();
    const handleStorage = (event) => {
      if (event.key === BOOKING_STORAGE_KEY || event.key === null) {
        refreshBookings();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshWhenActive);
    window.addEventListener("pageshow", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshWhenActive);
      window.removeEventListener("pageshow", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, []);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter(
      (booking) => booking.status !== "cancelled",
    );

    return {
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      travelers: activeBookings.reduce((sum, b) => sum + b.travelers, 0),
      revenue: bookings
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.amount, 0),
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        [
          booking.id,
          booking.customer,
          booking.email,
          booking.packageName,
          booking.destination,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "All" || booking.status === statusFilter;

      const matchesDate = !dateFilter || booking.departureDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, search, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));

  const displayedPage = Math.min(currentPage, totalPages);
  const pageBookings = filteredBookings.slice(
    (displayedPage - 1) * pageSize,
    displayedPage * pageSize,
  );

  const handleBookingStatusChange = (bookingId, status) => {
    try {
      const now = new Date().toISOString();

      const patch =
        status === "cancelled"
          ? {
              status,
              cancelledAt: now,
              updatedAt: now,
            }
          : {
              status,
              updatedAt: now,
            };

      const updatedBooking = updateBooking(bookingId, patch);

      if (!updatedBooking) {
        toast.error("Booking not found.");
        return;
      }

      setBookings((previousBookings) =>
        previousBookings.map((booking) =>
          booking.id === bookingId ? toVendorBooking(updatedBooking) : booking,
        ),
      );

      toast.success("Booking status updated successfully.");
    } catch (error) {
      console.error("Unable to update booking status.", error);
      toast.error("Unable to update booking status.");
    }
  };

  const exportBookings = () => {
    const headers = [
      "Booking ID",
      "Customer",
      "Email",
      "Package",
      "Destination",
      "Departure Date",
      "Travelers",
      "Amount",
      "Booking Status",
    ];

    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredBookings.map((booking) => [
      booking.id,
      booking.customer,
      booking.email,
      booking.packageName,
      booking.destination,
      booking.departureDate,
      booking.travelers,
      booking.amount,
      booking.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "safar2you-bookings.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-w-0 space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">Vendor Portal / Operations</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bookings
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review reservations created by customers and manage their booking
            status.
          </p>
        </div>

        <button
          type="button"
          onClick={exportBookings}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.total}
          description="All recorded reservations"
          icon={Ticket}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Confirmed"
          value={stats.confirmed}
          description="Successfully confirmed trips"
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Confirmation"
          value={stats.pending}
          description="Require booking review"
          icon={Clock3}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Confirmed Booking Value"
          value={formatCurrency(stats.revenue)}
          description={`${stats.travelers} travellers on active bookings`}
          icon={IndianRupee}
          color="bg-violet-50 text-violet-700"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={17} className="text-violet-700" />
          <h2 className="font-semibold text-slate-900">Filter bookings</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative xl:col-span-2">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, customer, package..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500"
            aria-label="Filter by booking status"
          >
            <option value="All">All booking statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by departure date"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-500 sm:col-span-2 xl:col-span-1"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-violet-700 hover:text-violet-800"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Booking table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">All Reservations</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review customers and upcoming departures.
            </p>
          </div>

          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
            {filteredBookings.length} results
          </span>
        </div>

        {pageBookings.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-16 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <Search size={25} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No bookings found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    {[
                      "Booking / Customer",
                      "Package",
                      "Departure",
                      "Travelers",
                      "Amount",
                      "Booking Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500 first:pl-5 last:pr-5"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pageBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 pl-5">
                        <p className="text-sm font-semibold text-slate-900">
                          {booking.customer}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.id}
                          {booking.isDemo && (
                            <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 font-medium text-sky-700">
                              Sample
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="max-w-[220px] px-4 py-4">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {booking.packageName}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin size={12} />
                          {booking.destination}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {formatDate(booking.departureDate)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Booked {formatDate(booking.bookedOn)}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                          <Users size={15} className="text-slate-400" />
                          {booking.travelers}{" "}
                          {booking.travelers === 1 ? "traveller" : "travellers"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">
                        {formatCurrency(booking.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={booking.status}
                          onChange={(event) =>
                            handleBookingStatusChange(
                              booking.id,
                              event.target.value,
                            )
                          }
                          aria-label={`Change booking status for ${booking.customer}`}
                          className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium capitalize text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-300 focus:ring-0"
                        >
                          <option value="pending">Pending</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>

                          {booking.status === "confirmed" && (
                            <option value="confirmed">Confirmed</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-4 pr-5">
                        <Link
                          to={`/vendor/bookings/${encodeURIComponent(booking.id)}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Eye size={14} />
                          View
                          <ArrowUpRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-slate-500">
                  Showing {(displayedPage - 1) * pageSize + 1}–
                  {Math.min(displayedPage * pageSize, filteredBookings.length)}{" "}
                  of {filteredBookings.length}
                </p>

                <label className="flex items-center gap-2 text-sm text-slate-500">
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-violet-500"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
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
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={17} />
                </button>

                {getPageNumbers(displayedPage, totalPages).map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`dots-${index}`}
                      className="px-2 text-sm text-slate-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      aria-current={page === displayedPage ? "page" : undefined}
                      className={`min-w-9 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        page === displayedPage
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
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
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight size={17} />
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function BookingDetailsPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshBooking = () => {
      try {
        const rawBooking = getBookings().find(
          (item) => item.bookingId === bookingId,
        );
        setBooking(rawBooking ? toVendorBooking(rawBooking) : null);
        setLoadError("");
        setLoading(false);
      } catch (error) {
        console.error("Unable to load booking details.", error);
        setLoadError(
          "Unable to load this booking. Check the saved booking data.",
        );
        setLoading(false);
      }
    };

    const refreshWhenActive = () => {
      if (document.visibilityState === "visible") refreshBooking();
    };
    const handleStorage = (event) => {
      if (event.key === BOOKING_STORAGE_KEY || event.key === null) {
        refreshBooking();
      }
    };

    refreshBooking();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", refreshWhenActive);
    window.addEventListener("pageshow", refreshWhenActive);
    document.addEventListener("visibilitychange", refreshWhenActive);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", refreshWhenActive);
      window.removeEventListener("pageshow", refreshWhenActive);
      document.removeEventListener("visibilitychange", refreshWhenActive);
    };
  }, [bookingId]);

  const updateStatus = (id, status) => {
    try {
      const patch =
        status === "cancelled"
          ? {
              status,
              cancelledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : { status, updatedAt: new Date().toISOString() };
      const updatedBooking = updateBooking(id, patch);
      if (!updatedBooking) {
        toast.error("This booking no longer exists.");
        return;
      }
      setBooking(toVendorBooking(updatedBooking));
      toast.success(`Booking ${status}.`);
    } catch (error) {
      console.error("Unable to update booking status.", error);
      toast.error("Unable to update booking. Please try again.");
    }
  };

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p role="alert" className="text-sm text-rose-700">
          {loadError}
        </p>
        <Link
          to="/vendor/bookings"
          className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading booking details…
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-lg font-bold text-slate-900">Booking not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This booking may have been removed or is not available in this
          browser.
        </p>
        <Link
          to="/vendor/bookings"
          className="mt-4 inline-flex rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  return (
    <BookingDetailsPageContent
      booking={booking}
      onStatusChange={updateStatus}
    />
  );
}