import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  MapPin,
  CalendarDays,
  IndianRupee,
  Hotel,
  ImagePlus,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  Tags,
} from "lucide-react";
import initialPackages from "../../data/Package";
import VendorCalendar from "../vendor/VendorCalendar";
import { removePackageById } from "../../utils/tripData";
const STORAGE_KEY = "tour_vendor_packages_v1";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const categories = [
  "Domestic",
  "International",
  "Adventure",
  "Beach",
  "Nature",
  "Heritage",
  "Spiritual",
  "Family",
  "Honeymoon",
  "Wildlife",
  "City Tour",
  "Other",
];

// user side la dakhvle jaanare icons (header madhe)
const INCLUSION_OPTIONS = [
  { key: "flights", label: "Flights" },
  { key: "hotels", label: "Hotels" },
  { key: "sightseeing", label: "Sightseeing" },
  { key: "meals", label: "Meals" },
  { key: "visa", label: "Visa" },
  { key: "tourManager", label: "Tour Manager" },
  { key: "transfer", label: "Transfer" },
];
const INCLUSION_KEYS = INCLUSION_OPTIONS.map((o) => o.key);

// Inclusions tab madhil text sections (hotels vegla ahe)
const DETAIL_FIELDS = [
  ["flights", "Flights", "Return economy class airfare"],
  ["sightseeing", "Sightseeing", "City tour\nIsland hopping"],
  ["meals", "Meals", "Daily breakfast\n2 Dinners"],
  ["visa", "Visa", "Visa assistance"],
  ["tourManager", "Tour Manager", "Tour manager during the trip"],
  ["transfer", "Transfer", "Private AC cab for all transfers"],
  ["others", "Others", "Bottled water during sightseeing"],
];

const emptyDay = (day = 1) => ({
  day,
  title: "",
  description: "",
  hotel: "",
  meals: "",
  activities: "",
  transfers: "",
});

const emptyHotel = () => ({ city: "", nights: "", text: "" });
const emptyTourType = () => ({ label: "", price: "", originalPrice: "" });

const emptyForm = {
  name: "",
  destination: "",
  category: "Domestic",
  duration: "",
  tags: "",
  route: "",
  description: "",
  price: "",
  priceIncludesTax: "unspecified",
  seats: "",
  booked: 0,
  departure: "",
  departures: {},
  lastBookingDate: "",
  pickupLocation: "",
  dropLocation: "",
  transportType: "AC Bus",
  accommodation: "Hotel",
  hotelCategory: "3 Star",
  roomType: "Double Sharing",
  mealPlan: "Breakfast & Dinner",
  minimumGroupSize: "2",
  maximumGroupSize: "",
  advancePayment: "30",
  balancePaymentDeadline: "7 days before departure",
  inclusionKeys: [],
  inclusionText: {
    flights: "",
    sightseeing: "",
    meals: "",
    visa: "",
    tourManager: "",
    transfer: "",
    others: "",
  },
  hotels: [emptyHotel()],
  tourTypes: [],
  exclusions: "",
  thingsToNote: "",
  cancellationPolicy: "",
  refundPolicy: "",
  travelDocuments: "Valid government photo ID",
  importantNotes: "",
  image: "",
  images: [],
  itinerary: [emptyDay(1)],
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100";

/* ---------- helpers ---------- */
const toLines = (value) =>
  Array.isArray(value) ? value.join("\n") : value || "";

const toComma = (value) =>
  Array.isArray(value) ? value.join(", ") : value || "";

const fromLines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const fromComma = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isValidMoney = (value) =>
  value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;

// calendar departures madhil pahili upcoming date (user side la dakhvaychi)
const firstDepartureDate = (departures) => {
  const keys = Object.keys(departures || {}).sort();
  if (!keys.length) return "";
  const today = new Date().toISOString().slice(0, 10);
  return keys.find((key) => key >= today) || keys[0];
};

const departuresToForm = (existing) => {
  if (existing.departures && Object.keys(existing.departures).length) {
    return Object.fromEntries(
      Object.entries(existing.departures).map(([date, item]) => [
        date,
        {
          adultPrice: String(item.adultPrice ?? ""),
          childPrice: String(item.childPrice ?? ""),
          totalSeats: String(item.totalSeats ?? ""),
          bookedSeats: String(item.bookedSeats ?? 0),
          status: item.status || "Available",
        },
      ]),
    );
  }

  // juna package: ek departure date hoti, tichi calendar entry banva
  if (existing.departure) {
    return {
      [existing.departure]: {
        adultPrice: String(existing.price ?? ""),
        childPrice: "",
        totalSeats: String(existing.seats ?? ""),
        bookedSeats: String(existing.booked ?? 0),
        status: "Available",
      },
    };
  }

  return {};
};

function readPackages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Unable to read packages:", error);
  }

  return Array.isArray(initialPackages) ? initialPackages : [];
}

