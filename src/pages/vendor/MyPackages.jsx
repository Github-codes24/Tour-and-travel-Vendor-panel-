import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpDown,
  Building2,
  Bus,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FileCheck,
  LayoutGrid,
  List,
  Pencil,
  Plane,
  Search,
  Star,
  Trash2,
  UserCheck,
  Utensils,
} from "lucide-react";
import initialPackages from "../../data/Package.js";
import { removePackageById } from "../../utils/tripData";

const PACKAGE_STORAGE_KEY = "tour_vendor_packages_v1";

function readPackages() {
  const saved = localStorage.getItem(PACKAGE_STORAGE_KEY);
  if (!saved) return initialPackages;

  const parsed = JSON.parse(saved);
  if (!Array.isArray(parsed)) {
    throw new Error("Saved packages must be an array.");
  }

  const savedById = new Map(parsed.map((pkg) => [String(pkg.id), pkg]));
  const initialIds = new Set(initialPackages.map((pkg) => String(pkg.id)));
  return [
    ...initialPackages.map((pkg) => savedById.get(String(pkg.id)) || pkg),
    ...parsed.filter((pkg) => !initialIds.has(String(pkg.id))),
  ];
}

/* ---------- helpers ---------- */
const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const compact = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`;

const INCLUSIONS = {
  flights: { label: "Flights", Icon: Plane, tone: "bg-orange-50 text-orange-500" },
  hotels: { label: "Hotels", Icon: Building2, tone: "bg-indigo-50 text-indigo-500" },
  sightseeing: { label: "Sightseeing", Icon: Camera, tone: "bg-sky-50 text-sky-500" },
  visa: { label: "Visa", Icon: FileCheck, tone: "bg-violet-50 text-violet-600" },
  meal: { label: "Meal", Icon: Utensils, tone: "bg-amber-50 text-amber-500" },
  meals: { label: "Meal", Icon: Utensils, tone: "bg-amber-50 text-amber-500" },
  tourManager: { label: "Tour Manager", Icon: UserCheck, tone: "bg-rose-50 text-rose-500" },
  transfer: { label: "Transfer", Icon: Bus, tone: "bg-rose-50 text-rose-500" },
};

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "departure", label: "Next Departure" },
];

const STATUSES = ["All", "Published", "Draft", "Pending Review", "Rejected"];

const statusStyles = {
  Published: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-700",
  "Pending Review": "bg-amber-50 text-amber-700",
  Rejected: "bg-rose-50 text-rose-700",
};

// card la lagnare price fields tourTypes madhun kadhto
const getPricing = (pkg) => {
  const t = pkg.tourTypes?.[0];
  const price = t?.price ?? pkg.price ?? 0;
  const originalPrice = t?.originalPrice ?? pkg.originalPrice ?? price;
  const discountPercent =
    originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  return { price, originalPrice, discountPercent };
};

// calendar madhun departures, seats ani next departure kadhto
// (juna package jyat fakt ek `departure` date ahe, to pan chalto)
const getDepartureInfo = (pkg) => {
  const entries = Object.entries(pkg.departures || {});
  const today = new Date().toISOString().slice(0, 10);

  if (!entries.length) {
    return {
      count: pkg.departure ? 1 : 0,
      next: pkg.departure || "",
      total: Number(pkg.seats || 0),
      booked: Number(pkg.booked || 0),
    };
  }

  const dates = entries.map(([date]) => date).sort();
  const upcoming = dates.filter((date) => date >= today);

  // sirf upcoming departures chya seats mojaycha
  const relevant = entries.filter(([date]) => date >= today);
  const source = relevant.length ? relevant : entries;

  return {
    count: upcoming.length || dates.length,
    next: upcoming[0] || dates[0],
    total: source.reduce((sum, [, d]) => sum + Number(d.totalSeats || 0), 0),
    booked: source.reduce((sum, [, d]) => sum + Number(d.bookedSeats || 0), 0),
  };
};

const prettyShort = (key) =>
  key
    ? new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not scheduled";

/* ---------- hero ---------- */
function PackageHero({ title, image, onSearch }) {
  const [text, setText] = useState("");

  return (
    <section className="relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-2xl bg-violet-900 px-4 py-8">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-950/70 via-violet-950/50 to-violet-950/80" />
      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-5 text-center">
        <h1 className="text-2xl font-semibold text-white drop-shadow md:text-4xl">
          {title}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(text);
          }}
          className="flex w-full items-center rounded-full bg-white p-1.5 shadow-2xl"
        >
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search a package or city"
            aria-label="Search packages"
            className="h-11 min-w-0 flex-1 bg-transparent px-5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-500 text-white transition hover:brightness-110"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
      </div>
    </section>
  );
}

/* ---------- category tabs ---------- */
function CategoryTabs({ categories, active, onChange, onFilterClick, filterOpen }) {
  return (
    <div className="flex items-stretch gap-4">
      <button
        type="button"
        onClick={onFilterClick}
        aria-pressed={filterOpen}
        className="flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-violet-600 px-5 text-base font-semibold text-white shadow-lg shadow-violet-700/25 transition hover:brightness-110"
      >
        Filter{" "}
        <ChevronsRight
          className={`h-5 w-5 transition-transform ${filterOpen ? "rotate-90" : ""}`}
        />
      </button>

      <div
        role="tablist"
        className="flex min-w-0 flex-1 items-center gap-6 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={active === c.key}
            onClick={() => onChange(c.key)}
            className={`relative h-12 shrink-0 cursor-pointer whitespace-nowrap text-base font-medium transition-colors ${
              active === c.key
                ? "text-violet-700 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-full after:bg-gradient-to-r after:from-amber-400 after:to-violet-500"
                : "text-slate-700 hover:text-violet-700"
            }`}
          >
            {c.label} ({c.count})
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- toolbar ---------- */
function PackagesToolbar({ total, name, sort, onSortChange, view, onViewChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-800">
          {total} {name} Holiday Packages
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-500 text-white">
            <ArrowUpDown className="h-5 w-5" />
          </span>
          <label className="relative flex items-center gap-2 text-slate-700">
            <span className="hidden sm:inline">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="cursor-pointer appearance-none bg-transparent pr-6 font-medium outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4" />
          </label>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
          {[
            ["grid", LayoutGrid, "Grid view"],
            ["list", List, "List view"],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              aria-pressed={view === key}
              onClick={() => onViewChange(key)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors ${
                view === key ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-violet-50"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- package card ---------- */
function PackageCard({ pkg, layout = "grid", onDelete }) {
  const [index, setIndex] = useState(0);
  const images = [...(pkg.images || []), ...(pkg.image ? [pkg.image] : [])];
  const isList = layout === "list";
  const title = pkg.title || pkg.name;
  const { price, originalPrice, discountPercent } = getPricing(pkg);

  const departureInfo = getDepartureInfo(pkg);
  const availableSeats = Math.max(0, departureInfo.total - departureInfo.booked);

  const go = (dir) => (e) => {
    e.preventDefault();
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  return (
    <article
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-xl hover:shadow-violet-900/10 ${
        isList ? "md:flex-row md:gap-6" : ""
      }`}
    >
      {/* Image carousel */}
      <div
        className={`relative aspect-[4/2.1] overflow-hidden rounded-xl bg-slate-100 ${
          isList ? "md:w-80 md:shrink-0" : ""
        }`}
      >
        {images[index] && (
          <img
            src={images[index]}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow transition hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow transition hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow ${
            statusStyles[pkg.status] || statusStyles.Draft
          }`}
        >
          {pkg.status || "Draft"}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        {/* Tags + rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[pkg.duration, ...(pkg.tags || [])].filter(Boolean).map((t) => (
              <span
                key={t}
                className="rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-800"
              >
                {t}
              </span>
            ))}
          </div>
          {pkg.rating != null && (
            <p className="flex shrink-0 items-center gap-1 font-semibold text-slate-800">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {pkg.rating}{" "}
              <span className="font-normal text-slate-500">
                ({compact(pkg.reviewCount || 0)})
              </span>
            </p>
          )}
        </div>

        <h3 className="mt-3 text-base font-semibold text-slate-800">{title}</h3>

        {/* Route */}
        <p className="mt-2 flex min-h-[2.5rem] text-sm flex-wrap items-start gap-x-2 text-slate-600">
          {pkg.route?.length
            ? pkg.route.map((stop, i) => (
                <span key={stop} className="flex items-center gap-2">
                  {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />}
                  {stop}
                </span>
              ))
            : pkg.destination}
        </p>

        {/* Inclusions */}
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {pkg.inclusions?.map((key) => {
            const item = INCLUSIONS[key];
            if (!item) return null;
            const { Icon, label, tone } = item;
            return (
              <li
                key={key}
                className="flex flex-col items-center gap-1.5 text-center text-xs text-slate-600"
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </li>
            );
          })}
        </ul>

        {/* Calendar: next departure + dates count */}
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-900">
          <CalendarDays className="h-4 w-4 shrink-0 text-violet-700" />
          <span>
            Next departure:{" "}
            <span className="font-semibold">{prettyShort(departureInfo.next)}</span>
            {departureInfo.count > 1 && (
              <span className="text-violet-700">
                {" "}
                · {departureInfo.count} dates
              </span>
            )}
          </span>
        </div>

        {/* Vendor info */}
        <p className="mt-3 text-sm text-slate-500">
          Seats: <span className="font-semibold text-slate-700">{departureInfo.booked}</span> booked /{" "}
          <span className="font-semibold text-slate-700">{availableSeats}</span> available
        </p>

        {/* Price + CTA */}
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-dashed border-slate-300 pt-4">
          <div>
            <div className="flex items-center gap-2">
              {originalPrice > price && (
                <span className="text-slate-500 line-through">{rupee(originalPrice)}</span>
              )}
              {discountPercent > 0 && (
                <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="mt-1">
              <span className="text-xl font-bold text-slate-900">{rupee(price)}</span>{" "}
              <span className="text-xs text-slate-500">Starting price per adult</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/vendor/packages/new?edit=${pkg.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <Pencil size={15} />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(pkg)}
              aria-label={`Delete ${title}`}
              title="Delete package"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
            >
              <Trash2 size={16} />
            </button>
            <Link
              to={`/vendor/packages/${pkg.id}`}
              state={{ packageData: pkg }}
              className="rounded-full bg-gradient-to-r from-violet-700 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-700/25 transition hover:brightness-110"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- page ---------- */
export default function MyPackages() {
  const [packages, setPackages] = useState(() => {
    try {
      return readPackages();
    } catch (error) {
      console.error("Unable to load saved packages.", error);
      return initialPackages;
    }
  });
  const [deleteError, setDeleteError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [view, setView] = useState("grid");

  useEffect(() => {
    const refreshPackages = () => {
      try {
        setPackages(readPackages());
      } catch (error) {
        console.error("Unable to refresh saved packages.", error);
      }
    };

    window.addEventListener("focus", refreshPackages);
    window.addEventListener("storage", refreshPackages);
    return () => {
      window.removeEventListener("focus", refreshPackages);
      window.removeEventListener("storage", refreshPackages);
    };
  }, []);

  const handleDelete = (pkg) => {
    const title = pkg.title || pkg.name || "this package";
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const updatedPackages = removePackageById(pkg.id);
      if (!updatedPackages) {
        setDeleteError("This package could not be found in saved packages.");
        return;
      }
      setPackages(updatedPackages);
      setDeleteError("");
    } catch (error) {
      console.error("Unable to delete package.", error);
      setDeleteError("Unable to delete this package. Please try again.");
    }
  };

  const categories = useMemo(() => {
    const names = [...new Set(packages.map((p) => p.category).filter(Boolean))];
    return [
      { key: "all", label: "All", count: packages.length },
      ...names.map((n) => ({
        key: n,
        label: n,
        count: packages.filter((p) => p.category === n).length,
      })),
    ];
  }, [packages]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = packages.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "All" && (p.status || "Draft") !== status) return false;
      if (!q) return true;
      const hay = [p.title, p.name, p.destination, ...(p.route || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => getPricing(a).price - getPricing(b).price);
    if (sort === "price-desc") sorted.sort((a, b) => getPricing(b).price - getPricing(a).price);
    if (sort === "rating") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "departure") {
      // jyachi departure javal ahe to pahila; date nasleli shevti
      sorted.sort((a, b) => {
        const da = getDepartureInfo(a).next || "9999-12-31";
        const db = getDepartureInfo(b).next || "9999-12-31";
        return da.localeCompare(db);
      });
    }
    return sorted;
  }, [packages, search, category, status, sort]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      <PackageHero
        title="My Packages"
        image={packages[0]?.images?.[0]}
        onSearch={setSearch}
      />

      {deleteError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {deleteError}
        </div>
      )}

      <CategoryTabs
        categories={categories}
        active={category}
        onChange={setCategory}
        onFilterClick={() => setFilterOpen((o) => !o)}
        filterOpen={filterOpen}
      />

      {filterOpen && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-sm font-semibold text-slate-700">Status:</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                status === s
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <PackagesToolbar
        total={visible.length}
        name={category === "all" ? "Total" : category}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      {visible.length ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-6"
          }
        >
          {visible.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} layout={view} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-bold text-slate-900">No packages found</h3>
          <p className="mt-2 text-sm text-slate-500">
            Search kiva filter badlun pahaa.
          </p>
        </div>
      )}
    </div>
  );
}