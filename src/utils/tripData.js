import initialPackages from "../data/Package.js";
import { BOOKING_STORAGE_KEY, getBookings } from "./bookingStorage";

export { BOOKING_STORAGE_KEY };
export const PACKAGE_STORAGE_KEY = "tour_vendor_packages_v1";
export const TRIP_STATUS_STORAGE_KEY = "tour_vendor_trip_statuses_v1";
export const TRIP_STATUSES = ["Scheduled", "In Progress", "Completed", "Cancelled"];

export const statusStyles = {
  Scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 ring-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export function formatDate(date) {
  if (!date) return "Not scheduled";
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return "Not scheduled";
  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function readStoredArray(key) {
  const value = localStorage.getItem(key);
  if (!value) return null;

  const parsed = JSON.parse(value);
  if (!Array.isArray(parsed)) {
    throw new Error(`Saved data for ${key} must be an array.`);
  }
  return parsed;
}

export function readTripStatuses() {
  const value = localStorage.getItem(TRIP_STATUS_STORAGE_KEY);
  if (!value) return {};

  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Saved trip statuses must be an object.");
  }
  return parsed;
}

export function saveTripStatus(tripId, newStatus) {
  if (!TRIP_STATUSES.includes(newStatus)) return;
  const statuses = readTripStatuses();
  localStorage.setItem(
    TRIP_STATUS_STORAGE_KEY,
    JSON.stringify({ ...statuses, [tripId]: newStatus })
  );
}

function readPackages() {
  const savedPackages = readStoredArray(PACKAGE_STORAGE_KEY);
  if (!savedPackages) return initialPackages;

  const savedById = new Map(savedPackages.map((pkg) => [String(pkg.id), pkg]));
  const mergedPackages = initialPackages.map(
    (pkg) => savedById.get(String(pkg.id)) || pkg
  );
  const initialIds = new Set(initialPackages.map((pkg) => String(pkg.id)));

  return [
    ...mergedPackages,
    ...savedPackages.filter((pkg) => !initialIds.has(String(pkg.id))),
  ];
}

export function removePackageById(packageId) {
  const packages = readPackages();
  const updatedPackages = packages.filter(
    (pkg) => String(pkg.id) !== String(packageId)
  );
  if (updatedPackages.length === packages.length) return null;

  localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(updatedPackages));
  return updatedPackages;
}

function getStatusForDate(date, id, overrides) {
  const savedStatus = overrides[id];
  if (TRIP_STATUSES.includes(savedStatus)) return savedStatus;

  const today = new Date().toISOString().slice(0, 10);
  if (date < today) return "Completed";
  if (date === today) return "In Progress";
  return "Scheduled";
}

function bookingMatchesPackage(booking, pkg) {
  return (
    (booking.pkgId != null && String(booking.pkgId) === String(pkg.id)) ||
    (booking.pkgSlug && booking.pkgSlug === pkg.slug) ||
    (booking.pkgTitle &&
      booking.pkgTitle.toLowerCase() ===
        (pkg.title || pkg.name || "").toLowerCase())
  );
}

function toTextList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      return item?.text || item?.title || item?.name || "";
    })
    .filter(Boolean);
}

function toItinerary(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === "string") {
      return { day: `Day ${index + 1}`, title: item, description: "" };
    }
    const activities = Array.isArray(item?.activities)
      ? item.activities
          .map((a) => (typeof a === "string" ? a : a?.title || a?.name || ""))
          .filter(Boolean)
          .join(", ")
      : "";
    return {
      day: item?.day || `Day ${index + 1}`,
      title: item?.title || item?.name || "Itinerary",
      description: item?.description || item?.details || activities || "",
    };
  });
}

export function buildTrips() {
  const bookings = getBookings();
  const statusOverrides = readTripStatuses();

  return readPackages()
    .filter((pkg) => pkg.status === "Published")
    .flatMap((pkg) => {
      const departures =
        pkg.departures && Object.keys(pkg.departures).length
          ? Object.entries(pkg.departures)
          : pkg.departure
            ? [
                [
                  pkg.departure,
                  {
                    adultPrice: pkg.price,
                    totalSeats: pkg.seats,
                    bookedSeats: pkg.booked,
                  },
                ],
              ]
            : [];

      return departures.map(([date, details]) => {
        const matchingBookings = bookings.filter(
          (booking) =>
            bookingMatchesPackage(booking, pkg) && booking.date === date
        );
        const activeBookings = matchingBookings.filter(
          (booking) => booking.status !== "cancelled"
        );
        const bookingTravellerCount = activeBookings.reduce(
          (count, booking) =>
            count +
            (Array.isArray(booking.travellers) ? booking.travellers.length : 0),
          0
        );
        const configuredBookedSeats =
          Number(details.bookedSeats ?? pkg.booked) || 0;
        const bookedSeats = matchingBookings.length
          ? bookingTravellerCount
          : configuredBookedSeats;
        const basePrice =
          Number(
            details.adultPrice ?? pkg.tourTypes?.[0]?.price ?? pkg.price
          ) || 0;
        const id = `${pkg.slug || pkg.id}-${date}`;

        return {
          id,
          pkgId: pkg.id,
          pkgSlug: pkg.slug || "",
          packageName: pkg.title || pkg.name || "Tour package",
          destination: pkg.destination || (pkg.route || []).join(", ") || "—",
          description:
            pkg.description || pkg.overview || pkg.summary || pkg.about || "",
          departureDate: date,
          returnDate: details.returnDate || pkg.returnDate || "",
          departureTime:
            details.departureTime || pkg.departureTime || "Not specified",
          meetingPoint:
            details.meetingPoint || pkg.pickupLocation || "Not specified",
          vehicle: details.vehicle || pkg.vehicle || pkg.transport || "",
          coordinator: details.coordinator || pkg.coordinator || "",
          coordinatorPhone:
            details.coordinatorPhone || pkg.coordinatorPhone || "",
          bookedSeats,
          totalSeats: Number(details.totalSeats ?? pkg.seats) || 0,
          status: getStatusForDate(date, id, statusOverrides),
          duration: pkg.duration || "Not specified",
          price: basePrice,
          itinerary: toItinerary(pkg.itinerary),
          inclusions: toTextList(pkg.inclusions),
          exclusions: toTextList(pkg.exclusions),
          bookings: matchingBookings,
        };
      });
    })
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));
}

export function getCustomerName(booking) {
  const lead = booking.travellers?.[0];
  return (
    booking.contact?.name ||
    booking.contact?.fullName ||
    lead?.name ||
    [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
    "Customer"
  );
}

export function getTravellerName(traveller) {
  return (
    traveller?.name ||
    [traveller?.firstName, traveller?.lastName].filter(Boolean).join(" ") ||
    "Traveller"
  );
}