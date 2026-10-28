import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Bus,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileCheck,
  Gift,
  Hotel,
  Info,
  MapPin,
  Package as PackageIcon,
  Pencil,
  Plane,
  Share2,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  Utensils,
  XCircle,
} from "lucide-react";
import packages from "../../data/Package.js";

/* ---------- helpers ---------- */
const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const compact = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;

const statusStyles = {
  Published: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-700",
  "Pending Review": "bg-amber-50 text-amber-700",
  Rejected: "bg-rose-50 text-rose-700",
};

const TABS = [
  { key: "itinerary", label: "Itinerary" },
  { key: "inclusions", label: "Inclusions" },
  { key: "summary", label: "Summary" },
];

const INCLUSION_ICONS = {
  flights: { Icon: Plane, label: "Flights", tone: "bg-sky-50 text-sky-600" },
  hotels: { Icon: Building2, label: "Hotels", tone: "bg-indigo-50 text-indigo-600" },
  sightseeing: { Icon: Camera, label: "Sightseeing", tone: "bg-violet-50 text-violet-600" },
  meals: { Icon: Utensils, label: "Meals", tone: "bg-amber-50 text-amber-600" },
  meal: { Icon: Utensils, label: "Meal", tone: "bg-amber-50 text-amber-600" },
  visa: { Icon: FileCheck, label: "Visa", tone: "bg-emerald-50 text-emerald-600" },
  tourManager: { Icon: UserCheck, label: "Tour Manager", tone: "bg-rose-50 text-rose-600" },
  transfer: { Icon: Bus, label: "Transfer", tone: "bg-orange-50 text-orange-600" },
};

const INCLUSION_SECTIONS = [
  { key: "flights", label: "Flights", Icon: Plane },
  { key: "hotels", label: "Hotels", title: "Accommodation", Icon: Building2 },
  { key: "sightseeing", label: "Sightseeing", Icon: Camera },
  { key: "meals", label: "Meals", Icon: Utensils },
  { key: "visa", label: "Visa", Icon: FileCheck },
  { key: "tourManager", label: "Tour Manager", Icon: UserCheck },
  { key: "transfer", label: "Transfer", Icon: Bus },
  { key: "others", label: "Others", Icon: PackageIcon },
  { key: "exclusions", label: "Exclusions", Icon: XCircle, warn: true },
  { key: "thingsToNote", label: "Things to Note", Icon: Info, warn: true },
];

const prettyDate = (key) =>
  key
    ? new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not scheduled";

/* ---------- small shared pieces ---------- */
function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-violet-50 p-2 text-violet-700">
          <Icon size={21} />
        </div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 break-words font-bold text-slate-900">
        {value ?? "Not provided"}
      </p>
    </div>
  );
}

function ItemList({ items, emptyText }) {
  if (!items?.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={`${item.title || item}-${index}`}
          className="flex items-start gap-3 text-sm leading-6 text-slate-600"
        >
          <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-600" />
          <span>{typeof item === "string" ? item : item.title}</span>
        </li>
      ))}
    </ul>
  );
}

function BackLink() {
  return (
    <Link
      to="/vendor/packages"
      className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
    >
      <ArrowLeft
        size={17}
        className="transition-transform duration-200 group-hover:-translate-x-1"
      />
      <span>Back to My Packages</span>
    </Link>
  );
}

/* ---------- gallery ---------- */
function Tile({ src, index, title, onOpen, children }) {
  if (!src) return <div className="h-full w-full rounded-lg bg-slate-100" />;
  return (
    <button
      type="button"
      aria-label={`Open photo ${index + 1}`}
      onClick={() => onOpen(index)}
      className="relative block h-full min-h-0 w-full min-w-0 cursor-pointer overflow-hidden rounded-lg bg-slate-100"
    >
      <img
        src={src}
        alt={index === 0 ? title : ""}
        loading={index === 0 ? "eager" : "lazy"}
        className="block h-full w-full object-cover transition duration-300 hover:scale-105"
      />
      {children}
    </button>
  );
}