// saved package (user-side shape kiva juna vendor shape) -> form
function packageToForm(existing) {
  const existingImages =
    Array.isArray(existing.images) && existing.images.length
      ? existing.images
      : existing.image
        ? [existing.image]
        : [];

  const rawInclusions = Array.isArray(existing.inclusions)
    ? existing.inclusions
    : [];
  const normalised = rawInclusions.map((item) =>
    item === "meal" ? "meals" : item,
  );
  const keys = normalised.filter((item) => INCLUSION_KEYS.includes(item));
  const legacyText = normalised
    .filter((item) => !INCLUSION_KEYS.includes(item))
    .map((item) => (typeof item === "string" ? item : item?.title))
    .filter(Boolean);

  const details = existing.inclusionDetails || {};

  const inclusionText = {
    flights: toLines(details.flights),
    sightseeing: toLines(details.sightseeing),
    meals: toLines(details.meals),
    visa: toLines(details.visa),
    tourManager: toLines(details.tourManager),
    transfer: toLines(details.transfer),
    others: toLines([...(details.others || []), ...legacyText]),
  };

  const hotels =
    Array.isArray(details.hotels) && details.hotels.length
      ? details.hotels.map((hotel) => ({
          city: hotel.city || "",
          nights: hotel.nights != null ? String(hotel.nights) : "",
          text: hotel.text || "",
        }))
      : [emptyHotel()];

  const tourTypes = Array.isArray(existing.tourTypes)
    ? existing.tourTypes.map((type) => ({
        label: type.label || "",
        price: type.price != null ? String(type.price) : "",
        originalPrice:
          type.originalPrice != null && type.originalPrice !== type.price
            ? String(type.originalPrice)
            : "",
      }))
    : [];

  const itinerary =
    Array.isArray(existing.itinerary) && existing.itinerary.length
      ? existing.itinerary.map((day, index) => ({
          day: index + 1,
          title: day.title || "",
          description: day.description ?? day.details ?? "",
          hotel: day.hotel ?? day.accommodation ?? "",
          meals: toComma(day.meals),
          activities: toLines(day.activities),
          transfers: toComma(day.transfers),
        }))
      : [emptyDay(1)];

  const taxValue =
    existing.priceIncludesTax === true
      ? "included"
      : existing.priceIncludesTax === false
        ? "extra"
        : "unspecified";

  return {
    ...emptyForm,
    ...existing,
    name: existing.name || existing.title || "",
    tags: toComma(existing.tags),
    route: toComma(existing.route),
    price: existing.price != null ? String(existing.price) : "",
    priceIncludesTax: taxValue,
    minimumGroupSize: String(
      existing.minimumGroupSize ?? existing.minGroupSize ?? "2",
    ),
    maximumGroupSize: String(
      existing.maximumGroupSize ?? existing.maxGroupSize ?? "",
    ),
    lastBookingDate: existing.lastBookingDate || existing.bookingDeadline || "",
    advancePayment:
      existing.advancePayment != null ? String(existing.advancePayment) : "",
    images: existingImages,
    departures: departuresToForm(existing),
    inclusionKeys: keys,
    inclusionText,
    hotels,
    tourTypes,
    exclusions: toLines(existing.exclusions),
    thingsToNote: toLines(existing.thingsToNote),
    itinerary,
  };
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-slate-400">{hint}</span>
      )}
    </label>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ---------- gallery preview (PackageDetails sarkha layout) ---------- */
function GalleryTile({ src, index, onRemove, children }) {
  if (!src) return <div className="h-full w-full rounded-lg bg-slate-100" />;

  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden rounded-lg bg-slate-100">
      <img
        src={src}
        alt={`Package photo ${index + 1}`}
        className="block h-full w-full object-cover"
      />

      {children}

      {index === 0 && (
        <span className="absolute bottom-2 left-2 rounded-md bg-violet-700 px-2 py-1 text-xs font-semibold text-white">
          Cover
        </span>
      )}

      <button
        type="button"
        onClick={() => onRemove(index)}
        aria-label={`Remove photo ${index + 1}`}
        className="absolute right-2 top-2 z-10 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-red-600"
      >
        <X size={15} />
      </button>
    </div>
  );
}

