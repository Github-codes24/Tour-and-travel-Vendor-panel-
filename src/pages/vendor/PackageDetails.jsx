import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  Users,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Hotel,
  Utensils,
  Bus,
  ClipboardList,
  ShieldCheck,
  Info,
  Image as ImageIcon,
  Pencil,
} from "lucide-react";
import packages from "../../data/Package.jsx";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const statusStyles = {
  Published: "bg-emerald-50 text-emerald-700",
  Draft: "bg-slate-100 text-slate-700",
  "Pending Review": "bg-amber-50 text-amber-700",
  Rejected: "bg-rose-50 text-rose-700",
};

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
          <Icon size={21} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
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

export default function PackageDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const pkg =
    packages.find((item) => String(item.id) === String(id)) ||
    state?.packageData;

  if (!pkg || String(pkg.id) !== String(id)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900">
          Package details unavailable
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Open My Packages and select View again.
        </p>

        <Link
          to="/vendor/packages"
          className="group mb-4 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
        >
          <ArrowLeft
            size={17}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span>Back to My Packages</span>
        </Link>
      </div>
    );
  }

  const photos = [
    ...(pkg.images || []),
    ...(pkg.image ? [pkg.image] : []),
  ].filter((photo, index, arr) => photo && arr.indexOf(photo) === index);

  const departure = pkg.departure
    ? new Date(`${pkg.departure}T00:00:00`).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not scheduled";

  const availableSeats = Math.max(
    0,
    Number(pkg.seats || 0) - Number(pkg.booked || 0),
  );

  const hasItinerary = pkg.itinerary?.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            to="/vendor/packages"
            className="group mb-4 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Back to My Packages</span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Package Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete listing, travel and booking information
          </p>
        </div>

        <Link
          to={`/vendor/packages/new?edit=${pkg.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Pencil size={16} />
          Edit Package
        </Link>
      </div>

      {/* Photo Gallery */}
      <Section title="Package Photo Gallery" icon={ImageIcon}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Destination and experience photos
          </p>
          <span className="text-sm font-semibold text-slate-600">
            {photos.length} photos
          </span>
        </div>

        {photos.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={`${photo}-${index}`}
                className="overflow-hidden rounded-xl border border-slate-100"
              >
                <img
                  src={photo}
                  alt={`${pkg.name} - photo ${index + 1}`}
                  className="h-56 w-full object-cover transition duration-300 hover:scale-105"
                />
                <p className="bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Package photo {index + 1}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No photos uploaded.</p>
        )}
      </Section>

      {/* Overview */}
      <Section title="Basic Package Information" icon={ClipboardList}>
        <div className="flex flex-col justify-between gap-5 md:flex-row">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {pkg.category || "Uncategorized"}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  statusStyles[pkg.status] || statusStyles.Draft
                }`}
              >
                {pkg.status || "Draft"}
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {pkg.name}
            </h2>

            <p className="mt-3 flex items-center gap-2 text-slate-500">
              <MapPin size={19} className="text-emerald-700" />
              {pkg.destination}
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-sm text-slate-500">Price per person</p>
            <p className="mt-1 text-3xl font-extrabold text-emerald-700">
              {formatCurrency(pkg.price)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {pkg.priceIncludesTax === true
                ? "Taxes included"
                : pkg.priceIncludesTax === false
                  ? "Taxes extra"
                  : "Tax treatment not specified"}
            </p>
          </div>
        </div>

        <div className="my-6 border-t border-slate-100" />

        <h3 className="font-bold text-slate-900">Description</h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
          {pkg.description || "No package description added."}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard label="Package ID" value={pkg.id} />
          <InfoCard label="Destination" value={pkg.destination} />
          <InfoCard label="Category" value={pkg.category} />
          <InfoCard label="Duration" value={pkg.duration} />
          <InfoCard label="Departure Date" value={departure} />
          <InfoCard
            label="Package Price"
            value={`${formatCurrency(pkg.price)} per person`}
          />
        </div>
      </Section>

      {/* Itinerary */}
      <Section title="Day-by-Day Itinerary" icon={CalendarDays}>
        {hasItinerary ? (
          <div className="space-y-5">
            {pkg.itinerary.map((day, index) => (
              <div key={`${day.day || index}-${index}`} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  {day.day || index + 1}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-5">
                  <h3 className="font-bold text-slate-900">
                    {day.title || `Day ${index + 1}`}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {day.description || "No activities described."}
                  </p>
                  {day.meals?.length > 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      Meals: {day.meals.join(", ")}
                    </p>
                  )}
                  {day.accommodation && (
                    <p className="mt-1 text-sm text-slate-500">
                      Stay: {day.accommodation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No day-wise itinerary has been added to this package yet.
          </p>
        )}
      </Section>

      {/* Accommodation and Transport */}
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

      {/* Inclusions and exclusions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="What's Included" icon={CheckCircle2}>
          <ItemList
            items={pkg.inclusions}
            emptyText="No inclusions specified yet."
          />
        </Section>

        <Section title="What's Not Included" icon={XCircle}>
          <ItemList
            items={pkg.exclusions}
            emptyText="No exclusions specified yet."
          />
        </Section>
      </div>

      {/* Availability */}
      <Section title="Booking & Availability" icon={Users}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            label="Total Seats"
            value={`${pkg.seats ?? 0} travellers`}
          />
          <InfoCard
            label="Booked Seats"
            value={`${pkg.booked ?? 0} travellers`}
          />
          <InfoCard
            label="Available Seats"
            value={`${availableSeats} travellers`}
          />
          <InfoCard label="Minimum Group Size" value={pkg.minGroupSize} />
          <InfoCard label="Maximum Group Size" value={pkg.maxGroupSize} />
          <InfoCard label="Last Booking Date" value={pkg.bookingDeadline} />
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Clock size={17} className="text-emerald-700" />
            Departure schedule
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {departure} · {pkg.duration || "Duration not specified"}
          </p>
        </div>
      </Section>

      {/* Pricing and policies */}
      <Section
        title="Payment, Cancellation & Travel Policies"
        icon={ShieldCheck}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard
            label="Advance Payment"
            value={
              pkg.advancePayment != null ? `${pkg.advancePayment}%` : undefined
            }
          />
          <InfoCard
            label="Balance Payment Deadline"
            value={pkg.balancePaymentDeadline}
          />
          <InfoCard
            label="Cancellation Policy"
            value={pkg.cancellationPolicy}
          />
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

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          to="/vendor/packages"
          className="group mb-4 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
        >
          <ArrowLeft
            size={17}
            className="transition-transform duration-200 group-hover:-translate-x-1"
          />
          <span>Back to My Packages</span>
        </Link>

        <Link
          to={`/vendor/packages/new?edit=${pkg.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Pencil size={16} />
          Edit Package
        </Link>
      </div>
    </div>
  );
}
