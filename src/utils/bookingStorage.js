export const BOOKING_STORAGE_KEY = "tour_bookings";

export function getBookings() {
  const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
  if (!stored) return [];

  const bookings = JSON.parse(stored);
  if (!Array.isArray(bookings)) {
    throw new Error("Saved bookings must be an array.");
  }

  return bookings;
}

export function saveBooking(booking) {
  const bookings = getBookings();
  const existingBooking = bookings.find(
    (item) => item.bookingId === booking.bookingId
  );
  if (existingBooking) return existingBooking;

  localStorage.setItem(
    BOOKING_STORAGE_KEY,
    JSON.stringify([booking, ...bookings])
  );
  return booking;
}

export function updateBooking(bookingId, patch) {
  const bookings = getBookings();
  const index = bookings.findIndex((booking) => booking.bookingId === bookingId);
  if (index === -1) return null;

  const updatedBooking = { ...bookings[index], ...patch };
  const nextBookings = [...bookings];
  nextBookings[index] = updatedBooking;
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(nextBookings));

  return updatedBooking;
}
