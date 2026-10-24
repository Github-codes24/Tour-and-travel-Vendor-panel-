import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dateFromKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const keyFromDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AvailabilityCalendar({ departures = {} }) {
  const departureDates = useMemo(
    () => Object.keys(departures).sort(),
    [departures],
  );
  const todayKey = keyFromDate(new Date());
  const initialDate =
    departureDates.find((date) => date >= todayKey) || departureDates[0] || todayKey;
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
        key: keyFromDate(date),
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
  const shiftMonth = (amount) => {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

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
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-slate-900"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-slate-900"
            >
              <ChevronRight size={18} />
            </button>
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
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const capacity = Number(departure?.totalSeats || 0);
            const booked = Number(departure?.bookedSeats || 0);
            const available = Math.max(0, capacity - booked);

            return (
              <button
                key={key}
                type="button"
                aria-label={`${date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}${departure ? `, ${available} seats available` : ""}`}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedKey(key);
                  if (!inMonth) {
                    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
                  }
                }}
                className={`flex min-h-[4.5rem] min-w-0 flex-col items-center gap-1 border-b border-r border-slate-100 p-1.5 text-center transition sm:min-h-[5.5rem] sm:p-2 ${
                  index % 7 === 6 ? "border-r-0" : ""
                } ${
                  isSelected
                    ? "bg-emerald-50 ring-2 ring-inset ring-emerald-600"
                    : inMonth
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-50/70 text-slate-400"
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:text-sm ${
                    isToday
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
                <span className="font-semibold text-slate-900">
                  {Math.max(
                    0,
                    Number(selectedDeparture.totalSeats || 0) -
                      Number(selectedDeparture.bookedSeats || 0),
                  )}
                </span>
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
