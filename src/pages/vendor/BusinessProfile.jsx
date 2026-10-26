import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Phone,
  MapPin,
  FileText,
  ScrollText,
  Images,
  Pencil,
  Save,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Plus,
  ChevronRight,
  CalendarDays,
  Lock,
  Headphones,
  Bell,
  CalendarCheck,
  Landmark,
  Loader2,
} from "lucide-react";

/* -------------------------------------------------------
   Initial data (API madhun aala tar `initialData` prop vapar)
------------------------------------------------------- */

const defaultSettings = {
  /* Booking settings */
  bookingsPaused: false,
  autoAccept: false,
  advancePercent: "30",
  minNoticeDays: "2",

  /* Invoice settings */
  invoicePrefix: "SUN-",
  gstMode: "Inclusive of GST",
  invoiceSignature: "",
  invoiceNote: "Thank you for travelling with us.",

  /* Notification preferences: event -> channel -> on/off */
  notifications: {
    newBooking: { email: true, whatsapp: true, sms: false },
    payment: { email: true, whatsapp: false, sms: false },
    cancellation: { email: true, whatsapp: true, sms: false },
    payout: { email: true, whatsapp: false, sms: false },
  },
};

const defaultProfile = {
  logo: "",
  cover: "",
  name: "Sunrise Travels",
  tagline: "Explore • Discover • Travel",
  about:
    "We create unforgettable travel experiences with customized tour packages, group tours and adventure trips across India and beyond.",
  businessType: "Tour Operator",
  registrationNo: "TRV/2023/0456",
  establishedYear: "2023",
  website: "https://www.sunrisetravels.com",
  teamSize: "11-25",
  languages: ["Marathi", "Hindi", "English"],

  contactPerson: "Rahul Deshmukh",
  email: "contact@sunrisetravels.com",
  phone: "9876543210",
  whatsapp: "9876543210",
  supportHours: "9:00 AM - 7:00 PM",

  addressLine: "Plot 14, Dharampeth",
  city: "Nagpur",
  state: "Maharashtra",
  pincode: "440010",
  mapLink: "",
  destinations: ["Goa", "Himachal", "Kerala"],

  gst: "27ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  tourismRegNo: "",

  accountHolder: "Sunrise Travels",
  bankName: "State Bank of India",
  accountNumber: "123456789012",
  ifsc: "SBIN0001234",
  upiId: "sunrisetravels@sbi",
  payoutCycle: "Weekly",

  cancellationPolicy:
    "Free cancellation up to 15 days before departure. 50% refund between 14 and 7 days. No refund within 7 days of departure.",
  refundPolicy:
    "Eligible refunds are processed to the original payment method within 7 to 10 working days.",
  customerTerms: "",

  gallery: [],

  ...defaultSettings,
};

const businessTypes = [
  "Tour Operator",
  "Travel Agency",
  "Hotel / Resort",
  "Transport Provider",
  "Activity Provider",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1949 }, (_, i) => String(currentYear - i));
const teamSizes = ["1-5", "6-10", "11-25", "26-50", "50+"];
const payoutCycles = ["Weekly", "Fortnightly", "Monthly"];
const gstModes = ["Inclusive of GST", "Exclusive of GST"];
const MAX_PHOTOS = 8;
const MAX_FILE_MB = 2;

const tabs = [
  {
    id: "general",
    label: "Business Info",
    icon: Building2,
    title: "Business Information",
    description: "Basic details about your travel business.",
  },
  {
    id: "contact",
    label: "Contact Info",
    icon: Phone,
    title: "Contact Information",
    description: "Used by travellers and our team to reach your business.",
  },
  {
    id: "address",
    label: "Location",
    icon: MapPin,
    title: "Location",
    description: "Your registered office and the destinations you operate in.",
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Images,
    title: "Gallery",
    description: "Photos of your team, office, vehicles and past trips.",
  },
  {
    id: "legal",
    label: "Legal & Tax",
    icon: FileText,
    title: "Legal & Tax",
    description: "Registration numbers and invoice settings for your business.",
  },
  {
    id: "bank",
    label: "Bank & Payout",
    icon: Landmark,
    title: "Bank & Payout",
    description: "The account where your earnings are credited.",
  },
  {
    id: "policies",
    label: "Policies",
    icon: ScrollText,
    title: "Policies",
    description: "Shown to travellers on your package pages before they book.",
  },
  {
    id: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    title: "Booking settings",
    description: "Control how travellers book and pay for your packages.",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    title: "Notification preferences",
    description: "Choose how you want to hear about bookings and payments.",
  },
];

