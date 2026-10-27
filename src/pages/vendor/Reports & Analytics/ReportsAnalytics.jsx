import { useEffect, useMemo, useState } from "react";
import initialPackages from "../../../data/Package.js";
import { getBookings } from "../../../utils/bookingStorage";
import {
  addDays,
  pickGranularity,
  resolveRange,
  todayKey,
} from "../../../utils/dateUtils";
import { buildReport } from "../../../utils/reportsCalculations";
import {
  adaptBooking,
  adaptPackage,
  adaptPayout,
  adaptReview,
} from "../../../services/reportsAdapters";
import { exportExcel, exportPdf } from "../../../services/reportsExport";
import BookingReport from "./BookingReport";
import CustomerTripReports from "./CustomerTripsReports";
import EarningsPayoutReports from "./EarningsPayoutReports";
import OverviewCards from "./OverviewCard";
import PackagePerformance from "./PackagePerformance";
import ReportCharts from "./ReportCharts";
import ReportFilters from "./ReportFIlter";
import SalesReport from "./SalesReport";
import { ErrorState } from "./ui";
import { Download, FileSpreadsheet, LoaderCircle } from "lucide-react";

const PACKAGE_STORAGE_KEY = "tour_vendor_packages_v1";

function createDemoRecords(packages, today) {
  const packageList = packages.slice(0, 6);
  const statuses = ["confirmed", "completed", "pending", "cancelled"];
  const paymentStatuses = ["paid", "paid", "paid", "unpaid", "refunded"];
  const bookings = Array.from({ length: 48 }, (_, index) => {
    const pkg = packageList[index % packageList.length];
    const bookingDate = addDays(today, -(index * 2));
    const travelDate = addDays(bookingDate, index % 5 === 0 ? 3 : 18 + (index % 35));
    const status = statuses[index % statuses.length];
    const paymentStatus =
      status === "cancelled"
        ? "refunded"
        : paymentStatuses[index % paymentStatuses.length];
    const amount = 12000 + (index % 7) * 2750;
    const commission = Math.round(amount * 0.12);
    const refund = paymentStatus === "refunded" ? amount : 0;
    const netEarning =
      paymentStatus === "paid" && status !== "cancelled"
        ? amount - commission
        : null;

    return {
      booking_id: `DEMO-${String(2048 - index).padStart(4, "0")}`,
      package_id: String(pkg.id),
      package_name: pkg.title,
      booking_date: bookingDate,
      travel_date: travelDate,
      travellers: 1 + (index % 5),
      total_amount: amount,
      status,
      payment_status: paymentStatus,
      commission_amount: commission,
      refund_amount: refund,
      vendor_earning: netEarning,
      payout_status:
        status === "completed" && paymentStatus === "paid"
          ? index % 2 === 0
            ? "paid"
            : "eligible"
          : "pending",
      customer_id: `DEMO-CUSTOMER-${index % 31}`,
    };
  });

  const reviews = Array.from({ length: 18 }, (_, index) => {
    const pkg = packageList[index % packageList.length];
    return {
      review_id: `DEMO-REVIEW-${index + 1}`,
      package_id: String(pkg.id),
      rating: 3 + (index % 3),
      comment: [
        "Well-organised trip and helpful tour coordinator.",
        "Great itinerary and a comfortable stay.",
        "Enjoyed the destinations and overall experience.",
      ][index % 3],
      created_at: addDays(today, -(index * 4)),
    };
  });

  const payouts = Array.from({ length: 8 }, (_, index) => ({
    payout_id: `DEMO-PAYOUT-${String(index + 1).padStart(3, "0")}`,
    payout_date: addDays(today, -(index * 9 + 2)),
    reference: `DEMO-REF-${index + 1}`,
    amount: 8500 + index * 1750,
    status: index % 3 === 0 ? "processing" : "paid",
  }));

  return { bookings, reviews, payouts };
}

function loadLocalReportData(useDemoData) {
  const savedPackages = localStorage.getItem(PACKAGE_STORAGE_KEY);
  let packages = initialPackages;

  if (savedPackages) {
    const parsedPackages = JSON.parse(savedPackages);
    if (!Array.isArray(parsedPackages)) {
      throw new Error("Saved packages must be an array.");
    }

    const savedById = new Map(
      parsedPackages.map((item) => [String(item.id), item]),
    );
    const initialIds = new Set(initialPackages.map((item) => String(item.id)));
    packages = [
      ...initialPackages.map(
        (item) => savedById.get(String(item.id)) || item,
      ),
      ...parsedPackages.filter(
        (item) => !initialIds.has(String(item.id)),
      ),
    ];
  }

  const today = todayKey();
  const savedBookings = getBookings();
  const isDemoData = useDemoData;
  const demoRecords = isDemoData ? createDemoRecords(packages, today) : null;
  const bookings = (useDemoData ? demoRecords.bookings : savedBookings).map(
    adaptBooking,
  );
  const reviews = (useDemoData ? demoRecords.reviews : []).map(adaptReview);
  const payouts = (useDemoData ? demoRecords.payouts : []).map(adaptPayout);

  return {
    bookings,
    trips: bookings,
    upcoming: bookings.filter(
      (booking) =>
        booking.travelDate &&
        booking.travelDate >= today &&
        booking.travelDate <= addDays(today, 90),
    ),
    packages: packages.map(adaptPackage),
    payouts,
    reviews,
    isDemoData,
    availability: { payouts: useDemoData, reviews: useDemoData },
  };
}