function Gallery({ images = [], title }) {
  const [open, setOpen] = useState(null);

  if (!images.length) {
    return <p className="text-sm text-slate-500">No photos uploaded.</p>;
  }

  const extra = images.length - 4;

  return (
    <>
      <div className="grid h-[30vh] min-h-[200px] w-full grid-cols-[minmax(0,936fr)_minmax(0,322fr)_minmax(0,321fr)] grid-rows-[minmax(0,250fr)_minmax(0,206fr)] gap-2 sm:h-[38vh] sm:gap-3 lg:gap-5">
        <div className="row-span-2 min-h-0 min-w-0">
          <Tile src={images[0]} index={0} title={title} onOpen={setOpen} />
        </div>
        <div className="col-span-2 min-h-0 min-w-0">
          <Tile src={images[1]} index={1} title={title} onOpen={setOpen} />
        </div>
        <div className="min-h-0 min-w-0">
          <Tile src={images[2]} index={2} title={title} onOpen={setOpen} />
        </div>
        <div className="min-h-0 min-w-0">
          <Tile src={images[3]} index={3} title={title} onOpen={setOpen}>
            {extra > 0 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white sm:text-lg">
                +{extra}
              </span>
            )}
          </Tile>
        </div>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 text-3xl leading-none text-white"
          >
            &times;
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open - 1 + images.length) % images.length);
            }}
            className="absolute left-3 text-4xl text-white sm:left-6"
          >
            &#8249;
          </button>
          <img
            src={images[open]}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open + 1) % images.length);
            }}
            className="absolute right-3 text-4xl text-white sm:right-6"
          >
            &#8250;
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- header ---------- */
function PackageHeader({ pkg }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {[pkg.duration, ...(pkg.tags || [])].filter(Boolean).map((t) => (
            <span
              key={t}
              className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800"
            >
              {t}
            </span>
          ))}
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              statusStyles[pkg.status] || statusStyles.Draft
            }`}
          >
            {pkg.status || "Draft"}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold text-slate-900 md:text-3xl">
          {pkg.title || pkg.name}
        </h1>

        {pkg.rating != null && (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-800">{pkg.rating}</span>
            <span>({compact(pkg.reviewCount || 0)} Reviews)</span>
          </p>
        )}

        {pkg.route?.length > 0 ? (
          <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-600">
            {pkg.route.map((stop, i) => (
              <span key={stop} className="flex items-center gap-2">
                {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />}
                {stop}
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-slate-600">
            <MapPin size={18} className="text-violet-700" />
            {pkg.destination}
          </p>
        )}

        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
          {pkg.inclusions?.map((key) => {
            const item = INCLUSION_ICONS[key];
            if (!item) {
              const text = typeof key === "string" ? key : key?.title;
              return text ? (
                <li
                  key={text}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  {text}
                </li>
              ) : null;
            }
            const { Icon, label, tone } = item;
            return (
              <li
                key={key}
                className="flex flex-col items-center gap-2 text-sm font-medium text-slate-700"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- tab bar ---------- */
function DetailTabs({ active, onChange, onShare, onDownload }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
      <div role="tablist" className="flex gap-8 sm:gap-12">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => onChange(t.key)}
            className={`relative cursor-pointer py-3 text-base font-medium transition-colors ${
              active === t.key
                ? "text-violet-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-amber-400 after:to-violet-500"
                : "text-slate-600 hover:text-violet-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-violet-700">
        <button
          type="button"
          onClick={onShare}
          className="flex cursor-pointer items-center gap-2 font-medium hover:underline"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
        <span className="h-6 w-px bg-slate-200" />
        <button
          type="button"
          onClick={onDownload}
          className="flex cursor-pointer items-center gap-2 font-medium hover:underline"
        >
          <Download className="h-4 w-4" /> Download
        </button>
      </div>
    </div>
  );
}