/* Kontya tab madhe kontya fields aahet (error dot sathi) */
const tabFields = {
  general: [
    "name",
    "businessType",
    "registrationNo",
    "establishedYear",
    "website",
    "about",
    "tagline",
    "teamSize",
    "languages",
  ],
  contact: [
    "contactPerson",
    "email",
    "phone",
    "whatsapp",
    "supportHours",
  ],
  address: ["addressLine", "city", "state", "pincode", "mapLink", "destinations"],
  gallery: ["gallery"],
  legal: ["gst", "pan", "tourismRegNo", "invoicePrefix", "gstMode", "invoiceSignature", "invoiceNote"],
  bank: ["accountHolder", "bankName", "accountNumber", "ifsc", "upiId", "payoutCycle"],
  policies: ["cancellationPolicy", "refundPolicy", "customerTerms"],
  bookings: ["bookingsPaused", "autoAccept", "advancePercent", "minNoticeDays"],
  notifications: ["notifications"],
};

/* -------------------------------------------------------
   Validation
------------------------------------------------------- */

const policyRule = (v) =>
  v.trim() && v.trim().length < 20 ? "Enter at least 20 characters" : "";

const rules = {
  name: (v) => (!v.trim() ? "Business name is required" : ""),
  about: (v) =>
    !v.trim()
      ? "Description is required"
      : v.trim().length < 30
      ? "Enter at least 30 characters"
      : "",
  businessType: (v) => (!v ? "Select a business type" : ""),
  registrationNo: (v) => (!v.trim() ? "Registration number is required" : ""),
  establishedYear: (v) =>
    !v
      ? "Select the year established"
      : !/^\d{4}$/.test(v) || +v < 1950 || +v > new Date().getFullYear()
      ? "Enter a valid year"
      : "",
  contactPerson: (v) => (!v.trim() ? "Contact person is required" : ""),
  email: (v) =>
    !v.trim()
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Enter a valid email address"
      : "",
  phone: (v) =>
    !v ? "Phone number is required" : !/^[6-9]\d{9}$/.test(v) ? "Enter a valid 10-digit mobile number" : "",
  whatsapp: (v) => (v && !/^[6-9]\d{9}$/.test(v) ? "Enter a valid 10-digit mobile number" : ""),
  website: (v) =>
    v && !/^https?:\/\/[^\s.]+\.[^\s]{2,}$/.test(v) ? "Enter a valid URL starting with http:// or https://" : "",
  addressLine: (v) => (!v.trim() ? "Address is required" : ""),
  city: (v) => (!v.trim() ? "City is required" : ""),
  state: (v) => (!v.trim() ? "State is required" : ""),
  pincode: (v) => (!/^\d{6}$/.test(v) ? "Enter a valid 6-digit pincode" : ""),
  mapLink: (v) => (v && !/^https?:\/\//.test(v) ? "Enter a valid link" : ""),
  destinations: (v) => (v.length === 0 ? "Add at least one destination" : ""),
  gst: (v) =>
    v && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(v) ? "Enter a valid 15-character GSTIN" : "",
  pan: (v) => (v && !/^[A-Z]{5}\d{4}[A-Z]$/.test(v) ? "Enter a valid PAN (e.g. ABCDE1234F)" : ""),
  accountNumber: (v) => (v && !/^\d{9,18}$/.test(v) ? "Enter 9 to 18 digits" : ""),
  ifsc: (v) => (v && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(v) ? "Enter a valid IFSC (e.g. SBIN0001234)" : ""),
  upiId: (v) => (v && !/^[\w.-]+@[\w]+$/.test(v) ? "Enter a valid UPI ID" : ""),
  invoicePrefix: (v) =>
    v && !/^[A-Z0-9/_-]{1,12}$/.test(v) ? "Use up to 12 letters, numbers, - or /" : "",
  advancePercent: (v) =>
    !/^\d{1,3}$/.test(v) || +v < 10 || +v > 100 ? "Enter a percentage between 10 and 100" : "",
  minNoticeDays: (v) => (!/^\d{1,2}$/.test(v) || +v > 60 ? "Enter 0 to 60 days" : ""),
  cancellationPolicy: policyRule,
  refundPolicy: policyRule,
  customerTerms: policyRule,
};

function validate(data) {
  const errors = {};
  Object.entries(rules).forEach(([key, check]) => {
    const message = check(data[key] ?? "");
    if (message) errors[key] = message;
  });

  // GSTIN chya 3 te 12 characters mhanje PAN asto
  if (data.gst && data.pan && !errors.gst && !errors.pan && data.gst.slice(2, 12) !== data.pan) {
    errors.pan = "PAN does not match the PAN inside your GSTIN";
  }

  return errors;
}

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

const isFilled = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(String(value ?? "").trim());

const maskAccount = (value) =>
  value ? `${"•".repeat(Math.max(value.length - 4, 0))}${value.slice(-4)}` : "";

const formatPhone = (value) =>
  value && value.length === 10 ? `+91 ${value.slice(0, 5)} ${value.slice(5)}` : value;

/* onUpload(file) -> Promise<string url>. Prop nasel tar local preview URL vapar. */
const uploadImage = async (file, onUpload) =>
  onUpload ? onUpload(file) : URL.createObjectURL(file);

const inputClass = (hasError) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-300 focus:border-teal-600 focus:ring-teal-600/15"
  }`;

const viewBoxClass = "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-900";

/* -------------------------------------------------------
   Reusable UI pieces
------------------------------------------------------- */

function ViewValue({ kind, name, value }) {
  if (!isFilled(value)) return <span className="font-normal text-slate-400">Not provided</span>;

  if (kind === "phone") return formatPhone(value);
  if (kind === "percent") return `${value}%`;
  if (kind === "days") return `${value} ${String(value) === "1" ? "day" : "days"}`;
  if (kind === "mask") return <span className="font-mono tracking-wide">{maskAccount(value)}</span>;
  if (kind === "mono") return <span className="font-mono tracking-wide">{value}</span>;

  if (kind === "email") {
    return (
      <a href={`mailto:${value}`} className="text-teal-700 hover:underline">
        {value}
      </a>
    );
  }

  if (kind === "link") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer noopener"
        className="break-all text-teal-700 hover:underline"
      >
        {value}
      </a>
    );
  }

  const multiline = kind === "multiline" || name === "about";
  return <span className={multiline ? "whitespace-pre-line font-normal leading-6" : ""}>{value}</span>;
}

function FieldLabel({ editing, name, label, required }) {
  const content = (
    <>
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </>
  );
  const cls = "mb-1.5 block text-sm font-medium text-slate-700";
  return editing ? (
    <label htmlFor={name} className={cls}>
      {content}
    </label>
  ) : (
    <p className={cls}>{content}</p>
  );
}

function Field({
  label,
  name,
  data,
  errors,
  editing,
  onChange,
  type = "text",
  kind,
  options,
  placeholder,
  hint,
  span = 1,
  required = false,
  maxLength,
  inputMode,
  showCount = false,
}) {
  const value = data[name] ?? "";
  const error = errors[name];
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;
  const showFooter = (editing && (error || hint)) || (showCount && maxLength);

  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <FieldLabel editing={editing} name={name} label={label} required={required} />

      {!editing ? (
        <div className={`${viewBoxClass} ${type === "textarea" ? "min-h-[108px]" : "min-h-[42px]"}`}>
          <ViewValue kind={type === "textarea" ? "multiline" : kind} name={name} value={value} />
        </div>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          rows={4}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(name, e.target.value)}
          className={`${inputClass(error)} resize-none`}
        />
      ) : type === "select" ? (
        <select
          id={name}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass(error)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          value={value}
          maxLength={maxLength}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(e) => onChange(name, e.target.value)}
          className={inputClass(error)}
        />
      )}

      {showFooter && (
        <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
          <div className="min-w-0">
            {editing && error ? (
              <p id={`${name}-error`} className="flex items-center gap-1.5 text-red-600">
                <AlertCircle size={13} className="shrink-0" />
                {error}
              </p>
            ) : editing && hint ? (
              <p id={`${name}-hint`} className="text-slate-500">
                {hint}
              </p>
            ) : null}
          </div>

          {showCount && maxLength && (
            <span className="ml-auto shrink-0 tabular-nums text-slate-400">
              {String(value).length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function TagField({
  label,
  name,
  data,
  errors,
  editing,
  onChange,
  placeholder,
  required = false,
  span = 2,
}) {
  const [text, setText] = useState("");
  const tags = data[name] || [];
  const error = errors[name];

  const addTag = () => {
    const value = text.trim();
    if (!value) return;
    if (!tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      onChange(name, [...tags, value]);
    }
    setText("");
  };

  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <p className="mb-1.5 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </p>

      <div
        className={`rounded-lg border p-2 ${
          editing
            ? `bg-white ${error ? "border-red-300" : "border-slate-300"}`
            : "min-h-[42px] border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {tags.length === 0 && !editing && (
            <span className="px-1 py-0.5 text-sm text-slate-400">Not provided</span>
          )}

          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800 ring-1 ring-inset ring-teal-100"
            >
              {tag}
              {editing && (
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onChange(name, tags.filter((item) => item !== tag))}
                  className="rounded text-teal-600 hover:text-red-600"
                >
                  <X size={13} />
                </button>
              )}
            </span>
          ))}

          {editing && (
            <div className="flex min-w-[170px] flex-1 items-center gap-1">
              <input
                value={text}
                placeholder={placeholder}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={addTag}
                aria-label={`Add ${label}`}
                className="rounded-md p-1.5 text-teal-700 hover:bg-teal-50"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {editing && error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function GalleryField({ data, editing, onChange, onError, onStartEdit, onUpload }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const photos = data.gallery || [];
  const canAdd = photos.length < MAX_PHOTOS;

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const valid = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_MB * 1024 * 1024,
    );
    const room = MAX_PHOTOS - photos.length;
    const accepted = valid.slice(0, room);

    if (valid.length < files.length) {
      onError(`Some files were skipped. Use images smaller than ${MAX_FILE_MB} MB.`);
    } else if (valid.length > room) {
      onError(`You can add up to ${MAX_PHOTOS} photos.`);
    }

    if (accepted.length === 0) return;

    try {
      setBusy(true);
      const results = await Promise.allSettled(accepted.map((file) => uploadImage(file, onUpload)));

      const added = [];
      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const file = accepted[index];
        added.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          url: result.value,
          name: file.name,
        });
      });

      if (added.length < accepted.length) {
        onError("Some photos could not be uploaded. Please try again.");
      }
      if (added.length > 0) onChange("gallery", [...photos, ...added]);
    } finally {
      setBusy(false);
    }
  };

  if (photos.length === 0 && !editing) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
          <Images size={20} />
        </span>
        <p className="mt-3 text-sm font-medium text-slate-900">No photos added yet</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Businesses with photos get more enquiries. Add up to {MAX_PHOTOS} images of your team,
          office or past trips.
        </p>
        <button
          type="button"
          onClick={onStartEdit}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Plus size={15} />
          Add photos
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {photos.length} of {MAX_PHOTOS} photos
        </span>
        {editing && <span>JPG or PNG, up to {MAX_FILE_MB} MB each</span>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />

            {editing && (
              <button
                type="button"
                aria-label={`Remove ${photo.name}`}
                onClick={() =>
                  onChange(
                    "gallery",
                    photos.filter((item) => item.id !== photo.id),
                  )
                }
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-red-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        {editing && canAdd && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-sm font-medium text-slate-500 transition hover:border-teal-600 hover:bg-teal-50 hover:text-teal-700"
            >
              {busy ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              {busy ? "Uploading..." : "Add photos"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </>
        )}
      </div>
    </div>
  );
}

function Notice({ tone = "info", icon: Icon, children }) {
  const styles =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <p className="leading-6">{children}</p>
    </div>
  );
}

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25 ${
        checked ? "bg-teal-600" : "bg-slate-300"
      } ${disabled ? "cursor-default opacity-60" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ToggleField({ label, description, name, data, editing, onChange }) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-lg border border-slate-200 p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <Switch
        checked={Boolean(data[name])}
        disabled={!editing}
        label={label}
        onChange={(next) => onChange(name, next)}
      />
    </div>
  );
}

