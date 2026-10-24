import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Map,
  MoreVertical,
  Plane,
  PlusCircle,
  TrendingUp,
  Wallet,
  X,
  Zap,
  Users,
  Target,
  Star,
  BarChart3,
  Eye,
} from "lucide-react";

import {
  Card,
  EmptyState,
  StatusBadge,
  Table,
  Tabs,
  Td,
  inr,
} from "../../components/vendor/ui";

import dashboardTravel from "../../assets/dashboard-travel.jpg";
import goaTour from "../../assets/goa-tour.jpg";
import heroImage from "../../assets/hero.png";

/* ------------------------------------------------------------------ */
/* Dummy data - replace these constants with API data when connecting */
/* ------------------------------------------------------------------ */

const packages = [
  { id: 1, name: "Manali Adventure Tour", category: "Adventure", price: 12500, status: "Published" },
  { id: 2, name: "Goa Beach Holiday", category: "Family", price: 18000, status: "Published" },
  { id: 3, name: "Kashmir Family Trip", category: "Family", price: 32000, status: "Published" },
  { id: 4, name: "Kerala Backwaters", category: "Honeymoon", price: 22000, status: "Published" },
  { id: 5, name: "Jaipur Heritage Tour", category: "Group", price: 9500, status: "Published" },
  { id: 6, name: "Spiti Valley Road Trip", category: "Adventure", price: 27500, status: "Pending Approval" },
  { id: 7, name: "Andaman Group Tour", category: "Group", price: 28900, status: "Rejected" },
  { id: 8, name: "Ladakh Adventure Trail", category: "Adventure", price: 36500, status: "Draft" },
];

const initialBookings = [
  { id: "BK-1024", customer: "Rahul Sharma", pkg: "Manali Adventure Tour", date: "25 Oct 2026", amount: 12500, status: "Confirmed" },
  { id: "BK-1025", customer: "Priya Patil", pkg: "Goa Beach Holiday", date: "28 Oct 2026", amount: 18000, status: "Pending" },
  { id: "BK-1026", customer: "Amit Verma", pkg: "Kashmir Family Trip", date: "02 Nov 2026", amount: 32000, status: "Confirmed" },
  { id: "BK-1027", customer: "Sneha Joshi", pkg: "Jaipur Heritage Tour", date: "05 Nov 2026", amount: 9500, status: "Cancelled" },
  { id: "BK-1028", customer: "Vikash Singh", pkg: "Kerala Backwaters", date: "08 Nov 2026", amount: 22000, status: "Confirmed" },
  { id: "BK-1029", customer: "Neha Kulkarni", pkg: "Goa Beach Holiday", date: "12 Nov 2026", amount: 36000, status: "Pending" },
  { id: "BK-1030", customer: "Rohan Gupta", pkg: "Goa Beach Holiday", date: "14 Nov 2026", amount: 18000, status: "Pending" },
  { id: "BK-1021", customer: "Kavita Rao", pkg: "Ladakh Adventure Trail", date: "02 Oct 2026", amount: 56000, status: "Completed" },
];

const transactions = [
  { id: "TX-9021", date: "18 Oct 2026", booking: "BK-1024", gross: 12500 },
  { id: "TX-9020", date: "15 Oct 2026", booking: "BK-1021", gross: 56000 },
  { id: "TX-9019", date: "11 Oct 2026", booking: "BK-1019", gross: 44000 },
  { id: "TX-9018", date: "04 Oct 2026", booking: "BK-1015", gross: 72500 },
];

const COMMISSION_RATE = 0.12;

const payouts = [
  { id: "PO-301", date: "20 Oct 2026", amount: 15000, status: "Pending Payout" },
  { id: "PO-300", date: "10 Oct 2026", amount: 10000, status: "Processing" },
  { id: "PO-299", date: "25 Sep 2026", amount: 131000, status: "Completed" },
];

const departures = [
  { pkg: "Manali Adventure Tour", time: "2:00 PM", guests: 12, kind: "mountain" },
  { pkg: "Kashmir Family Trip", time: "4:30 PM", guests: 8, kind: "mountain" },
  { pkg: "Goa Beach Holiday", time: "6:15 PM", guests: 5, kind: "beach" },
];

const notifications = [
  { id: 1, text: "New booking received (BK-1028)", time: "2 hours ago", bar: "bg-amber-400" },
  { id: 2, text: "Payment received (₹18,000)", time: "5 hours ago", bar: "bg-emerald-500" },
  { id: 3, text: "Package approved by admin", time: "1 day ago", bar: "bg-sky-500" },
];

