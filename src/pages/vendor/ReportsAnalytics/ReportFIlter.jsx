import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { PRESETS, STATUS_META } from "../../../utils/reportsConfig";
import { validateCustomRange, todayKey } from "../../../utils/dateUtils";

const field =
  "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 transition focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60";

export default function ReportFilters({ preset, onPreset, custom, onApplyCustom, filters, onFilters, packageOptions, onReset, disabled }) {
  const [draft, setDraft] = useState(custom);
  const [error, setError] = useState(null);

  const apply = () => {
    const err = validateCustomRange(draft);
    setError(err);
    if (!err) onApplyCustom(draft);
  };

  const dirty = preset !== "last7" || filters.status !== "all" || filters.packageId !== "all";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Reporting period
          </p>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Reporting period"
          >
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={preset === p.id}
                disabled={disabled}
                onClick={() => {
                  setError(null);
                  onPreset(p.id);
                }}
                className={`min-h-9 rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                  preset === p.id
                    ? "bg-violet-700 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[26rem] xl:shrink-0">
          <div className="min-w-0">
            <label
              htmlFor="f-status"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Booking status
            </label>
            <select
              id="f-status"
              value={filters.status}
              disabled={disabled}
              onChange={(event) =>
                onFilters({ ...filters, status: event.target.value })
              }
              className={field}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_META).map(([id, meta]) => (
                <option key={id} value={id}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label
              htmlFor="f-package"
              className="mb-1.5 block text-xs font-medium text-gray-600"
            >
              Package
            </label>
            <select
              id="f-package"
              value={filters.packageId}
              disabled={disabled}
              onChange={(event) =>
                onFilters({ ...filters, packageId: event.target.value })
              }
              className={field}
            >
              <option value="all">All packages</option>
              {packageOptions.map((packageOption) => (
                <option key={packageOption.id} value={packageOption.id}>
                  {packageOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {preset === "custom" && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-44">
              <label
                htmlFor="range-from"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                From
              </label>
              <input
                id="range-from"
                type="date"
                max={todayKey()}
                disabled={disabled}
                value={draft.from}
                onChange={(event) =>
                  setDraft({ ...draft, from: event.target.value })
                }
                className={field}
              />
            </div>
            <div className="w-full sm:w-44">
              <label
                htmlFor="range-to"
                className="mb-1.5 block text-xs font-medium text-gray-600"
              >
                To
              </label>
              <input
                id="range-to"
                type="date"
                max={todayKey()}
                disabled={disabled}
                value={draft.to}
                onChange={(event) =>
                  setDraft({ ...draft, to: event.target.value })
                }
                className={field}
              />
            </div>
            <button
              type="button"
              onClick={apply}
              disabled={disabled}
              className="h-10 rounded-lg bg-violet-700 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply range
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {dirty && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:opacity-50"
          >
            <RotateCcw size={13} /> Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
