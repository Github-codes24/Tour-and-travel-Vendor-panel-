
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Ban,
  Users,
  Wallet,
  Plane,
  Armchair,
  Save,
  Pencil,
  CalendarDays,
  X,
  Trash2,
  Clock3,
} from "lucide-react";
import defaultPackages from "../../data/Package.jsx";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PACKAGE_STORAGE_KEY = "tour_vendor_packages_v1";
const BLOCKED_DATES_KEY = "tour_vendor_calendar_blocked_v1";

const pad = (n) => String(n).padStart(2, "0");

const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const keyOf = (date) =>
  toKey(date.getFullYear(), date.getMonth(), date.getDate());

function readPackageCatalog() {
  try {
    const saved = localStorage.getItem(PACKAGE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Unable to read vendor packages for calendar:", error);
  }

  return defaultPackages;
}

function createPackageEvents(packages) {
  return packages.flatMap((pkg) => {
    const departures = pkg.departures || {};
    const entries = Object.entries(departures);
    const source = entries.length
      ? entries
      : pkg.departure
        ? [[pkg.departure, {
            adultPrice: pkg.price,
            totalSeats: pkg.seats,
            bookedSeats: pkg.booked,
            status: "Available",
          }]]
        : [];

    return source.map(([date, departure]) => ({
      id: `${pkg.id}-${date}`,
      date,
      packageId: String(pkg.id),
      title: pkg.title || pkg.name || "Untitled package",
      destination: pkg.destination || "",
      duration: pkg.duration || "",
      image: pkg.image || pkg.images?.[0] || "",
      capacity: Number(departure.totalSeats ?? pkg.seats) || 0,
      booked: Number(departure.bookedSeats ?? pkg.booked) || 0,
      price: Number(departure.adultPrice ?? pkg.price) || 0,
      childPrice: departure.childPrice,
      status: departure.status || "Available",
    }));
  });
}

function readBlockedDates() {
  try {
    const saved = localStorage.getItem(BLOCKED_DATES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Unable to read blocked calendar dates:", error);
    return [];
  }
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const initialPackages = [
  {
    id: "kashmir",
    title: "Kashmir Valley Escape",
    capacity: 20,
    price: 24500,
  },
  {
    id: "goa",
    title: "Goa Beach Retreat",
    capacity: 16,
    price: 12800,
  },
  {
    id: "rajasthan",
    title: "Rajasthan Heritage Trail",
    capacity: 24,
    price: 18900,
  },
  {
    id: "kerala",
    title: "Kerala Backwaters",
    capacity: 12,
    price: 21400,
  },
];

function getStatus(event) {
  if (event.booked >= event.capacity) return "full";
  if (event.booked / event.capacity >= 0.6) return "filling";
  return "open";
}

const STATUS = {
  open: {
    label: "Seats available",
    chip: "border-teal-200 bg-teal-50 text-teal-800",
    bar: "bg-teal-500",
    dot: "bg-teal-500",
  },
  filling: {
    label: "Filling fast",
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
  },
  full: {
    label: "Sold out",
    chip: "border-rose-200 bg-rose-50 text-rose-800",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
  },
};

const dateFromKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function AvailabilityCalendar({ departures = {} }) {
  const departureDates = useMemo(() => Object.keys(departures).sort(), [departures]);
  const todayKey = keyOf(new Date());
  const initialDate =
    departureDates.find((date) => date >= todayKey) ||
    departureDates[0] ||
    todayKey;
  const [selectedKey, setSelectedKey] = useState(initialDate);
  const [cursor, setCursor] = useState(() => {
    const date = dateFromKey(initialDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const leadingDays = (first.getDay() + 6) % 7;

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        1 - leadingDays + index,
      );
      return {
        date,
        key: keyOf(date),
        inMonth: date.getMonth() === cursor.getMonth(),
      };
    });
  }, [cursor]);

  const selectedDeparture = departures[selectedKey];
  const selectedDate = dateFromKey(selectedKey);
  const monthLabel = cursor.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const selectedLabel = selectedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
          <h3 className="font-semibold text-slate-900">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setSelectedKey(todayKey);
                setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
              }}
              className="rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
            >
              Today
            </button>
            {[-1, 1].map((amount) => {
              const Icon = amount < 0 ? ChevronLeft : ChevronRight;
              return (
                <button
                  key={amount}
                  type="button"
                  aria-label={amount < 0 ? "Previous month" : "Next month"}
                  onClick={() =>
                    setCursor(
                      (current) =>
                        new Date(
                          current.getFullYear(),
                          current.getMonth() + amount,
                          1,
                        ),
                    )
                  }
                  className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-slate-900"
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="px-1 py-2 text-center text-xs font-semibold text-slate-500 sm:text-sm"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map(({ date, key, inMonth }, index) => {
            const departure = departures[key];
            const capacity = Number(departure?.totalSeats || 0);
            const available = Math.max(
              0,
              capacity - Number(departure?.bookedSeats || 0),
            );

            return (
              <button
                key={key}
                type="button"
                aria-label={`${date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}${departure ? `, ${available} seats available` : ""}`}
                aria-pressed={key === selectedKey}
                onClick={() => {
                  setSelectedKey(key);
                  if (!inMonth) {
                    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                className={`flex min-h-[4.5rem] min-w-0 flex-col items-center gap-1 border-b border-r border-slate-100 p-1.5 text-center transition sm:min-h-[5.5rem] sm:p-2 ${
                  index % 7 === 6 ? "border-r-0" : ""
                } ${
                  key === selectedKey
                    ? "bg-emerald-50 ring-2 ring-inset ring-emerald-600"
                    : inMonth
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50/70 text-slate-400"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                    key === todayKey
                      ? "bg-emerald-700 text-white"
                      : inMonth
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {date.getDate()}
                </span>
                {departure && (
                  <span
                    className={`max-w-full truncate rounded px-1 py-0.5 text-[10px] font-medium sm:text-xs ${
                      available === 0
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {capacity ? `${available} left` : "Departure"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="min-w-0 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={18} className="shrink-0 text-emerald-700" />
            <h3 className="font-semibold text-slate-900">{selectedLabel}</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {selectedDeparture ? "Scheduled departure" : "No departure scheduled"}
          </p>
        </div>
        <div className="space-y-3 p-4">
          {selectedDeparture ? (
            <>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Seats booked</span>
                <span className="font-semibold text-slate-900">
                  {Number(selectedDeparture.bookedSeats || 0)} /{" "}
                  {Number(selectedDeparture.totalSeats || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Seats available</span>
                <span className="font-semibold text-slate-900">{Math.max(0, Number(selectedDeparture.totalSeats || 0) - Number(selectedDeparture.bookedSeats || 0))}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Adult price</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(selectedDeparture.adultPrice)}
                </span>
              </div>
              {selectedDeparture.childPrice != null &&
                selectedDeparture.childPrice !== "" && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">Child price</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(selectedDeparture.childPrice)}
                    </span>
                  </div>
                )}
              {selectedDeparture.status && (
                <p className="border-t border-slate-100 pt-3 text-sm text-slate-600">
                  Status: {selectedDeparture.status}
                </p>
              )}
            </>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
              Select a highlighted date to view departure details.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-3 sm:gap-3.5 sm:px-4 sm:py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 sm:h-10 sm:w-10">
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs leading-tight text-slate-500 sm:text-sm">{label}</p>
        <p className="mt-1 break-words text-base font-semibold leading-tight text-slate-900 sm:text-xl">
          {value}
        </p>
      </div>
    </div>
  );
}

function SeatBar({ event }) {
  const percentage =
    event.capacity > 0
      ? Math.min(100, Math.round((event.booked / event.capacity) * 100))
      : 0;

  const status = getStatus(event);

  return (
    <div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all ${STATUS[status].bar}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-right text-xs text-slate-500">
        {percentage}% booked
      </p>
    </div>
  );
}

const emptyForm = {
  packageId: initialPackages[0].id,
  date: "",
  capacity: String(initialPackages[0].capacity),
  price: String(initialPackages[0].price),
};

export default function VendorCalendar({
  events: eventsProp,
  packages: packagesProp,
  departures: departuresProp,
  onChange,
  defaults = {},
  packageTitle = "Current package",
  blockedDates: blockedProp = [],
  onAddDeparture,
  onToggleBlock,
  onOpenTrip,
  onUpdateDeparture,
}) {
  const departureMode = departuresProp !== undefined;
  const [packageCatalog, setPackageCatalog] = useState(() =>
    packagesProp ?? readPackageCatalog(),
  );
  const packages =
    packagesProp ??
    (departureMode
      ? [
          {
            id: "current-package",
            title: packageTitle,
            capacity: Number(defaults.totalSeats) || 20,
            price: Number(defaults.adultPrice) || 0,
          },
        ]
      : packageCatalog);

  const [internalEvents, setInternalEvents] = useState(
    () => eventsProp ?? createPackageEvents(packages)
  );
  const departureEvents = useMemo(
    () =>
      Object.entries(departuresProp || {}).map(([date, departure]) => ({
        id: `current-package-${date}`,
        date,
        packageId: "current-package",
        title: packageTitle,
        capacity: Number(departure.totalSeats) || 0,
        booked: Number(departure.bookedSeats) || 0,
        price: Number(departure.adultPrice) || 0,
        childPrice: departure.childPrice,
        status: departure.status || "Available",
      })),
    [departuresProp, packageTitle],
  );
  const events = departureMode ? departureEvents : internalEvents;

  const today = new Date();
  const todayKey = keyOf(today);

  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selected, setSelected] = useState(todayKey);
  const [packageFilter, setPackageFilter] = useState("all");
  const [blocked, setBlocked] = useState(
    () => new Set(blockedProp.length ? blockedProp : readBlockedDates()),
  );

  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editError, setEditError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    ...emptyForm,
    date: todayKey,
  });
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          packageFilter === "all" ||
          String(event.packageId) === String(packageFilter)
      ),
    [events, packageFilter]
  );

  const byDate = useMemo(() => {
    const map = {};

    filteredEvents.forEach((event) => {
      (map[event.date] ||= []).push(event);
    });

    return map;
  }, [filteredEvents]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const lead = (first.getDay() + 6) % 7;

    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(year, month, 1 - lead + i);

      return {
        date,
        key: keyOf(date),
        inMonth: date.getMonth() === month,
      };
    });
  }, [year, month]);

  const summary = useMemo(() => {
    const prefix = `${year}-${pad(month + 1)}-`;

    const list = filteredEvents.filter((event) =>
      event.date.startsWith(prefix)
    );

    return {
      departures: list.length,
      booked: list.reduce((sum, event) => sum + event.booked, 0),
      left: list.reduce(
        (sum, event) => sum + Math.max(0, event.capacity - event.booked),
        0
      ),
      revenue: list.reduce(
        (sum, event) => sum + event.booked * event.price,
        0
      ),
    };
  }, [filteredEvents, year, month]);

  const selectedEvents = byDate[selected] || [];
  const selectedBlocked = blocked.has(selected);

  const selectedLabel = new Date(
    `${selected}T00:00:00`
  ).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const updateEvents = (updater) => {
    const nextEvents =
      typeof updater === "function" ? updater(events) : updater;

    if (departureMode) {
      onChange?.(
        Object.fromEntries(
          nextEvents.map((event) => [
            event.date,
            {
              adultPrice: event.price,
              childPrice: event.childPrice ?? "",
              totalSeats: event.capacity,
              bookedSeats: event.booked,
              status: event.status || "Available",
            },
          ]),
        ),
      );
      return;
    }

    setInternalEvents(nextEvents);
    const nextCatalog = packageCatalog.map((pkg) => {
      const pkgEvents = nextEvents
        .filter((event) => event.packageId === String(pkg.id))
        .sort((a, b) => a.date.localeCompare(b.date));
      const departures = Object.fromEntries(
        pkgEvents.map((event) => [
          event.date,
          {
            adultPrice: event.price,
            childPrice: event.childPrice ?? "",
            totalSeats: event.capacity,
            bookedSeats: event.booked,
            status: event.status || "Available",
          },
        ]),
      );

      return {
        ...pkg,
        departures,
        departure: pkgEvents[0]?.date || "",
      };
    });
    setPackageCatalog(nextCatalog);
    try {
      localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(nextCatalog));
    } catch (error) {
      console.error("Unable to save calendar departures:", error);
      setNotice("Calendar changed, but could not be saved to package storage.");
    }
  };

  const shiftMonth = (delta) => {
    setCursor(new Date(year, month + delta, 1));
    setEditingId(null);
  };

  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(todayKey);
    setEditingId(null);
  };

  const toggleBlock = (key) => {
    const next = new Set(blocked);

    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }

    setBlocked(next);
    try {
      localStorage.setItem(BLOCKED_DATES_KEY, JSON.stringify([...next]));
    } catch (error) {
      console.error("Unable to save blocked calendar dates:", error);
      setNotice("Date block changed, but could not be saved.");
      return;
    }
    onToggleBlock?.(key);
    setNotice(next.has(key) ? "Date blocked successfully." : "Date unblocked.");
  };

  const startEditing = (event) => {
    setEditingId(event.id);
    setEditPrice(String(event.price));
    setEditCapacity(String(event.capacity));
    setEditError("");
  };

  const saveAvailabilityPricing = (event) => {
    const price = Number(editPrice);
    const capacity = Number(editCapacity);

    if (
      editPrice.trim() === "" ||
      editCapacity.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity < event.booked
    ) {
      setEditError(
        "Enter a valid price and a whole-number capacity equal to or greater than booked seats."
      );
      return;
    }

    const updated = { ...event, price, capacity };

    updateEvents((previous) =>
      previous.map((item) => (item.id === event.id ? updated : item))
    );

    onUpdateDeparture?.(updated);
    setEditingId(null);
    setEditError("");
    setNotice("Pricing and availability updated.");
  };

  const openAddModal = () => {
    const firstPackage =
      packages.find((pkg) => String(pkg.id) === String(packageFilter)) ||
      packages[0];

    setForm({
      packageId: String(firstPackage?.id ?? ""),
      date: selected,
      capacity: String(firstPackage?.seats ?? firstPackage?.capacity ?? 20),
      price: String(firstPackage?.price ?? 0),
    });

    setFormError("");
    setShowAddModal(true);
  };

  const updateFormPackage = (packageId) => {
    const pkg = packages.find((item) => String(item.id) === String(packageId));

    setForm((previous) => ({
      ...previous,
      packageId,
      capacity: String(pkg?.seats ?? pkg?.capacity ?? 20),
      price: String(pkg?.price ?? 0),
    }));
  };

  const addDeparture = (e) => {
    e.preventDefault();

    const pkg = packages.find((item) => item.id === form.packageId);
    const capacity = Number(form.capacity);
    const price = Number(form.price);

    if (!pkg || !form.date || !Number.isInteger(capacity) || capacity < 1 || !Number.isFinite(price) || price < 0) {
      setFormError("Please enter a valid package, date, capacity and price.");
      return;
    }

    if (blocked.has(form.date)) {
      setFormError("This date is blocked. Unblock it before adding a departure.");
      return;
    }

    const duplicate = events.some(
      (event) =>
        String(event.packageId) === String(pkg.id) &&
        event.date === form.date
    );

    if (duplicate) {
      setFormError("This package already has a departure on that date.");
      return;
    }

    const newEvent = {
      id: `${pkg.id}-${form.date}-${Date.now()}`,
      date: form.date,
      packageId: String(pkg.id),
      title: pkg.title,
      destination: pkg.destination || "",
      duration: pkg.duration || "",
      image: pkg.image || pkg.images?.[0] || "",
      capacity,
      booked: 0,
      price,
    };

    updateEvents((previous) => [...previous, newEvent]);
    onAddDeparture?.(form.date, newEvent);

    setSelected(form.date);
    const date = new Date(`${form.date}T00:00:00`);
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowAddModal(false);
    setPackageFilter("all");
    setNotice("Departure added successfully.");
  };

  return (
    <div className={`min-w-0 ${departureMode ? "space-y-5 p-3 sm:p-5" : "space-y-4"}`}>
      {!departureMode && <h1 className="sr-only">Calendar, Availability &amp; Pricing</h1>}
      {/* Header */}
      <div className={`flex min-w-0 flex-col gap-3 ${departureMode ? "2xl:flex-row 2xl:items-center 2xl:justify-between" : "rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 xl:flex-row xl:items-center xl:justify-between"}`}>
        {departureMode && <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Calendar, Availability & Pricing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage departures, seats and package prices from one place.
          </p>
        </div>}

        <div className={`flex min-w-0 flex-wrap items-center gap-2 ${departureMode ? "" : "w-full xl:w-auto"}`}>
          {!departureMode && (
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              aria-label="Filter packages"
              className="h-10 min-w-0 max-w-full flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 sm:flex-none xl:w-64"
            >
              <option value="all">All packages</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </select>
          )}

          <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-32 px-2 text-center text-sm font-semibold">
              {cursor.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {departureMode && <button
            type="button"
            onClick={goToday}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50"
          >
            Today
          </button>}

          {!departureMode && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs text-slate-600">
              {Object.entries(STATUS).map(([key, status]) => (
                <span key={key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Ban size={12} /> Blocked
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <Plus size={16} />
            Add departure
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className={`grid min-w-0 gap-4 ${departureMode ? "" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.9fr)]"}`}>
        {/* Calendar */}
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div>
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="px-0.5 py-2 text-center text-[11px] font-medium text-slate-500 sm:px-2 sm:py-3 sm:text-sm">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {cells.map(({ date, key, inMonth }, index) => {
                  const dayEvents = byDate[key] || [];
                  const isSelected = selected === key;
                  const isToday = todayKey === key;
                  const isBlocked = blocked.has(key);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelected(key);
                        setEditingId(null);
                        setNotice("");

                        if (!inMonth) {
                          setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
                        }
                      }}
                      aria-pressed={isSelected}
                      className={`flex h-20 min-w-0 flex-col gap-1 overflow-hidden border-b border-r border-slate-100 p-1 text-left transition sm:h-24 sm:p-1.5 xl:h-28 ${
                        index % 7 === 6 ? "border-r-0" : ""
                      } ${
                        isBlocked
                          ? "bg-slate-100"
                          : inMonth
                            ? "bg-white hover:bg-slate-50"
                            : "bg-slate-50/70 hover:bg-slate-100"
                      } ${isSelected ? "relative z-10 outline outline-2 -outline-offset-2 outline-teal-600" : ""}`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-sm font-semibold ${
                          isToday ? "bg-teal-600 text-white" : inMonth ? "text-slate-800" : "text-slate-400"
                        }`}>
                          {date.getDate()}
                        </span>
                        {isBlocked && <Ban size={13} className="text-slate-500" />}
                      </div>

                      {dayEvents.slice(0, departureMode ? 1 : 2).map((event) => (
                        <div
                          key={event.id}
                          title={event.title}
                          className={`min-w-0 truncate rounded px-1 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                            departureMode
                              ? STATUS[getStatus(event)].chip
                              : "bg-white/70 text-slate-500"
                          }`}
                        >
                          {departureMode ? (
                            <span>{Math.max(0, event.capacity - event.booked)} left</span>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS[getStatus(event)].dot}`} />
                                {Math.max(0, event.capacity - event.booked)} seats
                              </span>
                              <span className="block truncate text-slate-400">{inr.format(event.price)}</span>
                            </>
                          )}
                        </div>
                      ))}

                      {dayEvents.length > (departureMode ? 1 : 2) && (
                        <span className="px-1 text-xs text-slate-500">
                          +{dayEvents.length - (departureMode ? 1 : 2)} more
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:px-5 sm:text-sm">
            {Object.entries(STATUS).map(([key, status]) => (
              <span key={key} className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            ))}
            <span className="inline-flex items-center gap-2">
              <Ban size={12} /> Blocked date
            </span>
          </div>
        </section>

        {/* Availability and pricing panel */}
        <aside className="self-start rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-teal-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                {selectedLabel}
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {selectedBlocked
                ? "This date is blocked."
                : `${selectedEvents.length} scheduled ${selectedEvents.length === 1 ? "departure" : "departures"}`}
            </p>
          </div>

          <div className="space-y-4 p-5">
            {selectedEvents.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 px-3 py-7 text-center">
                <CalendarDays size={25} className="mx-auto text-slate-400" />
                <p className="mt-2 text-sm font-medium text-slate-700">
                  No departures
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Add a departure for this date.
                </p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  <Plus size={15} /> Add departure
                </button>
              </div>
            )}

            {selectedEvents.map((event) => {
              const isEditing = editingId === event.id;
              const status = getStatus(event);

              return (
                <div key={event.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() => onOpenTrip?.(event)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    {!departureMode && (
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {event.image ? (
                          <img src={event.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Plane className="m-4 text-slate-400" size={24} />
                        )}
                      </div>
                    )}
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{event.title}</p>
                        {!departureMode && (
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                            {event.duration && <Clock3 size={12} />}
                            {event.duration || event.destination || "Package departure"}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium sm:text-xs ${STATUS[status].chip}`}>
                        {STATUS[status].label}
                      </span>
                    </div>
                  </button>

                  <div className="mt-3">
                    <SeatBar event={event} />
                    <div className="mt-2 flex justify-between gap-2 text-sm text-slate-500">
                      <span>{event.booked} booked, {Math.max(0, event.capacity - event.booked)} left</span>
                      <span className="font-medium text-slate-800">{inr.format(event.price)}</span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Availability & Pricing
                      </h3>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditing(event)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-50"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label htmlFor={`price-${event.id}`} className="mb-1 block text-xs font-medium text-slate-600">
                            Price per person (₹)
                          </label>
                          <input
                            id={`price-${event.id}`}
                            type="number"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>

                        <div>
                          <label htmlFor={`capacity-${event.id}`} className="mb-1 block text-xs font-medium text-slate-600">
                            Total seat capacity
                          </label>
                          <input
                            id={`capacity-${event.id}`}
                            type="number"
                            min={Math.max(1, event.booked)}
                            step="1"
                            value={editCapacity}
                            onChange={(e) => setEditCapacity(e.target.value)}
                            className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          />
                        </div>

                        {editError && (
                          <p role="alert" className="text-xs text-rose-600">{editError}</p>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveAvailabilityPricing(event)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                          >
                            <Save size={15} /> Save changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditError("");
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Total seats</p>
                          <p className="mt-1 text-lg font-semibold">{event.capacity}</p>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Available seats</p>
                          <p className="mt-1 text-lg font-semibold text-teal-700">
                            {Math.max(0, event.capacity - event.booked)}
                          </p>
                        </div>
                        <div className="col-span-2 rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">Price per person</p>
                          <p className="mt-1 text-lg font-semibold">{inr.format(event.price)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Remove the ${event.title} departure from this frontend calendar?`)) {
                        updateEvents((previous) => previous.filter((item) => item.id !== event.id));
                        setEditingId(null);
                        setNotice("Departure removed from the current UI.");
                      }
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    <Trash2 size={13} /> Remove departure
                  </button>
                </div>
              );
            })}

            {!departureMode && (
              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock(selected)}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium ${
                    selectedBlocked
                      ? "border-slate-800 bg-slate-900 text-white hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Ban size={15} />
                  {selectedBlocked ? "Unblock date" : "Block date"}
                </button>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Plus size={15} /> Add departure
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {!departureMode && (
        <div className="grid grid-cols-2 divide-x divide-y divide-teal-100 overflow-hidden rounded-xl border border-teal-100 bg-teal-50/70 sm:grid-cols-4 sm:divide-y-0">
          <Stat icon={Plane} label="Total departures" value={summary.departures} />
          <Stat icon={Users} label="Booked seats" value={summary.booked} />
          <Stat icon={Armchair} label="Available seats" value={summary.left} />
          <Stat icon={Wallet} label="Booked revenue" value={inr.format(summary.revenue)} />
        </div>
      )}

      {/* Add Departure Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-departure-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="add-departure-title" className="text-lg font-bold text-slate-900">
                  Add departure
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Schedule a package for a specific date.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={addDeparture} className="space-y-4 p-5">
              <div>
                <label htmlFor="departure-package" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Package
                </label>
                <select
                  id="departure-package"
                  required
                  value={form.packageId}
                  onChange={(e) => updateFormPackage(e.target.value)}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="departure-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Departure date
                </label>
                <input
                  id="departure-date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((previous) => ({ ...previous, date: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="departure-capacity" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Seat capacity
                  </label>
                  <input
                    id="departure-capacity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm((previous) => ({ ...previous, capacity: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label htmlFor="departure-price" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Price per person (₹)
                  </label>
                  <input
                    id="departure-price"
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm((previous) => ({ ...previous, price: e.target.value }))}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700"
                >
                  <Plus size={16} /> Add departure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