function GalleryPreview({ images, onRemove }) {
  const extra = images.length - 4;

  return (
    <div className="space-y-3">
      <div className="grid h-[30vh] min-h-[200px] w-full grid-cols-[minmax(0,936fr)_minmax(0,322fr)_minmax(0,321fr)] grid-rows-[minmax(0,250fr)_minmax(0,206fr)] gap-2 sm:h-[38vh] sm:gap-3 lg:gap-5">
        <div className="row-span-2 min-h-0 min-w-0">
          <GalleryTile src={images[0]} index={0} onRemove={onRemove} />
        </div>

        <div className="col-span-2 min-h-0 min-w-0">
          <GalleryTile src={images[1]} index={1} onRemove={onRemove} />
        </div>

        <div className="min-h-0 min-w-0">
          <GalleryTile src={images[2]} index={2} onRemove={onRemove} />
        </div>

        <div className="min-h-0 min-w-0">
          <GalleryTile src={images[3]} index={3} onRemove={onRemove}>
            {extra > 0 && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white sm:text-lg">
                +{extra}
              </span>
            )}
          </GalleryTile>
        </div>
      </div>

      {/* 4 peksha jast photos astil tar tyanna remove karaycha option */}
      {extra > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {images.slice(4).map((image, i) => (
            <div
              key={`${i}-${image.slice(0, 30)}`}
              className="relative h-16 w-16"
            >
              <img
                src={image}
                alt={`Package photo ${i + 5}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i + 4)}
                aria-label={`Remove photo ${i + 5}`}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AddPackage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [saving, setSaving] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (!editId) return;

    const existing = readPackages().find(
      (item) => String(item.id) === String(editId),
    );

    if (!existing) {
      setNotice("Package not found. You can create a new package.");
      return;
    }

    const loaded = packageToForm(existing);
    setForm(loaded);
    setImagePreviews(loaded.images);
  }, [editId]);

  const update = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  /* ----- inclusions ----- */
  const toggleInclusion = (key) => {
    setForm((previous) => ({
      ...previous,
      inclusionKeys: previous.inclusionKeys.includes(key)
        ? previous.inclusionKeys.filter((item) => item !== key)
        : [...previous.inclusionKeys, key],
    }));
  };

  const updateInclusionText = (key, value) => {
    setForm((previous) => ({
      ...previous,
      inclusionText: { ...previous.inclusionText, [key]: value },
    }));
  };

  /* ----- hotels ----- */
  const updateHotel = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      hotels: previous.hotels.map((hotel, i) =>
        i === index ? { ...hotel, [field]: value } : hotel,
      ),
    }));
  };

  const addHotel = () => {
    setForm((previous) => ({
      ...previous,
      hotels: [...previous.hotels, emptyHotel()],
    }));
  };

  const removeHotel = (index) => {
    setForm((previous) => {
      const next = previous.hotels.filter((_, i) => i !== index);
      return { ...previous, hotels: next.length ? next : [emptyHotel()] };
    });
  };

  /* ----- tour types ----- */
  const updateTourType = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      tourTypes: previous.tourTypes.map((type, i) =>
        i === index ? { ...type, [field]: value } : type,
      ),
    }));
  };

  const addTourType = () => {
    setForm((previous) => ({
      ...previous,
      tourTypes: [...previous.tourTypes, emptyTourType()],
    }));
  };

  const removeTourType = (index) => {
    setForm((previous) => ({
      ...previous,
      tourTypes: previous.tourTypes.filter((_, i) => i !== index),
    }));
  };

  const firstTourPrice = form.tourTypes.find((type) =>
    isValidMoney(type.price),
  )?.price;

  /* ----- validation ----- */
  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Package name is required.";
    }

    if (!form.destination.trim()) {
      next.destination = "Destination is required.";
    }

    if (!form.duration.trim()) {
      next.duration = "Duration is required.";
    }

    if (!isValidMoney(form.price) && firstTourPrice === undefined) {
      next.price = "Enter a valid price.";
    }

    if (
      form.seats === "" ||
      !Number.isInteger(Number(form.seats)) ||
      Number(form.seats) < 1
    ) {
      next.seats = "Enter at least one seat.";
    }

    const departureKeys = Object.keys(form.departures);

    if (!departureKeys.length) {
      next.departure = "Add at least one departure date on the calendar.";
    } else if (
      departureKeys.some(
        (key) =>
          Number(form.departures[key].bookedSeats) >
          Number(form.departures[key].totalSeats),
      )
    ) {
      next.departure = "Booked seats cannot exceed total seats on a date.";
    }

    const firstDeparture = firstDepartureDate(form.departures);

    if (
      form.lastBookingDate &&
      firstDeparture &&
      form.lastBookingDate > firstDeparture
    ) {
      next.lastBookingDate = "Booking deadline must be before departure.";
    }

    if (
      form.maximumGroupSize &&
      Number(form.maximumGroupSize) < Number(form.minimumGroupSize || 1)
    ) {
      next.maximumGroupSize = "Maximum must be at least the minimum.";
    }

    if (
      form.advancePayment !== "" &&
      (Number(form.advancePayment) < 0 || Number(form.advancePayment) > 100)
    ) {
      next.advancePayment = "Enter a percentage between 0 and 100.";
    }

    const badTour = form.tourTypes.some(
      (type) =>
        (type.label.trim() || type.price !== "") &&
        (!type.label.trim() || !isValidMoney(type.price)),
    );

    if (badTour) {
      next.tourTypes = "Each tour type needs a name and a valid price.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ----- images ----- */
  const handleImages = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        setNotice(`${file.name} is not a valid image.`);
        return false;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        setNotice(`${file.name} exceeds the 2 MB limit.`);
        return false;
      }

      return true;
    });

    if (!validFiles.length) return;

    Promise.all(
      validFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          }),
      ),
    ).then((results) => {
      const newImages = results.filter(Boolean);

      setImagePreviews((previous) => [
        ...previous,
        ...newImages.filter((image) => !previous.includes(image)),
      ]);

      setNotice("");
    });
  };

  const removeImage = (index) => {
    setImagePreviews((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  /* ----- itinerary ----- */
  const updateDay = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      itinerary: previous.itinerary.map((day, i) =>
        i === index ? { ...day, [field]: value } : day,
      ),
    }));
  };

  const addDay = () => {
    setForm((previous) => ({
      ...previous,
      itinerary: [
        ...previous.itinerary,
        emptyDay(previous.itinerary.length + 1),
      ],
    }));
  };

  const removeDay = (index) => {
    setForm((previous) => ({
      ...previous,
      itinerary: previous.itinerary
        .filter((_, i) => i !== index)
        .map((day, i) => ({ ...day, day: i + 1 })),
    }));
  };

  /* ----- save ----- */
  const savePackage = (status) => {
    if (saving) return;

    if (status === "Published" && !validate()) {
      setNotice("Please correct the required fields before publishing.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);

    try {
      const current = readPackages();
      const id = editId || `pkg-${Date.now()}`;

      const {
        inclusionKeys,
        inclusionText,
        hotels,
        tourTypes: tourTypeRows,
        tags,
        route,
        priceIncludesTax,
        ...rest
      } = form;

      const title = form.name.trim() || "Untitled Package";

      const tourTypes = tourTypeRows
        .filter((type) => type.label.trim() && isValidMoney(type.price))
        .map((type, index) => {
          const price = Number(type.price);
          const original = Number(type.originalPrice);
          return {
            key: slugify(type.label) || `type-${index + 1}`,
            label: type.label.trim(),
            price,
            originalPrice: original > price ? original : price,
          };
        });

      const inclusionDetails = {};

      Object.entries(inclusionText).forEach(([key, value]) => {
        const lines = fromLines(value);
        if (lines.length) inclusionDetails[key] = lines;
      });

      const hotelRows = hotels
        .filter((hotel) => hotel.city.trim())
        .map((hotel) => ({
          city: hotel.city.trim(),
          nights: Number(hotel.nights) || 0,
          text: hotel.text.trim(),
        }));

      if (hotelRows.length) inclusionDetails.hotels = hotelRows;

      const packageData = {
        ...rest,
        id,
        name: title,
        title,
        slug: slugify(title) || String(id),
        destination: form.destination.trim(),
        price: Number(form.price) || Number(firstTourPrice) || 0,
        priceIncludesTax:
          priceIncludesTax === "included"
            ? true
            : priceIncludesTax === "extra"
              ? false
              : undefined,
        seats: Number(form.seats) || 0,
        booked: Number(form.booked) || 0,
        departure: firstDepartureDate(form.departures),
        departures: Object.fromEntries(
          Object.entries(form.departures)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, item]) => [
              date,
              {
                adultPrice: Number(item.adultPrice) || 0,
                childPrice: Number(item.childPrice) || 0,
                totalSeats: Number(item.totalSeats) || 0,
                bookedSeats: Number(item.bookedSeats) || 0,
                status: item.status,
              },
            ]),
        ),
        image: imagePreviews[0] || "",
        images: imagePreviews,
        status,
        tags: fromComma(tags),
        route: fromComma(route),
        inclusions: inclusionKeys,
        inclusionDetails,
        exclusions: fromLines(form.exclusions),
        thingsToNote: fromLines(form.thingsToNote),
        tourTypes,
        minGroupSize: Number(form.minimumGroupSize) || undefined,
        maxGroupSize: Number(form.maximumGroupSize) || undefined,
        bookingDeadline: form.lastBookingDate,
        itinerary: form.itinerary
          .filter(
            (day) =>
              day.title.trim() ||
              day.description.trim() ||
              day.hotel.trim() ||
              day.meals.trim() ||
              day.activities.trim() ||
              day.transfers.trim(),
          )
          .map((day, index) => ({
            day: index + 1,
            title: day.title.trim(),
            description: day.description.trim(),
            hotel: day.hotel.trim(),
            meals: fromComma(day.meals),
            activities: fromLines(day.activities),
            transfers: fromComma(day.transfers),
          })),
        updatedAt: new Date().toISOString(),
      };

      const exists = current.some((item) => String(item.id) === String(id));

      const updated = exists
        ? current.map((item) =>
            String(item.id) === String(id) ? { ...item, ...packageData } : item,
          )
        : [packageData, ...current];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      navigate("/vendor/packages");
    } catch (error) {
      console.error("Unable to save package:", error);
      setNotice(
        "Unable to save. Storage may be full. Try fewer or smaller photos.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = () => {
    if (!editId || saving) return;
    const title = form.name.trim() || "this package";
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const updatedPackages = removePackageById(editId);
      if (!updatedPackages) {
        setNotice("This package could not be found in saved packages.");
        return;
      }
      navigate("/vendor/packages");
    } catch (error) {
      console.error("Unable to delete package:", error);
      setNotice("Unable to delete this package. Please try again.");
    }
  };

  const errorText = (field) =>
    errors[field] ? (
      <span className="mt-1 block text-xs text-red-600">{errors[field]}</span>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/vendor/packages"
            className="group mb-4 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md"
          >
            <ArrowLeft
              size={17}
              className="transition-transform duration-200 group-hover:-translate-x-1"
            />
            <span>Back to My Packages</span>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">
            {editId ? "Edit Package" : "Add New Package"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configure your trip, pricing, accommodation and policies.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {editId && (
            <button
              type="button"
              disabled={saving}
              onClick={deletePackage}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              <Trash2 size={17} />
              Delete Package
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => savePackage("Draft")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Save size={17} />
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => savePackage("Published")}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
          >
            <Send size={17} />
            {saving ? "Saving..." : "Publish Package"}
          </button>
        </div>
      </header>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} />
          <span>{notice}</span>
          <button
            type="button"
            className="ml-auto"
            onClick={() => setNotice("")}
            aria-label="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div className="min-w-0 space-y-6">
          {/* ---------- Photo preview (PackageDetails sarkha gallery) ---------- */}
          {imagePreviews.length > 0 && (
            <Section
              title="Photo Preview"
              description="Customer la package page var asa gallery layout disel"
              icon={ImagePlus}
            >
              <GalleryPreview images={imagePreviews} onRemove={removeImage} />
            </Section>
          )}

          {/* ---------- Basic information ---------- */}
          <Section
            title="Basic Information"
            description="Package name, destination, tags, route and description"
            icon={ClipboardList}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Package name" required>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Magical Bali Escape"
                />
                {errorText("name")}
              </Field>

              <Field label="Destination" required>
                <input
                  className={inputClass}
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  placeholder="Bali, Indonesia"
                />
                {errorText("destination")}
              </Field>

              {/* Custom Category Dropdown */}
              <Field label="Category" required>
                <div className="relative mt-1.5">
                  <button
                    type="button"
                    onClick={() => setCategoryOpen((previous) => !previous)}
                    className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm text-slate-800 outline-none transition ${
                      categoryOpen
                        ? "border-violet-600 ring-2 ring-violet-100"
                        : "border-slate-200 hover:border-violet-300"
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={categoryOpen}
                  >
                    <span>{form.category || "Select category"}</span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-500 transition-transform ${
                        categoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {categoryOpen && (
                    <ul
                      role="listbox"
                      aria-label="Package category"
                      className="absolute bottom-full left-0 right-0 z-50 mb-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
                    >
                      {categories.map((category) => (
                        <li key={category}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={form.category === category}
                            onClick={() => {
                              update("category", category);
                              setCategoryOpen(false);
                            }}
                            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                              form.category === category
                                ? "bg-violet-50 font-semibold text-violet-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              {category}
                              {form.category === category && (
                                <CheckCircle2
                                  size={16}
                                  className="text-violet-600"
                                />
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              <Field label="Duration" required>
                <input
                  className={inputClass}
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                  placeholder="5N/6D"
                />
                {errorText("duration")}
              </Field>

              <Field
                label="Tags"
                hint="Comma separate kara. Jaise: Honeymoon, Beach"
              >
                <input
                  className={inputClass}
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="Honeymoon, Beach"
                />
              </Field>

              <Field
                label="Route / cities covered"
                hint="Comma separate kara. Jaise: Denpasar, Ubud, Seminyak"
              >
                <input
                  className={inputClass}
                  value={form.route}
                  onChange={(e) => update("route", e.target.value)}
                  placeholder="Denpasar, Ubud, Seminyak"
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe the highlights and traveller experience..."
                  />
                </Field>
              </div>
            </div>
          </Section>

          {/* ---------- Departure & transport ---------- */}
          <Section
            title="Departure & Transport"
            description="Schedule, pickup, drop-off and transport"
            icon={MapPin}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Last booking date"
                hint="Pahilya departure chya adhi pahije"
              >
                <input
                  type="date"
                  max={firstDepartureDate(form.departures) || undefined}
                  className={inputClass}
                  value={form.lastBookingDate}
                  onChange={(e) => update("lastBookingDate", e.target.value)}
                />
                {errorText("lastBookingDate")}
              </Field>

              <Field label="Pickup location">
                <input
                  className={inputClass}
                  value={form.pickupLocation}
                  onChange={(e) => update("pickupLocation", e.target.value)}
                  placeholder="Pickup point or city"
                />
              </Field>

              <Field label="Drop location">
                <input
                  className={inputClass}
                  value={form.dropLocation}
                  onChange={(e) => update("dropLocation", e.target.value)}
                  placeholder="Drop-off point"
                />
              </Field>

              <Field label="Transport type">
                <select
                  className={inputClass}
                  value={form.transportType}
                  onChange={(e) => update("transportType", e.target.value)}
                >
                  {[
                    "AC Bus",
                    "Non-AC Bus",
                    "Private Cab",
                    "Tempo Traveller",
                    "Train",
                    "Flight",
                    "Ferry",
                    "Self-arranged",
                    "Mixed",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Travel documents">
                <input
                  className={inputClass}
                  value={form.travelDocuments}
                  onChange={(e) => update("travelDocuments", e.target.value)}
                  placeholder="Required ID or travel documents"
                />
              </Field>
            </div>
          </Section>

          {/* ---------- Departure calendar ---------- */}
          <Section
            title="Departure Calendar"
            description="Select dates and manage departure pricing, seat capacity and status."
            icon={CalendarDays}
          >
            {errorText("departure")}

            <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <VendorCalendar
                departures={form.departures}
                packageTitle={form.name || "Current package"}
                onChange={(next) => {
                  update("departures", next);
                  setErrors((previous) => ({
                    ...previous,
                    departure: "",
                  }));
                }}
                defaults={{
                  adultPrice: form.price || firstTourPrice || "",
                  totalSeats: form.seats,
                }}
              />
            </div>
          </Section>

          {/* ---------- Pricing ---------- */}
          <Section
            title="Pricing & Availability"
            description="Price, tour types, capacity and payment terms"
            icon={IndianRupee}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Price per person (₹)"
                required
                hint="Navin departure la hich price default miltey"
              >
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="62999"
                />
                {errorText("price")}
              </Field>

              <Field label="Taxes">
                <select
                  className={inputClass}
                  value={form.priceIncludesTax}
                  onChange={(e) => update("priceIncludesTax", e.target.value)}
                >
                  <option value="unspecified">Not specified</option>
                  <option value="included">Taxes included</option>
                  <option value="extra">Taxes extra</option>
                </select>
              </Field>

              <Field
                label="Total seats"
                required
                hint="Navin departure la hech seats default miltil"
              >
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.seats}
                  onChange={(e) => update("seats", e.target.value)}
                  placeholder="20"
                />
                {errorText("seats")}
              </Field>

              <Field label="Minimum group size">
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.minimumGroupSize}
                  onChange={(e) => update("minimumGroupSize", e.target.value)}
                />
              </Field>

              <Field label="Maximum group size">
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.maximumGroupSize}
                  onChange={(e) => update("maximumGroupSize", e.target.value)}
                  placeholder="Optional"
                />
                {errorText("maximumGroupSize")}
              </Field>

              <Field label="Advance payment (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={inputClass}
                  value={form.advancePayment}
                  onChange={(e) => update("advancePayment", e.target.value)}
                />
                {errorText("advancePayment")}
              </Field>

              <Field label="Balance payment deadline">
                <select
                  className={inputClass}
                  value={form.balancePaymentDeadline}
                  onChange={(e) =>
                    update("balancePaymentDeadline", e.target.value)
                  }
                >
                  {[
                    "At booking",
                    "3 days before departure",
                    "7 days before departure",
                    "14 days before departure",
                    "30 days before departure",
                  ].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Tour types */}
            <div className="mt-6 border-t border-dashed border-slate-300 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Tags size={16} className="text-violet-700" />
                    Tour types
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Jaise Group Tour, Private Tour. Customer la dropdown madhe
                    disel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTourType}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-200 px-3.5 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                >
                  <Plus size={16} />
                  Add tour type
                </button>
              </div>

              {errorText("tourTypes")}

              {form.tourTypes.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  Tour type add kela nahi tar fakt Price per person dakhvla
                  jail.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.tourTypes.map((type, index) => (
                    <div
                      key={index}
                      className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end"
                    >
                      <Field label="Tour type name">
                        <input
                          className={inputClass}
                          value={type.label}
                          onChange={(e) =>
                            updateTourType(index, "label", e.target.value)
                          }
                          placeholder="Group Tour"
                        />
                      </Field>

                      <Field label="Offer price (₹)">
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={type.price}
                          onChange={(e) =>
                            updateTourType(index, "price", e.target.value)
                          }
                          placeholder="62999"
                        />
                      </Field>

                      <Field label="Original price (₹)">
                        <input
                          type="number"
                          min="0"
                          className={inputClass}
                          value={type.originalPrice}
                          onChange={(e) =>
                            updateTourType(
                              index,
                              "originalPrice",
                              e.target.value,
                            )
                          }
                          placeholder="74999"
                        />
                      </Field>

                      <button
                        type="button"
                        onClick={() => removeTourType(index)}
                        aria-label={`Remove tour type ${index + 1}`}
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* ---------- Accommodation & meals ---------- */}
          <Section
            title="Accommodation & Meals"
            description="Stay type, room category and meal plan"
            icon={Hotel}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  "accommodation",
                  "Accommodation",
                  [
                    "Hotel",
                    "Resort",
                    "Homestay",
                    "Hostel",
                    "Camp",
                    "No accommodation",
                    "Mixed",
                  ],
                ],
                [
                  "hotelCategory",
                  "Hotel category",
                  [
                    "Budget",
                    "2 Star",
                    "3 Star",
                    "4 Star",
                    "5 Star",
                    "Premium",
                    "Not applicable",
                  ],
                ],
                [
                  "roomType",
                  "Room type",
                  [
                    "Single",
                    "Double Sharing",
                    "Triple Sharing",
                    "Family Room",
                    "Dormitory",
                    "Tent",
                    "Not applicable",
                  ],
                ],
                [
                  "mealPlan",
                  "Meal plan",
                  [
                    "No meals",
                    "Breakfast",
                    "Breakfast & Dinner",
                    "Breakfast, Lunch & Dinner",
                    "All inclusive",
                    "As per itinerary",
                  ],
                ],
              ].map(([field, label, options]) => (
                <Field key={field} label={label}>
                  <select
                    className={inputClass}
                    value={form[field]}
                    onChange={(e) => update(field, e.target.value)}
                  >
                    {options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </Field>
              ))}
            </div>
          </Section>

          {/* ---------- Itinerary ---------- */}
          <Section
            title="Day-wise Itinerary"
            description="Title, description, hotel, meals, activities and transfers for each day"
            icon={CalendarDays}
          >
            <div className="space-y-4">
              {form.itinerary.map((day, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-bold text-violet-800">
                      Day {day.day}
                    </span>

                    {form.itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Day title">
                        <input
                          className={inputClass}
                          value={day.title}
                          onChange={(e) =>
                            updateDay(index, "title", e.target.value)
                          }
                          placeholder="Arrival in Denpasar - Transfer to Ubud"
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <textarea
                          rows={3}
                          className={inputClass}
                          value={day.description}
                          onChange={(e) =>
                            updateDay(index, "description", e.target.value)
                          }
                          placeholder="Short summary of the day..."
                        />
                      </Field>
                    </div>

                    <Field label="Hotel / stay">
                      <input
                        className={inputClass}
                        value={day.hotel}
                        onChange={(e) =>
                          updateDay(index, "hotel", e.target.value)
                        }
                        placeholder="Ubud Green Resort or similar"
                      />
                    </Field>

                    <Field label="Meals" hint="Comma separate kara">
                      <input
                        className={inputClass}
                        value={day.meals}
                        onChange={(e) =>
                          updateDay(index, "meals", e.target.value)
                        }
                        placeholder="Breakfast, Dinner"
                      />
                    </Field>

                    <Field label="Activities" hint="Ek line madhe ek activity">
                      <textarea
                        rows={3}
                        className={inputClass}
                        value={day.activities}
                        onChange={(e) =>
                          updateDay(index, "activities", e.target.value)
                        }
                        placeholder={"Tegalalang Rice Terrace\nUbud Palace"}
                      />
                    </Field>

                    <Field label="Transfers" hint="Comma separate kara">
                      <textarea
                        rows={3}
                        className={inputClass}
                        value={day.transfers}
                        onChange={(e) =>
                          updateDay(index, "transfers", e.target.value)
                        }
                        placeholder="Airport to Ubud hotel, Private cab for sightseeing"
                      />
                    </Field>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
              >
                <Plus size={16} />
                Add itinerary day
              </button>
            </div>
          </Section>

          {/* ---------- Inclusions ---------- */}
          <Section
            title="Inclusions"
            description="Header icons, hotels and detailed inclusions shown to customers"
            icon={CheckCircle2}
          >
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Package highlights (icons)
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {INCLUSION_OPTIONS.map((option) => {
                  const checked = form.inclusionKeys.includes(option.key);
                  return (
                    <label
                      key={option.key}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                        checked
                          ? "border-violet-600 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleInclusion(option.key)}
                        className="h-4 w-4 accent-violet-600"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Hotels */}
            <div className="mt-6 border-t border-dashed border-slate-300 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Accommodation (city-wise)
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Inclusions tab madhe "Accommodation" mhanun disel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addHotel}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-200 px-3.5 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
                >
                  <Plus size={16} />
                  Add city
                </button>
              </div>

              <div className="space-y-3">
                {form.hotels.map((hotel, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_110px_2fr_auto] sm:items-end"
                  >
                    <Field label="City">
                      <input
                        className={inputClass}
                        value={hotel.city}
                        onChange={(e) =>
                          updateHotel(index, "city", e.target.value)
                        }
                        placeholder="Ubud"
                      />
                    </Field>

                    <Field label="Nights">
                      <input
                        type="number"
                        min="0"
                        className={inputClass}
                        value={hotel.nights}
                        onChange={(e) =>
                          updateHotel(index, "nights", e.target.value)
                        }
                        placeholder="2"
                      />
                    </Field>

                    <Field label="Hotel details">
                      <input
                        className={inputClass}
                        value={hotel.text}
                        onChange={(e) =>
                          updateHotel(index, "text", e.target.value)
                        }
                        placeholder="Ubud Green Resort or similar - twin sharing"
                      />
                    </Field>

                    <button
                      type="button"
                      onClick={() => removeHotel(index)}
                      aria-label={`Remove city ${index + 1}`}
                      className="flex h-12 w-12 items-center justify-center rounded-xl text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail textareas */}
            <div className="mt-6 grid gap-4 border-t border-dashed border-slate-300 pt-5 sm:grid-cols-2">
              {DETAIL_FIELDS.map(([key, label, placeholder]) => (
                <Field key={key} label={label} hint="Ek line madhe ek point">
                  <textarea
                    rows={3}
                    className={inputClass}
                    value={form.inclusionText[key]}
                    onChange={(e) => updateInclusionText(key, e.target.value)}
                    placeholder={placeholder}
                  />
                </Field>
              ))}
            </div>
          </Section>

          {/* ---------- Exclusions & notes ---------- */}
          <Section
            title="Exclusions & Things to Note"
            description="What is not included and important points for travellers"
            icon={AlertCircle}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="What's excluded" hint="Ek line madhe ek point">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.exclusions}
                  onChange={(e) => update("exclusions", e.target.value)}
                  placeholder={"Personal expenses\nUnlisted entry tickets"}
                />
              </Field>

              <Field label="Things to note" hint="Ek line madhe ek point">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.thingsToNote}
                  onChange={(e) => update("thingsToNote", e.target.value)}
                  placeholder={
                    "Passport valid for 6 months\nItinerary may change due to weather"
                  }
                />
              </Field>
            </div>
          </Section>

          {/* ---------- Policies ---------- */}
          <Section
            title="Policies & Important Notes"
            description="Set clear expectations for travellers"
            icon={ShieldCheck}
          >
            <div className="space-y-4">
              <Field label="Cancellation policy">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.cancellationPolicy}
                  onChange={(e) => update("cancellationPolicy", e.target.value)}
                  placeholder="Cancellation timelines and applicable charges..."
                />
              </Field>

              <Field label="Refund policy">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.refundPolicy}
                  onChange={(e) => update("refundPolicy", e.target.value)}
                  placeholder="Refund eligibility and processing details..."
                />
              </Field>

              <Field label="Important notes">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={form.importantNotes}
                  onChange={(e) => update("importantNotes", e.target.value)}
                  placeholder="Weather, accessibility or other trip-specific notes..."
                />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <Section
            title="Package Photos"
            description="Upload multiple photos, up to 2 MB each"
            icon={ImagePlus}
          >
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-violet-500">
              <ImagePlus size={28} className="text-slate-400" />

              <span className="mt-2 text-sm font-semibold text-slate-700">
                Add package photos
              </span>

              <span className="mt-1 text-xs text-slate-500">
                Select multiple images at once
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleImages}
              />
            </label>

            <p className="mt-3 text-xs text-slate-500">
              {imagePreviews.length} photo(s) selected. The first photo is the
              cover. Preview page chya var disel.
            </p>
          </Section>

          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
            <h3 className="font-bold text-violet-950">Package checklist</h3>

            <ul className="mt-3 space-y-3 text-sm">
              {[
                ["Package name", Boolean(form.name.trim())],
                ["Destination", Boolean(form.destination.trim())],
                ["Departure dates", Object.keys(form.departures).length > 0],
                [
                  "Price",
                  isValidMoney(form.price) || firstTourPrice !== undefined,
                ],
                ["Seat capacity", Number(form.seats) >= 1],
                ["Photos", imagePreviews.length > 0],
                ["Itinerary", form.itinerary.some((day) => day.title.trim())],
              ].map(([label, done]) => (
                <li key={label} className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className={done ? "text-emerald-700" : "text-slate-300"}
                  />
                  <span
                    className={done ? "text-emerald-900" : "text-slate-500"}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => savePackage("Draft")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Save size={17} />
              Save as Draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => savePackage("Published")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50"
            >
              <Send size={17} />
              {saving ? "Saving..." : "Publish Package"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => navigate("/vendor/packages")}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