const notificationEvents = [
  ["newBooking", "New booking", "When a traveller books one of your packages"],
  ["payment", "Payment received", "When a booking payment is confirmed"],
  ["cancellation", "Cancellation", "When a traveller cancels a booking"],
  ["payout", "Payout update", "When a payout is processed or fails"],
];
const notificationChannels = [
  ["email", "Email"],
  ["whatsapp", "WhatsApp"],
  ["sms", "SMS"],
];

function NotificationMatrix({ data, editing, onChange }) {
  const prefs = data.notifications || {};

  const toggle = (event, channel, next) =>
    onChange("notifications", {
      ...prefs,
      [event]: { ...(prefs[event] || {}), [channel]: next },
    });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">Alert</th>
            {notificationChannels.map(([key, label]) => (
              <th key={key} scope="col" className="px-4 py-3 text-center">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {notificationEvents.map(([event, title, description]) => (
            <tr key={event}>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
              </td>
              {notificationChannels.map(([channel, label]) => (
                <td key={channel} className="px-4 py-3 text-center">
                  <Switch
                    checked={Boolean(prefs[event]?.[channel])}
                    disabled={!editing}
                    label={`${title} by ${label}`}
                    onChange={(next) => toggle(event, channel, next)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignatureField({ data, editing, uploading, onPick, onRemove }) {
  const url = data.invoiceSignature;

  return (
    <div className="sm:col-span-2">
      <p className="mb-1.5 text-sm font-medium text-slate-700">Authorised signature / stamp</p>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-slate-300 bg-white">
          {url ? (
            <img src={url} alt="Authorised signature" className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-xs text-slate-400">Not provided</span>
          )}
        </div>

        <p className="min-w-[160px] flex-1 text-xs leading-5 text-slate-500">
          Printed at the bottom of every invoice. A PNG with a transparent background works best.
        </p>

        {editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPick}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? "Uploading..." : url ? "Replace" : "Upload"}
            </button>
            {url && !uploading && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value || "Not provided"}</p>
      </div>
    </div>
  );
}

function LogoCircle({ logo, initial, className = "" }) {
  return logo ? (
    <img
      src={logo}
      alt="Business logo"
      className={`rounded-full border-4 border-white bg-white object-cover shadow-sm ${className}`}
    />
  ) : (
    <div
      className={`flex items-center justify-center rounded-full border-4 border-white bg-white font-semibold text-teal-700 shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}

/* -------------------------------------------------------
   Main page
------------------------------------------------------- */

export default function BusinessProfile({
  initialData = defaultProfile,
  status = "Active",
  onSave,
  onUpload,
}) {
  const [profile, setProfile] = useState(() => ({ ...defaultSettings, ...initialData }));
  const [draft, setDraft] = useState(() => ({ ...defaultSettings, ...initialData }));
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState({});
  const logoInput = useRef(null);
  const signatureInput = useRef(null);
  const coverInput = useRef(null);
  const tabRefs = useRef({});

  const data = editing ? draft : profile;
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(profile);
  const currentTab = tabs.find((tab) => tab.id === activeTab);
  const CurrentIcon = currentTab.icon;

  /* Unsaved changes warning (refresh / tab close) */
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /* In-app link (sidebar etc.) var click kelyavar unsaved changes warning.
     BrowserRouter var pan chalte, data router lagat nahi. */
  useEffect(() => {
    if (!dirty) return undefined;

    const guard = (event) => {
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      if (!window.confirm("You have unsaved changes. Leave this page without saving?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", guard, true);
    return () => document.removeEventListener("click", guard, true);
  }, [dirty]);

  /* Toast auto-hide */
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showError = (message) => setToast({ type: "error", message });
  const tabHasError = (tabId) => tabFields[tabId].some((field) => errors[field]);

  const handleChange = (name, value) => {
    const upper = ["gst", "pan", "ifsc", "invoicePrefix"].includes(name);
    const digitsOnly = [
      "phone",
      "whatsapp",
      "pincode",
      "accountNumber",
      "establishedYear",
      "advancePercent",
      "minNoticeDays",
    ].includes(name);

    let next = value;
    if (upper && typeof value === "string") next = value.toUpperCase().replace(/\s/g, "");
    if (digitsOnly && typeof value === "string") next = value.replace(/\D/g, "");

    setDraft((previous) => ({ ...previous, [name]: next }));
    if (errors[name] || (["gst", "pan"].includes(name) && (errors.gst || errors.pan))) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
        ...(["gst", "pan"].includes(name) ? { gst: "", pan: "" } : {}),
      }));
    }
  };

  const startEdit = () => {
    if (editing) return;
    setDraft(profile);
    setErrors({});
    setEditing(true);
  };

  const cancelEdit = () => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setDraft(profile);
    setErrors({});
    setEditing(false);
  };

  const handleSave = async () => {
    const found = validate(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const firstTab = tabs.find((tab) => tabFields[tab.id].some((field) => found[field]));
      if (firstTab) setActiveTab(firstTab.id);
      showError("Please correct the highlighted fields.");
      return;
    }

    try {
      setSaving(true);
      if (onSave) await onSave(draft);
      setProfile(draft);
      setEditing(false);
      setToast({ type: "success", message: "Business profile saved successfully." });
    } catch (error) {
      /* API ne { errors: { gst: "Already registered" } } pathavla tar field var dakhva */
      const serverErrors = error?.fieldErrors || error?.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        setErrors(serverErrors);
        const firstTab = tabs.find((tab) => tabFields[tab.id].some((field) => serverErrors[field]));
        if (firstTab) setActiveTab(firstTab.id);
        showError("Please correct the highlighted fields.");
      } else {
        showError("Unable to save changes. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* Logo / cover upload (edit mode apoap chalu hoto) */
  const pickImage = (field, label) => async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_FILE_MB * 1024 * 1024) {
      showError(`${label} must be an image smaller than ${MAX_FILE_MB} MB.`);
      return;
    }

    try {
      setUploading((previous) => ({ ...previous, [field]: true }));
      const url = await uploadImage(file, onUpload);
      handleChange(field, url);
    } catch (error) {
      showError(`Unable to upload ${label.toLowerCase()}. Please try again.`);
    } finally {
      setUploading((previous) => ({ ...previous, [field]: false }));
    }
  };

  const openPicker = (ref) => {
    startEdit();
    ref.current?.click();
  };

  /* Keyboard navigation: Left / Right / Home / End */
  const handleTabKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    let next = null;

    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;

    event.preventDefault();
    const nextId = tabs[next].id;
    setActiveTab(nextId);
    tabRefs.current[nextId]?.focus();
  };

  const common = { data, errors, editing, onChange: handleChange };
  const initial = (data.name || "B").trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Toast */}
      {toast && (
        <div
          role={toast.type === "error" ? "alert" : "status"}
          className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Page heading */}
      <div className="mb-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <span>Vendor Portal</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span>Business Profile</span>
        </nav>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Business Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your travel business details and contact information.
        </p>
      </div>

      {/* Hidden file inputs (cover + logo) */}
      <input ref={coverInput} type="file" accept="image/*" onChange={pickImage("cover", "Cover")} className="hidden" />
      <input ref={logoInput} type="file" accept="image/*" onChange={pickImage("logo", "Logo")} className="hidden" />
      <input ref={signatureInput} type="file" accept="image/*" onChange={pickImage("invoiceSignature", "Signature")} className="hidden" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------------- Left column ---------------- */}
        <div className="min-w-0 space-y-6">
          {/* Cover + summary card */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div
              className="relative h-44 bg-gradient-to-r from-teal-800 via-teal-600 to-sky-500 bg-cover bg-center sm:h-48"
              style={data.cover ? { backgroundImage: `url(${data.cover})` } : undefined}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 via-slate-900/20 to-transparent" />

              <div className="relative flex h-full items-center gap-4 px-5 sm:gap-5 sm:px-8">
                <LogoCircle logo={data.logo} initial={initial} className="h-20 w-20 shrink-0 text-3xl sm:h-24 sm:w-24" />
                <div className="min-w-0 text-white">
                  <h2 className="truncate text-2xl font-bold sm:text-3xl">{data.name || "Business name"}</h2>
                  <p className="mt-1 truncate text-sm text-white/90">{data.tagline || "Add a short tagline"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openPicker(coverInput)}
                disabled={uploading.cover}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-slate-900/70 px-3 py-2 text-xs font-medium text-white backdrop-blur transition hover:bg-slate-900/85 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                {uploading.cover ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {uploading.cover ? "Uploading..." : "Change Cover"}
              </button>
            </div>

            <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-stretch">
              <div className="flex min-w-0 flex-1 gap-4 sm:gap-5">
                <div className="relative h-24 w-24 shrink-0">
                  <LogoCircle logo={data.logo} initial={initial} className="h-24 w-24 text-4xl" />
                  <button
                    type="button"
                    onClick={() => openPicker(logoInput)}
                    disabled={uploading.logo}
                    aria-label="Change business logo"
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow transition hover:bg-teal-700"
                  >
                    {uploading.logo ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{data.name || "Business name"}</h2>
                    {status && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        {status}
                      </span>
                    )}
                    {data.bookingsPaused && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        Bookings paused
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Travel &amp; Tourism{data.businessType ? ` • ${data.businessType}` : ""}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{data.about}</p>
                </div>
              </div>

              <div className="space-y-4 rounded-xl bg-slate-50 p-5 lg:w-72 lg:shrink-0">
                <InfoRow icon={ScrollText} label="Registration Number" value={data.registrationNo} />
                <InfoRow icon={CalendarDays} label="Established Year" value={data.establishedYear} />
                <InfoRow icon={Building2} label="Business Type" value={data.businessType} />
              </div>
            </div>
          </section>

          {/* Tabs + section card */}
          <div>
            <div
              role="tablist"
              aria-label="Business profile sections"
              onKeyDown={handleTabKeyDown}
              className="flex flex-wrap gap-x-1 px-2"
            >
              {tabs.map((tab) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    ref={(element) => {
                      tabRefs.current[tab.id] = element;
                    }}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3.5 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 focus:outline-none focus-visible:bg-slate-100 ${
                      active
                        ? "text-teal-700 after:bg-teal-600"
                        : "text-slate-600 after:bg-transparent hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                    {tabHasError(tab.id) && (
                      <span className="h-2 w-2 rounded-full bg-red-500" aria-label="Has errors" />
                    )}
                  </button>
                );
              })}
            </div>

            <section
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <CurrentIcon size={20} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{currentTab.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{currentTab.description}</p>
                  </div>
                </div>

                {!editing ? (
                  <button
                    type="button"
                    onClick={startEdit}
                    className="inline-flex items-center gap-2 rounded-lg border border-teal-600 bg-white px-4 py-2 text-sm font-medium text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/20"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-60"
                    >
                      <Save size={14} />
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                )}
              </div>

              {activeTab === "general" && (
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field {...common} label="Business Name" name="name" required />
                  <Field {...common} label="Business Type" name="businessType" type="select" options={businessTypes} required />
                  <Field {...common} label="Registration Number" name="registrationNo" kind="mono" required />
                  <Field {...common} label="Established Year" name="establishedYear" type="select" options={years} required />
                  <Field {...common} label="Website" name="website" kind="link" placeholder="https://www.yourbusiness.com" />
                  <Field {...common} label="Tagline" name="tagline" maxLength={80} showCount placeholder="e.g. Explore • Discover • Travel" />
                  <Field {...common} label="Team size" name="teamSize" type="select" options={teamSizes} />
                  <TagField {...common} label="Languages spoken" name="languages" placeholder="Type a language and press Enter" span={1} />
                  <Field
                    {...common}
                    label="Description"
                    name="about"
                    type="textarea"
                    span={2}
                    maxLength={500}
                    showCount
                    required
                    placeholder="Describe your services, experience and what sets you apart."
                    hint="Minimum 30 characters."
                  />
                </div>
              )}

              {activeTab === "contact" && (
                <>
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Field {...common} label="Contact Person" name="contactPerson" required />
                    <Field {...common} label="Business Email" name="email" type="email" kind="email" required />
                    <Field {...common} label="Phone Number" name="phone" kind="phone" maxLength={10} inputMode="numeric" placeholder="10-digit mobile number" required />
                    <Field {...common} label="WhatsApp Number" name="whatsapp" kind="phone" maxLength={10} inputMode="numeric" placeholder="10-digit mobile number" />
                    <Field {...common} label="Customer Support Hours" name="supportHours" span={2} placeholder="e.g. 9:00 AM - 7:00 PM" />
                  </div>

                </>
              )}

              {activeTab === "address" && (
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Field {...common} label="Registered Address" name="addressLine" span={2} required />
                  <Field {...common} label="City" name="city" required />
                  <Field {...common} label="State" name="state" required />
                  <Field {...common} label="Pincode" name="pincode" maxLength={6} inputMode="numeric" required />
                  <Field {...common} label="Google Maps Link" name="mapLink" kind="link" placeholder="https://maps.google.com/..." />
                  <TagField {...common} label="Operating Destinations" name="destinations" placeholder="Type a destination and press Enter" required />
                </div>
              )}

              {activeTab === "gallery" && (
                <GalleryField
                  data={data}
                  editing={editing}
                  onChange={handleChange}
                  onError={showError}
                  onStartEdit={startEdit}
                  onUpload={onUpload}
                />
              )}

              {activeTab === "legal" && (
                <>
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field {...common} label="GST Number (GSTIN)" name="gst" kind="mono" maxLength={15} placeholder="e.g. 27ABCDE1234F1Z5" />
                    <Field {...common} label="PAN Number" name="pan" kind="mono" maxLength={10} placeholder="e.g. ABCDE1234F" />
                    <Field {...common} label="Tourism Registration Number" name="tourismRegNo" kind="mono" hint="IATA, TAAI or state tourism registration, if applicable." />
                  </div>

                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-semibold text-slate-900">Invoice settings</h4>
                    <p className="mt-1 text-sm text-slate-500">
                      Used on every invoice generated for your bookings.
                    </p>
                    <div className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <Field {...common} label="Invoice prefix" name="invoicePrefix" kind="mono" maxLength={12} placeholder="e.g. SUN-" hint="Invoices will be numbered like SUN-0001." />
                      <Field {...common} label="GST on package price" name="gstMode" type="select" options={gstModes} />
                      <SignatureField
                        data={data}
                        editing={editing}
                        uploading={uploading.invoiceSignature}
                        onPick={() => openPicker(signatureInput)}
                        onRemove={() => handleChange("invoiceSignature", "")}
                      />
                      <Field {...common} label="Note on invoice" name="invoiceNote" type="textarea" span={2} maxLength={300} showCount placeholder="e.g. Thank you for travelling with us." />
                    </div>
                  </div>
                </>
              )}

              {activeTab === "bank" && (
                <div className="space-y-6">
                  <Notice tone="warning" icon={AlertCircle}>
                    Payouts are credited only to this account. The account holder name should match
                    your registered business name to avoid payment delays.
                  </Notice>
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Field {...common} label="Account Holder Name" name="accountHolder" />
                    <Field {...common} label="Bank Name" name="bankName" />
                    <Field {...common} label="Account Number" name="accountNumber" kind="mask" maxLength={18} inputMode="numeric" />
                    <Field {...common} label="IFSC Code" name="ifsc" kind="mono" maxLength={11} placeholder="e.g. SBIN0001234" />
                    <Field {...common} label="UPI ID" name="upiId" placeholder="name@bank" />
                    <Field {...common} label="Payout Cycle" name="payoutCycle" type="select" options={payoutCycles} />
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div className="space-y-6">
                  <Notice icon={ScrollText}>
                    These policies apply to all your packages unless a package defines its own terms.
                    Be specific about timelines and percentages to avoid disputes.
                  </Notice>
                  <div className="grid gap-y-5">
                    <Field {...common} label="Cancellation Policy" name="cancellationPolicy" type="textarea" maxLength={1000} showCount placeholder="e.g. Free cancellation up to 15 days before departure..." />
                    <Field {...common} label="Refund Policy" name="refundPolicy" type="textarea" maxLength={1000} showCount placeholder="e.g. Refunds are processed within 7 to 10 working days..." />
                    <Field {...common} label="Terms for Customers" name="customerTerms" type="textarea" maxLength={1000} showCount placeholder="e.g. ID proof required, travel insurance recommended..." />
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <div className="space-y-6">
                  {data.bookingsPaused && (
                    <Notice tone="warning" icon={AlertCircle}>
                      Bookings are paused. Travellers cannot book your packages until you turn this off.
                    </Notice>
                  )}

                  <div className="grid gap-4">
                    <ToggleField
                      {...common}
                      name="bookingsPaused"
                      label="Pause new bookings"
                      description="Use this when you are on leave or fully booked. Existing bookings are not affected."
                    />
                    <ToggleField
                      {...common}
                      name="autoAccept"
                      label="Auto-accept bookings"
                      description="Confirm bookings instantly instead of waiting for your approval."
                    />
                  </div>

                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    <Field {...common} label="Advance payment (%)" name="advancePercent" kind="percent" maxLength={3} inputMode="numeric" required hint="Share of the total amount travellers pay to confirm a booking." />
                    <Field {...common} label="Minimum notice (days)" name="minNoticeDays" kind="days" maxLength={2} inputMode="numeric" required hint="Bookings close this many days before departure." />
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <Notice icon={Bell}>
                    Alerts are sent to {data.email || "your business email"} and{" "}
                    {data.phone ? formatPhone(data.phone) : "your phone number"}. Update these on the
                    Contact Info tab.
                  </Notice>
                  <NotificationMatrix data={data} editing={editing} onChange={handleChange} />
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ---------------- Right column ---------------- */}
        <aside className="space-y-6">
          {/* Quick actions */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Quick Actions</h2>

            <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("general");
                    startEdit();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Pencil size={16} />
                  </span>
                  Edit Profile
                </button>
              </li>
              <li>
                <Link
                  to="/vendor/settings"
                  className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Lock size={16} />
                  </span>
                  Change Password
                </Link>
              </li>
            </ul>
          </section>

          {/* Need help */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <Headphones size={28} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-teal-800">Need Help?</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Our support team is here to assist you with any queries.
                </p>
              </div>
            </div>
            <Link
              to="/vendor/support"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-600/25"
            >
              Contact Support
            </Link>
          </section>
        </aside>
      </div>

      {/* Unsaved changes bar */}
      {dirty && (
        <div className="sticky bottom-4 z-40 mx-auto mt-6 flex w-full max-w-xl items-center justify-between gap-3 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            You have unsaved changes
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-white/10"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-teal-500 px-3 py-1.5 font-medium text-white transition hover:bg-teal-400 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}