/* Monthly data for the analytics charts */
const monthlyRevenue = [
  { month: "May", revenue: 42000, bookings: 12 },
  { month: "Jun", revenue: 58000, bookings: 17 },
  { month: "Jul", revenue: 49000, bookings: 14 },
  { month: "Aug", revenue: 76000, bookings: 23 },
  { month: "Sep", revenue: 65000, bookings: 19 },
  { month: "Oct", revenue: 125500, bookings: 31 },
];

const STATUS_STYLES = [
  { label: "Confirmed", color: "bg-emerald-500" },
  { label: "Pending", color: "bg-amber-400" },
  { label: "Completed", color: "bg-blue-500" },
  { label: "Cancelled", color: "bg-rose-500" },
];

/* Reports & Analytics sidebar items = tabs inside the dashboard */
const REPORT_TABS = [
  { key: "overview", label: "Analytics Overview" },
  { key: "sales", label: "Sales Report" },
  { key: "bookings", label: "Booking Analytics" },
  { key: "revenue", label: "Revenue Report" },
  { key: "packages", label: "Package Performance" },
  { key: "customers", label: "Customer Insights" },
];

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
}

function HeroScene() {
  return (
    <img
      src={dashboardTravel}
      alt="Scenic mountain lake travel destination"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
}

function Thumb({ kind }) {
  const image =
    kind === "beach" ? goaTour : kind === "kerala" ? heroImage : dashboardTravel;

  const label =
    kind === "beach" ? "Goa beach" : kind === "kerala" ? "Kerala destination" : "Mountain destination";

  return (
    <img
      src={image}
      alt={label}
      loading="lazy"
      className="h-14 w-16 shrink-0 rounded-lg object-cover"
    />
  );
}

function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          {Icon && <Icon size={19} className="text-teal-600" />}
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Advanced analytics components                                      */
/* ------------------------------------------------------------------ */

function RevenueTrendChart() {
  const [period, setPeriod] = useState("6 months");
  const chartData =
    period === "3 months" ? monthlyRevenue.slice(-3) : monthlyRevenue;
  const maxRevenue = Math.max(...chartData.map((item) => item.revenue));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        icon={TrendingUp}
        title="Revenue Trends"
        subtitle="Monthly gross revenue overview"
        action={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-teal-500"
            aria-label="Revenue chart period"
          >
            <option>6 months</option>
            <option>3 months</option>
          </select>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-5">
        <div>
          <p className="text-xs text-slate-500">Latest month</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {inr(chartData[chartData.length - 1].revenue)}
          </p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-3 py-2">
          <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <TrendingUp size={14} /> Growing trend
          </p>
          <p className="mt-1 text-[11px] text-emerald-600">Sample analytics data</p>
        </div>
      </div>

      <div className="flex h-48 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">
        {chartData.map((item) => {
          const height = Math.max((item.revenue / maxRevenue) * 100, 8);

          return (
            <div key={item.month} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
              <div className="mb-2 text-center text-[10px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
                {inr(item.revenue)}
              </div>
              <div className="flex flex-1 items-end justify-center">
                <div
                  title={`${item.month}: ${inr(item.revenue)}`}
                  className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-300 hover:from-teal-700 hover:to-teal-500"
                  style={{ height: `${height}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-slate-500">{item.month}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="h-2.5 w-2.5 rounded-sm bg-teal-500" />
        Gross revenue · illustrative monthly figures
      </div>
    </section>
  );
}

function BookingPerformanceChart({ bookings }) {
  const statusData = [
    { label: "Confirmed", color: "bg-emerald-500", text: "text-emerald-700" },
    { label: "Pending", color: "bg-amber-400", text: "text-amber-700" },
    { label: "Completed", color: "bg-blue-500", text: "text-blue-700" },
    { label: "Cancelled", color: "bg-rose-500", text: "text-rose-700" },
  ];

  const total = bookings.length || 1;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        icon={BarChart3}
        title="Booking Performance"
        subtitle="Current booking status breakdown"
      />

      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-[7px] border-teal-100">
          <span className="text-xl font-bold text-slate-900">{bookings.length}</span>
          <span className="text-[10px] text-slate-500">Bookings</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">Booking overview</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Review confirmations, pending requests and completed trips.
          </p>
        </div>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
        {statusData.map((item) => {
          const count = bookings.filter((b) => b.status === item.label).length;
          return count > 0 ? (
            <div
              key={item.label}
              title={`${item.label}: ${count}`}
              className={`${item.color} transition-all`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          ) : null;
        })}
      </div>

      <div className="mt-5 space-y-4">
        {statusData.map((item) => {
          const count = bookings.filter((b) => b.status === item.label).length;
          const percentage = Math.round((count / total) * 100);

          return (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  {item.label}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {count} ({percentage}%)
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TopPackages({ bookings }) {
  const packagePerformance = packages
    .map((pkg) => {
      const matchingBookings = bookings.filter(
        (booking) => booking.pkg === pkg.name
      );
      const revenue = matchingBookings.reduce(
        (sum, booking) => sum + booking.amount,
        0
      );

      return {
        ...pkg,
        bookingCount: matchingBookings.length,
        revenue,
      };
    })
    .filter((pkg) => pkg.bookingCount > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const maxRevenue = Math.max(
    1,
    ...packagePerformance.map((pkg) => pkg.revenue)
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        icon={Star}
        title="Top Performing Packages"
        subtitle="Ranked by booking value in the current sample data"
        action={
          <Link
            to="/vendor/packages"
            className="text-xs font-semibold text-teal-700 hover:underline"
          >
            All packages
          </Link>
        }
      />

      {packagePerformance.length === 0 ? (
        <EmptyState title="No package bookings yet" />
      ) : (
        <div className="space-y-5">
          {packagePerformance.map((pkg, index) => (
            <div key={pkg.id} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {pkg.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {pkg.bookingCount} booking{pkg.bookingCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                    {inr(pkg.revenue)}
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${(pkg.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reports & Analytics hub (sidebar items shown as tabs)               */
/* ------------------------------------------------------------------ */

function MiniStat({ icon: Icon, label, value, note, box }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${box}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-xl font-bold text-slate-900">{value}</p>
        {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      </div>
    </div>
  );
}

function MiniBars({ data, valueKey, format }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));

  return (
    <div className="flex h-52 items-end gap-3 border-b border-slate-100 pb-2 sm:gap-5">
      {data.map((item) => {
        const height = Math.max((item[valueKey] / max) * 100, 8);
        return (
          <div key={item.month} className="group flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="mb-2 text-center text-[10px] font-medium text-slate-500 opacity-0 transition group-hover:opacity-100">
              {format(item[valueKey])}
            </div>
            <div className="flex flex-1 items-end justify-center">
              <div
                title={`${item.month}: ${format(item[valueKey])}`}
                className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-teal-600 to-teal-400 transition-all duration-300 hover:from-teal-700 hover:to-teal-500"
                style={{ height: `${height}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-slate-500">{item.month}</p>
          </div>
        );
      })}
    </div>
  );
}

function StatusBars({ bookings }) {
  const total = bookings.length || 1;

  return (
    <div className="space-y-4">
      {STATUS_STYLES.map((s) => {
        const count = bookings.filter((b) => b.status === s.label).length;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={s.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                {s.label}
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${s.color}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReportsHub({ bookings }) {
  const [params, setParams] = useSearchParams();
  const sectionRef = useRef(null);

  const requested = params.get("report");
  const active =
    REPORT_TABS.find((tab) => tab.key === requested) || REPORT_TABS[0];

  /* Sidebar link like /vendor?report=sales opens this section directly */
  useEffect(() => {
    if (requested && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [requested]);

  const selectTab = (label) => {
    const tab = REPORT_TABS.find((t) => t.label === label);
    if (tab) setParams({ report: tab.key }, { replace: true });
  };

  const gross = transactions.reduce((sum, t) => sum + t.gross, 0);
  const commission = Math.round(gross * COMMISSION_RATE);

  const customerRows = Object.values(
    bookings.reduce((acc, b) => {
      acc[b.customer] = acc[b.customer] || { name: b.customer, count: 0, spent: 0 };
      acc[b.customer].count += 1;
      acc[b.customer].spent += b.amount;
      return acc;
    }, {})
  ).sort((a, b) => b.spent - a.spent);

  const packageRows = Object.values(
    bookings.reduce((acc, b) => {
      acc[b.pkg] = acc[b.pkg] || { name: b.pkg, count: 0, revenue: 0 };
      acc[b.pkg].count += 1;
      acc[b.pkg].revenue += b.amount;
      return acc;
    }, {})
  ).sort((a, b) => b.revenue - a.revenue);

  const maxPackageRevenue = Math.max(1, ...packageRows.map((r) => r.revenue));

  const views = {
    overview: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat icon={Wallet} label="Total Revenue" value={inr(gross)} note="From listed transactions" box="bg-violet-50 text-violet-600" />
          <MiniStat icon={CalendarCheck} label="Total Bookings" value={bookings.length} note="All statuses" box="bg-emerald-50 text-emerald-600" />
          <MiniStat icon={Users} label="Customers" value={customerRows.length} note="Unique customers" box="bg-blue-50 text-blue-600" />
          <MiniStat
            icon={Target}
            label="Avg. Booking Value"
            value={inr(Math.round(bookings.reduce((s, b) => s + b.amount, 0) / (bookings.length || 1)))}
            note="Per booking"
            box="bg-amber-50 text-amber-600"
          />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Revenue trend</p>
            <MiniBars data={monthlyRevenue} valueKey="revenue" format={inr} />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Booking status</p>
            <StatusBars bookings={bookings} />
          </div>
        </div>
      </div>
    ),

    sales: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MiniStat icon={TrendingUp} label="6-month Sales" value={inr(monthlyRevenue.reduce((s, m) => s + m.revenue, 0))} box="bg-teal-50 text-teal-600" />
          <MiniStat icon={BarChart3} label="Best Month" value="Oct" note={inr(125500)} box="bg-violet-50 text-violet-600" />
          <MiniStat icon={CalendarCheck} label="Bookings (6 months)" value={monthlyRevenue.reduce((s, m) => s + m.bookings, 0)} box="bg-blue-50 text-blue-600" />
        </div>
        <MiniBars data={monthlyRevenue} valueKey="revenue" format={inr} />
        <Table columns={["Transaction", "Date", "Booking", "Amount"]}>
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <Td className="font-semibold text-slate-900">{t.id}</Td>
              <Td>{t.date}</Td>
              <Td>{t.booking}</Td>
              <Td>{inr(t.gross)}</Td>
            </tr>
          ))}
        </Table>
      </div>
    ),

    bookings: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Bookings per month</p>
            <MiniBars data={monthlyRevenue} valueKey="bookings" format={(v) => `${v} bookings`} />
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-800">Status breakdown</p>
            <StatusBars bookings={bookings} />
          </div>
        </div>
        <Table columns={["Booking ID", "Customer", "Package", "Travel date", "Amount", "Status"]}>
          {bookings.map((b) => (
            <tr key={b.id} className="hover:bg-slate-50">
              <Td className="font-semibold text-slate-900">{b.id}</Td>
              <Td className="whitespace-nowrap">{b.customer}</Td>
              <Td className="whitespace-nowrap">{b.pkg}</Td>
              <Td className="whitespace-nowrap">{b.date}</Td>
              <Td>{inr(b.amount)}</Td>
              <Td><StatusBadge status={b.status} /></Td>
            </tr>
          ))}
        </Table>
      </div>
    ),

    revenue: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MiniStat icon={Wallet} label="Gross sales" value={inr(gross)} box="bg-violet-50 text-violet-600" />
          <MiniStat icon={BarChart3} label="Commission (12%)" value={inr(commission)} box="bg-rose-50 text-rose-600" />
          <MiniStat icon={TrendingUp} label="Net earnings" value={inr(gross - commission)} box="bg-emerald-50 text-emerald-600" />
        </div>
        <Table columns={["Transaction", "Date", "Booking", "Gross", "Commission", "Net"]}>
          {transactions.map((t) => {
            const c = Math.round(t.gross * COMMISSION_RATE);
            return (
              <tr key={t.id} className="hover:bg-slate-50">
                <Td className="font-semibold text-slate-900">{t.id}</Td>
                <Td>{t.date}</Td>
                <Td>{t.booking}</Td>
                <Td>{inr(t.gross)}</Td>
                <Td>{inr(c)}</Td>
                <Td className="font-semibold text-slate-900">{inr(t.gross - c)}</Td>
              </tr>
            );
          })}
        </Table>
      </div>
    ),

    packages:
      packageRows.length === 0 ? (
        <EmptyState title="No package bookings yet" />
      ) : (
        <div className="space-y-5">
          {packageRows.map((r, i) => (
            <div key={r.name} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {r.count} booking{r.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-bold text-slate-900">{inr(r.revenue)}</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${(r.revenue / maxPackageRevenue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),

    customers: (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MiniStat icon={Users} label="Total Customers" value={customerRows.length} box="bg-blue-50 text-blue-600" />
          <MiniStat icon={Star} label="Top Customer" value={customerRows[0]?.name || "-"} note={customerRows[0] ? inr(customerRows[0].spent) : ""} box="bg-amber-50 text-amber-600" />
          <MiniStat
            icon={Wallet}
            label="Avg. Spend / Customer"
            value={inr(Math.round(customerRows.reduce((s, r) => s + r.spent, 0) / (customerRows.length || 1)))}
            box="bg-violet-50 text-violet-600"
          />
        </div>
        <Table columns={["Customer", "Bookings", "Total spent"]}>
          {customerRows.map((r) => (
            <tr key={r.name} className="hover:bg-slate-50">
              <Td className="font-semibold text-slate-900">{r.name}</Td>
              <Td>{r.count}</Td>
              <Td>{inr(r.spent)}</Td>
            </tr>
          ))}
        </Table>
      </div>
    ),
  };

  return (
    <section
      id="reports-section"
      ref={sectionRef}
      className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <SectionHeading
        icon={BarChart3}
        title="Reports & Analytics"
        subtitle={active.label}
      />

      <div className="space-y-5">
        <Tabs
          tabs={REPORT_TABS.map((t) => t.label)}
          value={active.label}
          onChange={selectTab}
        />
        {views[active.key]}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Detail panels                                                       */
/* ------------------------------------------------------------------ */

function PackagesPanel() {
  const [filter, setFilter] = useState("All");
  const list = packages.filter(
    (pkg) => filter === "All" || pkg.status === filter
  );

  return (
    <div className="space-y-4">
      <Tabs
        tabs={["All", "Published", "Pending Approval", "Rejected", "Draft"]}
        value={filter}
        onChange={setFilter}
      />

      <Table
        columns={["Package", "Category", "Price / person", "Approval status"]}
        empty={
          list.length === 0 && <EmptyState title="No packages in this status" />
        }
      >
        {list.map((pkg) => (
          <tr key={pkg.id} className="hover:bg-slate-50">
            <Td className="font-semibold text-slate-900">{pkg.name}</Td>
            <Td>{pkg.category}</Td>
            <Td>{inr(pkg.price)}</Td>
            <Td><StatusBadge status={pkg.status} /></Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function UpcomingPanel({ list }) {
  if (list.length === 0) return <EmptyState title="No upcoming bookings" />;

  return (
    <Table columns={["Booking", "Customer", "Package", "Travel date", "Amount"]}>
      {list.map((booking) => (
        <tr key={booking.id} className="hover:bg-slate-50">
          <Td className="font-semibold text-slate-900">{booking.id}</Td>
          <Td>{booking.customer}</Td>
          <Td>{booking.pkg}</Td>
          <Td>{booking.date}</Td>
          <Td>{inr(booking.amount)}</Td>
        </tr>
      ))}
    </Table>
  );
}

function PayoutsPanel() {
  return (
    <Table columns={["Payout", "Date", "Amount", "Status"]}>
      {payouts.map((payout) => (
        <tr key={payout.id} className="hover:bg-slate-50">
          <Td className="font-semibold text-slate-900">{payout.id}</Td>
          <Td>{payout.date}</Td>
          <Td>{inr(payout.amount)}</Td>
          <Td><StatusBadge status={payout.status} /></Td>
        </tr>
      ))}
    </Table>
  );
}

function RevenuePanel({ total }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Gross sales", inr(total)],
          ["Commission (12%)", inr(Math.round(total * COMMISSION_RATE))],
          ["Net earnings", inr(total - Math.round(total * COMMISSION_RATE))],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-0.5 text-lg font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <Table columns={["Transaction", "Date", "Booking", "Gross", "Commission", "Net"]}>
        {transactions.map((transaction) => {
          const commission = Math.round(transaction.gross * COMMISSION_RATE);

          return (
            <tr key={transaction.id} className="hover:bg-slate-50">
              <Td className="font-semibold text-slate-900">{transaction.id}</Td>
              <Td>{transaction.date}</Td>
              <Td>{transaction.booking}</Td>
              <Td>{inr(transaction.gross)}</Td>
              <Td>{inr(commission)}</Td>
              <Td className="font-semibold text-slate-900">
                {inr(transaction.gross - commission)}
              </Td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard page                                                      */
/* ------------------------------------------------------------------ */

export default function VendorDashboard() {
  const [bookings, setBookings] = useState(initialBookings);
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [, setParams] = useSearchParams();
  const panelRef = useRef(null);

  useEffect(() => {
    if (selected && panelRef.current) {
      panelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selected]);

  useEffect(() => {
    if (!menu) return;

    const close = (event) => {
      if (
        event.type === "mousedown" &&
        event.target.closest("[data-row-menu]")
      ) {
        return;
      }
      setMenu(null);
    };

    const esc = (event) => {
      if (event.key === "Escape") setMenu(null);
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const setStatus = (id, status) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking
      )
    );
    setMenu(null);
  };

  const upcoming = bookings.filter((b) => b.status === "Confirmed");
  const pending = bookings.filter((b) => b.status === "Pending");

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      bookingFilter === "All" || booking.status === bookingFilter;

    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      booking.id.toLowerCase().includes(search) ||
      booking.customer.toLowerCase().includes(search) ||
      booking.pkg.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });

  const recent = showAllBookings
    ? filteredBookings
    : filteredBookings.slice(0, 5);

  const menuBooking = menu && bookings.find((b) => b.id === menu.id);

  const pendingPayouts = payouts.filter(
    (payout) => payout.status !== "Completed"
  );
  const pendingAmount = pendingPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );
  const revenue = transactions.reduce(
    (sum, transaction) => sum + transaction.gross,
    0
  );

  const totalCustomers = new Set(bookings.map((booking) => booking.customer)).size;
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "Confirmed" || booking.status === "Completed"
  ).length;
  const conversionRate = bookings.length
    ? Math.round((confirmedCount / bookings.length) * 100)
    : 0;
  const averageBooking = bookings.length
    ? Math.round(
        bookings.reduce((sum, booking) => sum + booking.amount, 0) /
          bookings.length
      )
    : 0;

  const pendingByPkg = pending.reduce((acc, booking) => {
    acc[booking.pkg] = (acc[booking.pkg] || 0) + 1;
    return acc;
  }, {});

  const topPending = Object.entries(pendingByPkg).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const stats = [
    {
      key: "packages",
      label: "Total Packages",
      value: packages.length,
      note: "Across all package statuses",
      tone: "up",
      icon: Map,
      card: "from-sky-50 border-sky-100",
      box: "bg-sky-100 text-sky-600",
    },
    {
      key: "upcoming",
      label: "Upcoming Bookings",
      value: upcoming.length,
      note: `${pending.length} waiting for confirmation`,
      tone: "up",
      icon: CalendarCheck,
      card: "from-emerald-50 border-emerald-100",
      box: "bg-emerald-100 text-emerald-600",
    },
    {
      key: "payouts",
      label: "Pending Payouts",
      value: inr(pendingAmount),
      note: `${pendingPayouts.length} payouts in progress`,
      tone: "warn",
      icon: Wallet,
      card: "from-amber-50 border-amber-100",
      box: "bg-amber-100 text-amber-600",
    },
    {
      key: "revenue",
      label: "Total Revenue",
      value: inr(revenue),
      note: "From listed transactions",
      tone: "up",
      icon: TrendingUp,
      card: "from-violet-50 border-violet-100",
      box: "bg-violet-100 text-violet-600",
    },
  ];

  const panels = {
    packages: {
      title: "Packages and approval status",
      link: ["/vendor/packages", "Manage packages"],
      body: <PackagesPanel />,
    },
    upcoming: {
      title: "Upcoming bookings",
      link: ["/vendor/bookings", "Open bookings"],
      body: <UpcomingPanel list={upcoming} />,
    },
    payouts: {
      title: "Payouts",
      link: ["/vendor/earnings", "Earnings & payouts"],
      body: <PayoutsPanel />,
    },
    revenue: {
      title: "Revenue breakdown",
      link: ["/vendor/earnings", "Earnings & payouts"],
      body: <RevenuePanel total={revenue} />,
    },
  };

  const panel = selected && panels[selected];

  const quickActions = [
    {
      to: "/vendor/packages/new",
      title: "Add New Package",
      sub: "Create a new tour package",
      icon: PlusCircle,
      box: "bg-teal-500",
    },
    {
      to: "/vendor/bookings",
      title: "View Bookings",
      sub: "Manage your bookings",
      icon: CalendarDays,
      box: "bg-blue-600",
    },
    {
      to: "/vendor/earnings",
      title: "View Earnings",
      sub: "Check your payouts",
      icon: Wallet,
      box: "bg-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative isolate min-h-[230px] overflow-hidden rounded-3xl border border-sky-100 bg-sky-50 sm:min-h-[250px]">
        <HeroScene />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/10" />

        <div className="relative z-10 flex min-h-[230px] items-center px-6 py-8 sm:min-h-[250px] sm:px-10 lg:px-12">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {greeting()},
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Welcome back, Travel Vendor!
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              Here's an overview of your travel business performance.
            </p>
            <button
              type="button"
              onClick={() => setParams({ report: "overview" }, { replace: true })}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              View analytics <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Main statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ key, label, value, note, tone, icon: Icon, card, box }) => {
          const active = selected === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected((current) => current === key ? null : key)}
              aria-pressed={active}
              aria-controls="dashboard-detail"
              className={`rounded-2xl border bg-gradient-to-br to-white p-5 text-left shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${card} ${active ? "ring-2 ring-teal-500" : "hover:shadow-md"}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${box}`}>
                <Icon size={22} />
              </div>
              <p className="mt-4 text-sm text-slate-600">{label}</p>
              <p className="mt-1 break-words text-2xl font-bold text-slate-900 sm:text-3xl">
                {value}
              </p>
              <p className={`mt-2 flex items-center gap-1.5 text-xs ${tone === "up" ? "text-emerald-600" : "text-amber-600"}`}>
                {tone === "up" ? <TrendingUp size={15} /> : <Clock size={15} />}
                {note}
              </p>
            </button>
          );
        })}
      </div>

      {/* Advanced business metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={23} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Customers</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{totalCustomers}</p>
            <p className="mt-1 text-xs text-slate-500">Unique customers in bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Target size={23} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Confirmation Rate</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{conversionRate}%</p>
            <p className="mt-1 text-xs text-slate-500">Confirmed and completed bookings</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Wallet size={23} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Average Booking Value</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inr(averageBooking)}</p>
            <p className="mt-1 text-xs text-slate-500">Average amount per booking</p>
          </div>
        </div>
      </div>

      {/* Clickable statistic details */}
      <div id="dashboard-detail" ref={panelRef}>
        {panel && (
          <Card
            title={panel.title}
            action={
              <div className="flex items-center gap-3">
                <Link to={panel.link[0]} className="text-sm font-semibold text-teal-700 hover:underline">
                  {panel.link[1]}
                </Link>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            }
          >
            {panel.body}
          </Card>
        )}
      </div>

      {/* Analytics charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueTrendChart />
        <BookingPerformanceChart bookings={bookings} />
      </div>

      {/* Top package performance */}
      <TopPackages bookings={bookings} />

      {/* Reports & Analytics (Overview, Sales, Booking, Revenue, Package, Customer) */}
      <ReportsHub bookings={bookings} />

      {/* Booking table and side widgets */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <CalendarDays size={21} className="text-teal-600" />
                Recent Bookings
              </h2>
              <Link
                to="/vendor/bookings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>

            {/* Booking search and status filter */}
            <div className="flex flex-col gap-3 border-y border-slate-100 bg-slate-50/70 p-4 sm:flex-row">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID, customer or package..."
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                aria-label="Filter bookings by status"
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <Table
              columns={["Booking ID", "Customer", "Package Name", "Travel Date", "Amount", "Status", ""]}
              empty={
                recent.length === 0 && (
                  <EmptyState title="No bookings match your search" />
                )
              }
            >
              {recent.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <Td className="font-semibold text-slate-900">{booking.id}</Td>
                  <Td className="whitespace-nowrap">{booking.customer}</Td>
                  <Td className="whitespace-nowrap">{booking.pkg}</Td>
                  <Td className="whitespace-nowrap">{booking.date}</Td>
                  <Td className="whitespace-nowrap">{inr(booking.amount)}</Td>
                  <Td><StatusBadge status={booking.status} /></Td>
                  <Td>
                    <button
                      type="button"
                      data-row-menu
                      aria-label={`Actions for ${booking.id}`}
                      aria-haspopup="menu"
                      aria-expanded={menu?.id === booking.id}
                      onClick={(event) => {
                        if (menu?.id === booking.id) {
                          setMenu(null);
                          return;
                        }

                        const rect = event.currentTarget.getBoundingClientRect();
                        setMenu({
                          id: booking.id,
                          top: Math.min(rect.bottom + 4, window.innerHeight - 190),
                          right: Math.max(8, window.innerWidth - rect.right),
                        });
                      }}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </Td>
                </tr>
              ))}
            </Table>

            {filteredBookings.length > 5 && (
              <div className="border-t border-slate-100 p-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowAllBookings((current) => !current)}
                  className="text-sm font-semibold text-teal-700 hover:underline"
                >
                  {showAllBookings ? "Show fewer bookings" : `Show all ${filteredBookings.length} bookings`}
                </button>
              </div>
            )}
          </section>

          {/* Departures, pending bookings and notifications */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Plane size={18} className="text-teal-600" />
                  Today's Departures
                </h2>
                <span className="text-xs text-slate-500">{departures.length} trips</span>
              </div>

              <ul className="mt-4 space-y-3">
                {departures.slice(0, 2).map((departure) => (
                  <li key={departure.pkg}>
                    <Link
                      to="/vendor/trips"
                      className="flex items-center gap-3 rounded-lg p-1 transition hover:bg-slate-50"
                    >
                      <Thumb kind={departure.kind} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{departure.pkg}</p>
                        <p className="text-xs text-slate-500">
                          {departure.time} · {departure.guests} Guests
                        </p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-slate-400" />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link to="/vendor/trips" className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline">
                View all trips
              </Link>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock size={18} className="text-teal-600" />
                  Pending Bookings
                </h2>
                <span className="text-xs text-slate-500">{pending.length} bookings</span>
              </div>

              {topPending ? (
                <Link
                  to="/vendor/bookings"
                  className="mt-4 flex items-center gap-3 rounded-lg p-1 transition hover:bg-slate-50"
                >
                  <Thumb kind="beach" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{topPending[0]}</p>
                    <p className="text-xs text-slate-500">
                      {topPending[1]} waiting for confirmation
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-slate-400" />
                </Link>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No bookings waiting for you.</p>
              )}

              <Link to="/vendor/bookings" className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline">
                Manage pending
              </Link>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Bell size={18} className="text-teal-600" />
                  Notifications
                </h2>
                <Link to="/vendor/notifications" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              <ul className="mt-4 space-y-3">
                {notifications.map((notification) => (
                  <li key={notification.id} className="flex gap-3">
                    <span className={`w-1 shrink-0 rounded-full ${notification.bar}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-800">{notification.text}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{notification.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Quick actions and extra information */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-teal-50/60 to-white p-5 shadow-sm">
            <h2 className="flex items-center gap-3 text-base font-semibold text-slate-900">
              <Zap size={22} className="text-teal-600" />
              Quick Actions
            </h2>

            <ul className="mt-4 space-y-3">
              {quickActions.map(({ to, title, sub, icon: Icon, box }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-teal-300 hover:shadow-sm"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${box}`}>
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{title}</span>
                      <span className="block text-xs text-slate-500">{sub}</span>
                    </span>
                    <ChevronRight size={18} className="shrink-0 text-slate-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Pending tasks */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeading
              icon={Target}
              title="Business Checklist"
              subtitle="Recommended next steps"
            />

            <div className="space-y-4">
              <Link to="/vendor/packages" className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <Clock size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">Review pending packages</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {packages.filter((pkg) => pkg.status === "Pending Approval").length} package waiting for approval
                  </span>
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>

              <Link to="/vendor/bookings" className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <CalendarCheck size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">Respond to booking requests</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {pending.length} booking requests need attention
                  </span>
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>

              <Link to="/vendor/earnings" className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                  <Wallet size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">Track pending payouts</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {inr(pendingAmount)} awaiting completion
                  </span>
                </span>
                <ChevronRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </section>

          {/* Commission summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeading
              icon={Wallet}
              title="Earnings Summary"
              subtitle="Based on listed transactions"
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Gross revenue</span>
                <span className="text-sm font-semibold text-slate-900">{inr(revenue)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">Platform commission (12%)</span>
                <span className="text-sm font-semibold text-rose-600">
                  −{inr(Math.round(revenue * COMMISSION_RATE))}
                </span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-4">
                <p className="text-xs text-slate-500">Estimated net earnings</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {inr(revenue - Math.round(revenue * COMMISSION_RATE))}
                </p>
              </div>
              <Link
                to="/vendor/earnings"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
              >
                View earnings details <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Booking row action menu */}
      {menu && menuBooking && (
        <div
          data-row-menu
          role="menu"
          style={{ top: menu.top, right: menu.right }}
          className="fixed z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
        >
          <Link
            to={`/vendor/bookings?search=${menuBooking.id}`}
            role="menuitem"
            onClick={() => setMenu(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={15} /> View details
          </Link>

          {menuBooking.status === "Pending" && (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => setStatus(menuBooking.id, "Confirmed")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
              >
                <Check size={15} /> Accept booking
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => setStatus(menuBooking.id, "Cancelled")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <X size={15} /> Reject booking
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}