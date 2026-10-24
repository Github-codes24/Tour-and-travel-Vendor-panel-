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
} from "lucide-react";
import initialPackages from "../../data/Package";

const STORAGE_KEY = "tour_vendor_packages_v1";
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const categories = [
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

const emptyForm = {
  name: "",
  destination: "",
  category: "Adventure",
  duration: "",
  description: "",
  price: "",
  seats: "",
  booked: 0,
  departure: "",
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
  inclusions: "",
  exclusions: "",
  cancellationPolicy: "",
  refundPolicy: "",
  travelDocuments: "Valid government photo ID",
  importantNotes: "",
  image: "",
  images: [],
  itinerary: [{ day: 1, title: "", details: "" }],
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

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

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
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

    const existingImages =
      Array.isArray(existing.images) && existing.images.length
        ? existing.images
        : existing.image
          ? [existing.image]
          : [];

    setForm({
      ...emptyForm,
      ...existing,
      images: existingImages,
      inclusions: Array.isArray(existing.inclusions)
        ? existing.inclusions.join("\n")
        : existing.inclusions || "",
      exclusions: Array.isArray(existing.exclusions)
        ? existing.exclusions.join("\n")
        : existing.exclusions || "",
      itinerary:
        Array.isArray(existing.itinerary) && existing.itinerary.length
          ? existing.itinerary
          : emptyForm.itinerary,
    });

    setImagePreviews(existingImages);
  }, [editId]);

  const update = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

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

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      next.price = "Enter a valid price.";
    }

    if (
      form.seats === "" ||
      !Number.isInteger(Number(form.seats)) ||
      Number(form.seats) < 1
    ) {
      next.seats = "Enter at least one seat.";
    }

    if (!form.departure) {
      next.departure = "Departure date is required.";
    }

    if (
      form.lastBookingDate &&
      form.departure &&
      form.lastBookingDate > form.departure
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

    setErrors(next);
    return Object.keys(next).length === 0;
  };

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
        {
          day: previous.itinerary.length + 1,
          title: "",
          details: "",
        },
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

      const packageData = {
        ...form,
        id,
        name: form.name.trim() || "Untitled Package",
        destination: form.destination.trim(),
        price: Number(form.price) || 0,
        seats: Number(form.seats) || 0,
        booked: Number(form.booked) || 0,
        image: imagePreviews[0] || "",
        images: imagePreviews,
        status,
        inclusions: form.inclusions
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        exclusions: form.exclusions
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        itinerary: form.itinerary
          .filter((day) => day.title.trim() || day.details.trim())
          .map((day, index) => ({
            ...day,
            day: index + 1,
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
            className="group mb-4 inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md"
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
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
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
        <div className="space-y-6">
          <Section
            title="Basic Information"
            description="Package name, destination and description"
            icon={ClipboardList}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Package name" required>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Goa Beach Holiday"
                />
                {errorText("name")}
              </Field>

              <Field label="Destination" required>
                <input
                  className={inputClass}
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  placeholder="Goa, India"
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
                        ? "border-emerald-600 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-emerald-300"
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
                                ? "bg-emerald-50 font-semibold text-emerald-700"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              {category}
                              {form.category === category && (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-600"
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
                  placeholder="5 Days / 4 Nights"
                />
                {errorText("duration")}
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

          <Section
            title="Departure & Transport"
            description="Schedule, pickup, drop-off and transport"
            icon={MapPin}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Departure date" required>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                  value={form.departure}
                  onChange={(e) => update("departure", e.target.value)}
                />
                {errorText("departure")}
              </Field>

              <Field label="Last booking date">
                <input
                  type="date"
                  max={form.departure || undefined}
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

          <Section
            title="Pricing & Availability"
            description="Price, capacity and payment terms"
            icon={IndianRupee}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price per person (₹)" required>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="12999"
                />
                {errorText("price")}
              </Field>

              <Field label="Total seats" required>
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
          </Section>

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

          <Section
            title="Day-wise Itinerary"
            description="Add activities for each trip day"
            icon={CalendarDays}
          >
            <div className="space-y-4">
              {form.itinerary.map((day, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800">
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

                  <Field label="Day title">
                    <input
                      className={inputClass}
                      value={day.title}
                      onChange={(e) =>
                        updateDay(index, "title", e.target.value)
                      }
                      placeholder="Arrival and sightseeing"
                    />
                  </Field>

                  <Field label="Activities and details">
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={day.details}
                      onChange={(e) =>
                        updateDay(index, "details", e.target.value)
                      }
                      placeholder="Activities, transfers, meals and timings..."
                    />
                  </Field>
                </div>
              ))}

              <button
                type="button"
                onClick={addDay}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <Plus size={16} />
                Add itinerary day
              </button>
            </div>
          </Section>

          <Section
            title="Inclusions & Exclusions"
            description="List what is and is not included in the price"
            icon={CheckCircle2}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="What's included (one per line)">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.inclusions}
                  onChange={(e) => update("inclusions", e.target.value)}
                  placeholder={"Hotel stay\nBreakfast\nLocal transfers"}
                />
              </Field>

              <Field label="What's excluded (one per line)">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={form.exclusions}
                  onChange={(e) => update("exclusions", e.target.value)}
                  placeholder={"Personal expenses\nUnlisted entry tickets"}
                />
              </Field>
            </div>
          </Section>

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
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-emerald-500">
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

            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {imagePreviews.map((image, index) => (
                  <div
                    key={`${index}-${image.slice(0, 30)}`}
                    className="relative"
                  >
                    <img
                      src={image}
                      alt={`Package photo ${index + 1}`}
                      className="h-32 w-full rounded-xl object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-emerald-700 px-2 py-1 text-xs font-semibold text-white">
                        Cover
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-red-600"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-xs text-slate-500">
              {imagePreviews.length} photo(s) selected. The first photo is the
              cover.
            </p>
          </Section>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <h3 className="font-bold text-emerald-950">Package checklist</h3>

            <ul className="mt-3 space-y-3 text-sm">
              {[
                ["Package name", Boolean(form.name.trim())],
                ["Destination", Boolean(form.destination.trim())],
                ["Departure date", Boolean(form.departure)],
                [
                  "Price",
                  form.price !== "" &&
                    Number.isFinite(Number(form.price)) &&
                    Number(form.price) >= 0,
                ],
                ["Seat capacity", Number(form.seats) >= 1],
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
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