export default function ReportsAnalytics({ section }) {
  const activeSection = section || "overview";
  const sectionDetails = {
    overview: {
      eyebrow: "Analytics overview",
      description: "A high-level view of booking, sales, package, and trip performance.",
    },
    sales: {
      eyebrow: "Sales report",
      description: "Track booking value over time, separate from vendor earnings.",
    },
    "booking-reports": {
      eyebrow: "Booking analytics",
      description: "Explore booking volume, status, trends, and booking records.",
    },
    earnings: {
      eyebrow: "Revenue report",
      description: "Review recorded vendor earnings, commissions, adjustments, and payouts.",
    },
    packages: {
      eyebrow: "Package performance",
      description: "Compare bookings, travellers, booking value, and ratings by package.",
    },
    customers: {
      eyebrow: "Customer insights",
      description: "Review trip activity, repeat booking signals, and available customer feedback.",
    },
  };
  const pageDetails = sectionDetails[activeSection] || sectionDetails.overview;
  const [useDemoData, setUseDemoData] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState("last7");
  const [customRange, setCustomRange] = useState(() => {
    const today = todayKey();
    return { from: today, to: today };
  });
  const [filters, setFilters] = useState({ status: "all", packageId: "all" });
  const [granularity, setGranularity] = useState(null);
  const [page, setPage] = useState(1);
  const [filterDraftKey, setFilterDraftKey] = useState(0);
  const [exporting, setExporting] = useState("");
  const [exportError, setExportError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(() => loadLocalReportData(useDemoData))
      .then((reportData) => {
        if (active) {
          setData(reportData);
          setError("");
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || "Unable to load saved report data.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey, useDemoData]);

  const range = resolveRange(preset, customRange);
  const rangeFrom = range.from;
  const rangeTo = range.to;
  const reportGranularity = granularity || pickGranularity(range);
  const report = useMemo(() => {
    if (!data) return null;
    return buildReport({
      data,
      range: { from: rangeFrom, to: rangeTo },
      filters,
      granularity: reportGranularity,
      vendorName: data.isDemoData ? "DEMO DATA" : "",
      today: todayKey(),
    });
  }, [data, rangeFrom, rangeTo, filters, reportGranularity]);

  function applyPreset(nextPreset) {
    setPreset(nextPreset);
    setPage(1);
    setGranularity(null);
  }

  function applyCustomRange(nextRange) {
    setCustomRange(nextRange);
    setPage(1);
  }

  function updateFilters(nextFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function resetFilters() {
    setPreset("last7");
    setCustomRange({ from: todayKey(), to: todayKey() });
    setFilters({ status: "all", packageId: "all" });
    setPage(1);
    setGranularity(null);
    setFilterDraftKey((key) => key + 1);
  }

  function changeDataMode(nextMode) {
    setLoading(true);
    setData(null);
    setError("");
    setUseDemoData(nextMode);
  }

  async function handleExport(kind) {
    if (!report) return;
    setExporting(kind);
    setExportError("");
    try {
      if (kind === "pdf") await exportPdf(report);
      else await exportExcel(report);
    } catch (exportFailure) {
      setExportError(exportFailure.message || "Unable to export this report.");
    } finally {
      setExporting("");
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <ErrorState message={error} onRetry={() => {
          setLoading(true);
          setReloadKey((key) => key + 1);
        }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-teal-700">{pageDetails.eyebrow}</p>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-gray-500">{pageDetails.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => changeDataMode(!useDemoData)}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {useDemoData ? "View saved data" : "Preview demo data"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            disabled={!report || Boolean(exporting)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting === "pdf" ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => handleExport("excel")}
            disabled={!report || Boolean(exporting)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting === "excel" ? <LoaderCircle size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            Export Excel
          </button>
        </div>
      </header>

      {exportError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {exportError}
        </p>
      )}

      <ReportFilters
        key={`${customRange.from}:${customRange.to}:${filterDraftKey}`}
        preset={preset}
        onPreset={applyPreset}
        custom={customRange}
        onApplyCustom={applyCustomRange}
        filters={filters}
        onFilters={updateFilters}
        packageOptions={report?.packageOptions || []}
        onReset={resetFilters}
        disabled={loading}
      />

      {activeSection === "overview" && (
        <section id="overview" className="space-y-6">
          <OverviewCards report={report} loading={loading} />
          {report && <ReportCharts report={report} />}
        </section>
      )}

      {report && (
        <>
          {activeSection === "sales" && <SalesReport report={report} />}
          {activeSection === "booking-reports" && (
            <BookingReport
              report={report}
              onGranularity={setGranularity}
              page={page}
              onPage={setPage}
            />
          )}
          {activeSection === "earnings" && <EarningsPayoutReports report={report} />}
          {activeSection === "packages" && <PackagePerformance report={report} />}
          {activeSection === "customers" && (
            <CustomerTripReports report={report} packageName="All packages" />
          )}
        </>
      )}
    </div>
  );
}