/* ---------- itinerary tab ---------- */
function ItineraryTab({ itinerary = [] }) {
  const [open, setOpen] = useState(1);

  if (!itinerary.length) {
    return (
      <p className="text-sm text-slate-500">
        No day-wise itinerary has been added to this package yet.
      </p>
    );
  }

  const goTo = (day) => {
    setOpen(day);
    document
      .getElementById(`day-${day}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[170px_1fr]">
      <ul className="hidden self-start overflow-hidden rounded-xl bg-white shadow-sm md:sticky md:top-28 md:block">
        {itinerary.map((d) => (
          <li key={d.day}>
            <button
              type="button"
              onClick={() => goTo(d.day)}
              className={`w-full cursor-pointer border-l-4 px-4 py-2.5 text-left text-base transition-colors ${
                open === d.day
                  ? "border-violet-600 bg-violet-50 text-violet-700"
                  : "border-transparent text-slate-700 hover:bg-slate-50"
              }`}
            >
              Day {d.day}
            </button>
          </li>
        ))}
      </ul>

      <ol className="space-y-4">
        {itinerary.map((d) => {
          const isOpen = open === d.day;
          return (
            <li
              key={d.day}
              id={`day-${d.day}`}
              className="scroll-mt-32 rounded-2xl bg-white shadow-sm"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : d.day)}
                className="flex w-full cursor-pointer items-center gap-4 p-4 text-left"
              >
                <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-800 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white">
                  Day {d.day}
                </span>
                <span className="flex-1 text-base font-medium text-slate-800">
                  {d.title}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-4 text-slate-700">
                  <p>{d.description}</p>
                  {d.hotel && (
                    <p className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 shrink-0 text-indigo-500" />
                      {d.hotel}
                    </p>
                  )}
                  {d.meals?.length > 0 && (
                    <p className="flex items-center gap-3">
                      <Utensils className="h-5 w-5 shrink-0 text-amber-500" />
                      {d.meals.join(", ")}
                    </p>
                  )}
                  {d.activities?.length > 0 && (
                    <div className="flex gap-3">
                      <Camera className="mt-0.5 h-5 w-5 shrink-0 text-sky-500" />
                      <ul className="list-disc space-y-1 pl-5">
                        {d.activities.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {d.transfers?.length > 0 && (
                    <p className="flex items-center gap-3">
                      <Bus className="h-5 w-5 shrink-0 text-rose-500" />
                      {d.transfers.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------- inclusions tab ---------- */
function InclusionsTab({ pkg }) {
  const data = {
    ...pkg.inclusionDetails,
    exclusions: pkg.exclusions,
    thingsToNote: pkg.thingsToNote,
  };
  const sections = INCLUSION_SECTIONS.filter((s) => data[s.key]?.length);
  const [active, setActive] = useState(sections[0]?.key);

  if (!sections.length) {
    return (
      <p className="text-sm text-slate-500">No inclusions specified yet.</p>
    );
  }

  const goTo = (key) => {
    setActive(key);
    document
      .getElementById(`inc-${key}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <ul className="hidden self-start overflow-hidden rounded-xl bg-white shadow-sm md:sticky md:top-28 md:block">
        {sections.map((s) => (
          <li key={s.key}>
            <button
              type="button"
              onClick={() => goTo(s.key)}
              className={`w-full cursor-pointer border-l-4 px-4 py-3 text-left transition-colors ${
                s.warn
                  ? "border-transparent bg-orange-50 text-orange-600 hover:bg-orange-100"
                  : active === s.key
                    ? "border-violet-600 bg-violet-50 text-violet-700"
                    : "border-transparent text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-5">
        {sections.map(({ key, label, title, Icon, warn }) => (
          <section
            key={key}
            id={`inc-${key}`}
            className="scroll-mt-32 overflow-hidden rounded-xl bg-white shadow-sm"
          >
            <h3
              className={`flex items-center gap-3 px-5 py-3 text-base font-semibold text-white ${
                warn
                  ? "bg-gradient-to-r from-orange-500 to-amber-500"
                  : "bg-gradient-to-r from-violet-800 to-violet-600"
              }`}
            >
              <Icon className="h-5 w-5" /> {title ?? label}
            </h3>

            {key === "hotels" ? (
              <ul className="divide-y divide-dashed divide-slate-300 px-5">
                {data.hotels.map((h) => (
                  <li key={h.city} className="py-4">
                    <p className="font-semibold text-slate-800">
                      {h.city} ({h.nights}N)
                    </p>
                    <p className="mt-1 text-slate-600">{h.text}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="list-disc space-y-2 py-5 pl-10 pr-5 text-slate-700">
                {data[key].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- summary tab ---------- */
function SummaryRow({ Icon, color, children }) {
  return (
    <div className="flex gap-3">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${color}`} />
      <div className="text-slate-700">{children}</div>
    </div>
  );
}

function SummaryTab({ pkg }) {
  const itinerary = pkg.itinerary || [];

  return (
    <div className="space-y-4">
      {pkg.inclusionDetails?.flights && (
        <div className="flex items-center gap-3 rounded-lg bg-sky-100 px-5 py-3.5 text-slate-700">
          <Plane className="h-5 w-5 text-violet-700" /> Return economy class airfare
          included
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <h3 className="bg-gradient-to-r from-violet-800 to-violet-600 px-5 py-3 text-base font-semibold text-white">
          Day wise summary
        </h3>

        {itinerary.length ? (
          <div className="grid md:grid-cols-2">
            {itinerary.map((d) => (
              <div key={d.day} className="border-b border-slate-200 md:odd:border-r">
                <div className="flex items-center gap-4 bg-violet-50/70 px-5 py-3">
                  <span className="shrink-0 rounded-full bg-violet-100 px-4 py-1.5 font-semibold text-violet-800">
                    Day {d.day}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{d.title}</span>
                </div>

                <div className="space-y-3 p-5">
                  {d.hotel && (
                    <SummaryRow Icon={Building2} color="text-indigo-500">
                      {d.hotel}
                    </SummaryRow>
                  )}
                  {d.activities?.length > 0 && (
                    <SummaryRow Icon={Camera} color="text-sky-500">
                      <ul className="list-disc space-y-1 pl-4">
                        {d.activities.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </SummaryRow>
                  )}
                  {d.meals?.length > 0 && (
                    <SummaryRow Icon={Utensils} color="text-amber-500">
                      {d.meals.join(", ")}
                    </SummaryRow>
                  )}
                  {d.transfers?.length > 0 && (
                    <SummaryRow Icon={Bus} color="text-rose-500">
                      {d.transfers.join(", ")}
                    </SummaryRow>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-5 text-sm text-slate-500">No itinerary added yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- main page ---------- */
export default function PackageDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const [tab, setTab] = useState("itinerary");
  const [typeKey, setTypeKey] = useState(null);

  const rawPkg =
    packages.find((item) => String(item.id) === String(id)) ||
    state?.packageData;
  const pkg = rawPkg
    ? {
        ...rawPkg,
        itinerary: rawPkg.itinerary?.map((d) => ({
          ...d,
          hotel: d.hotel || d.accommodation,
        })),
      }
    : rawPkg;

  if (!pkg || String(pkg.id) !== String(id)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Package details unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Open My Packages and select View again.
        </p>
        <div className="mt-4 flex justify-center">
          <BackLink />
        </div>
      </div>
    );
  }

  const title = pkg.title || pkg.name;

  const photos = [
    ...(pkg.images || []),
    ...(pkg.image ? [pkg.image] : []),
  ].filter((photo, index, arr) => photo && arr.indexOf(photo) === index);

  /* ----- departures (calendar madhun) ----- */
  const today = new Date().toISOString().slice(0, 10);
  const departureEntries = Object.entries(pkg.departures || {});
  const departureDates = departureEntries.map(([date]) => date).sort();
  const hasCalendar = departureDates.length > 0;

  const nextDeparture = hasCalendar
    ? departureDates.find((date) => date >= today) || departureDates[0]
    : pkg.departure || "";

  const departure = prettyDate(nextDeparture);

  // calendar asel tar sarv upcoming dates chya seats, nahitar juna single seats
  const seatSource = hasCalendar
    ? departureEntries.filter(([date]) => date >= today).length
      ? departureEntries.filter(([date]) => date >= today)
      : departureEntries
    : null;

  const totalSeats = seatSource
    ? seatSource.reduce((sum, [, d]) => sum + Number(d.totalSeats || 0), 0)
    : Number(pkg.seats || 0);

  const bookedSeats = seatSource
    ? seatSource.reduce((sum, [, d]) => sum + Number(d.bookedSeats || 0), 0)
    : Number(pkg.booked || 0);

  const availableSeats = Math.max(0, totalSeats - bookedSeats);

  const tourTypes = pkg.tourTypes || [];
  const type =
    tourTypes.find((t) => t.key === typeKey) || tourTypes[0] || null;
  const basePrice = type?.price ?? pkg.price;
  const discount =
    type && type.originalPrice > type.price
      ? Math.round((1 - type.price / type.originalPrice) * 100)
      : 0;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-4">
            <BackLink />
          </div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Package Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete listing, travel and booking information
          </p>
        </div>

        <Link
          to={`/vendor/packages/new?edit=${pkg.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
        >
          <Pencil size={16} />
          Edit Package
        </Link>
      </div>

      {/* Gallery */}
      <Gallery images={photos} title={title} />

      {/* Left: header + tabs | Right: price */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-6">
          <PackageHeader pkg={pkg} />

          <DetailTabs
            active={tab}
            onChange={setTab}
            onShare={handleShare}
            onDownload={() => window.print()}
          />
          {tab === "itinerary" && <ItineraryTab itinerary={pkg.itinerary} />}
          {tab === "inclusions" && <InclusionsTab pkg={pkg} />}
          {tab === "summary" && <SummaryTab pkg={pkg} />}
        </div>

        <aside className="space-y-4 lg:self-start">
          {tourTypes.length > 1 && (
            <fieldset className="rounded-lg border border-slate-300 bg-white px-3 pb-2">
              <legend className="px-1 text-xs text-slate-500">Tour Type</legend>
              <select
                value={type?.key}
                onChange={(e) => setTypeKey(e.target.value)}
                className="w-full cursor-pointer bg-transparent py-1 text-base outline-none"
              >
                {tourTypes.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </fieldset>
          )}

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              {type && type.originalPrice > type.price && (
                <span className="text-slate-500 line-through">
                  {rupee(type.originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  {discount}% OFF
                </span>
              )}
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {rupee(basePrice)}
            </p>
            <p className="text-sm text-slate-500">Starting price per adult</p>
            {type && type.originalPrice > type.price && (
              <p className="mt-2 text-sm font-semibold text-emerald-600">
                You save {rupee(type.originalPrice - type.price)}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              {pkg.priceIncludesTax === true
                ? "Taxes included"
                : pkg.priceIncludesTax === false
                  ? "Taxes extra"
                  : "Tax treatment not specified"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-slate-700">
            <Gift className="h-5 w-5 text-amber-500" />
            Earn <strong>{Math.round(basePrice / 100)}</strong> Points
          </div>
        </aside>
      </div>

      {/* Vendor: basic info */}
      <Section title="Basic Package Information" icon={ClipboardList}>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-600">
          {pkg.description || "No package description added."}
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Package ID" value={pkg.id} />
          <InfoCard label="Destination" value={pkg.destination} />
          <InfoCard label="Category" value={pkg.category} />
          <InfoCard label="Duration" value={pkg.duration} />
          <InfoCard
            label={hasCalendar ? "Next Departure" : "Departure Date"}
            value={departure}
          />
          <InfoCard label="Package Price" value={`${rupee(pkg.price)} per person`} />
        </div>
      </Section>

      {/* Departure calendar (read only) */}
      {hasCalendar && (
        <Section title="Departure Calendar" icon={CalendarDays}>
          <AvailabilityCalendar departures={pkg.departures} readOnly />
        </Section>
      )}

      {/* Accommodation & Transport (jooney vendor fields) */}
      {(pkg.hotelName || pkg.hotelCategory || pkg.roomType || pkg.mealPlan || pkg.transportType || pkg.pickupLocation) && (
        <Section title="Accommodation & Transport" icon={Hotel}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard label="Hotel / Accommodation" value={pkg.hotelName} />
            <InfoCard label="Hotel Category" value={pkg.hotelCategory} />
            <InfoCard label="Room Type" value={pkg.roomType} />
            <InfoCard label="Meal Plan" value={pkg.mealPlan} />
            <InfoCard label="Transport Type" value={pkg.transportType} />
            <InfoCard label="Pickup / Drop Location" value={pkg.pickupLocation} />
          </div>
        </Section>
      )}

      {/* What's included (jooney vendor fields, jar inclusionDetails nasel) */}
      {!pkg.inclusionDetails && (pkg.inclusions?.length > 0 || pkg.exclusions?.length > 0) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Section title="What's Included" icon={CheckCircle2}>
            <ItemList items={pkg.inclusions} emptyText="No inclusions specified yet." />
          </Section>
          <Section title="What's Not Included" icon={XCircle}>
            <ItemList items={pkg.exclusions} emptyText="No exclusions specified yet." />
          </Section>
        </div>
      )}

      {/* Vendor: availability */}
      <Section title="Booking & Availability" icon={Users}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Total Seats" value={`${totalSeats} travellers`} />
          <InfoCard label="Booked Seats" value={`${bookedSeats} travellers`} />
          <InfoCard label="Available Seats" value={`${availableSeats} travellers`} />
          <InfoCard label="Minimum Group Size" value={pkg.minGroupSize} />
          <InfoCard label="Maximum Group Size" value={pkg.maxGroupSize} />
          <InfoCard label="Last Booking Date" value={pkg.bookingDeadline} />
          {hasCalendar && (
            <InfoCard label="Departure Dates" value={`${departureDates.length} dates`} />
          )}
        </div>
      </Section>

      {/* Vendor: policies */}
      <Section title="Payment, Cancellation & Travel Policies" icon={ShieldCheck}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard
            label="Advance Payment"
            value={pkg.advancePayment != null ? `${pkg.advancePayment}%` : undefined}
          />
          <InfoCard label="Balance Payment Deadline" value={pkg.balancePaymentDeadline} />
          <InfoCard label="Cancellation Policy" value={pkg.cancellationPolicy} />
          <InfoCard label="Refund Policy" value={pkg.refundPolicy} />
          <InfoCard label="Travel Documents" value={pkg.travelDocuments} />
          <InfoCard label="Important Notes" value={pkg.importantNotes} />
        </div>
      </Section>

      {/* Final notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Info size={20} className="mt-0.5 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold text-amber-900">
            Verify package information before publishing
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Confirm hotel details, itinerary, inclusions, exclusions, taxes,
            availability and cancellation terms before making this package
            available to customers.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <BackLink />
        <Link
          to={`/vendor/packages/new?edit=${pkg.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
        >
          <Pencil size={16} />
          Edit Package
        </Link>
      </div>
    </div>
  );
}