import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import VendorSidebar from "./components/vendor/VendorSidebar";
import VendorNavbar from "./components/vendor/VendorNavbar";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import BusinessProfile from "./pages/vendor/BusinessProfile";
import MyPackages from "./pages/vendor/MyPackages";
import PackageDetails from "./pages/vendor/PackageDetails";
import AddPackage from "./pages/vendor/AddPackage";
import VendorCalendar from "./pages/vendor/VendorCalendar";
import Booking, { BookingDetailsPage } from "./pages/vendor/Booking";
import TripsDepartures from "./pages/vendor/TripsDepartures";
import TripDepartureDetails from "./pages/vendor/TripDepartureDetails";
import EarningsPayouts from "./pages/vendor/EarningsPayouts";
import PayoutDetails from "./pages/vendor/PayoutDetails";
import AuthPage from "./pages/auth/AuthPage";
import {
  hasLocalVendorSession,
  signOutLocalVendor,
} from "./utils/localVendorAuth";
import ReviewsRatings from "./pages/vendor/ReviewsRatings";
import VendorNotifications from "./pages/vendor/VendorNotifications";
import SupportDashboard from "./pages/vendor/support/SupportDashboard";
import CreateTicket from "./pages/vendor/support/CreateTicket";
import MyTickets from "./pages/vendor/support/MyTickets";
import TicketDetails from "./pages/vendor/support/TicketDetails";
import HelpCenter from "./pages/vendor/support/HelpCenter";

import SecuritySettings from "./pages/vendor/SecuritySettings";
import ReportsAnalytics from "./pages/vendor/Reports & Analytics/ReportsAnalytics";

function VendorPlaceholder({ title }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-2 text-sm text-slate-500">
        Vendor Portal / Management
      </div>

      <h2 className="text-xl font-bold text-slate-900">{title}</h2>

      <p className="mt-2 text-sm text-slate-500">
        This module will be developed next.
      </p>
    </div>
  );
}

const placeholders = [["settings", "Security & Settings"]];

function VendorApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    signOutLocalVendor();
    navigate("/login", { replace: true });
  }

  // Close mobile sidebar and scroll to top when the route changes.
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  // Close mobile sidebar with Escape.
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-dvh bg-slate-100">
      {/* Desktop Sidebar */}
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <VendorSidebar onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 h-full w-full bg-slate-950/60"
          />

          <div className="relative z-10 h-full w-72 max-w-[85vw]">
            <VendorSidebar
              onNavigate={() => setSidebarOpen(false)}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex min-w-0 flex-1 flex-col">
        <VendorNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* Dashboard */}
            <Route index element={<VendorDashboard />} />
            {/* Business Profile */}
            <Route path="business-profile" element={<BusinessProfile />} />
            {/* Packages */}
            <Route path="packages" element={<MyPackages />} />
            <Route path="packages/new" element={<AddPackage />} />
            <Route path="packages/:id" element={<PackageDetails />} />
            {/* Calendar & Availability */}
            <Route path="calendar" element={<VendorCalendar />} />
            {/* Bookings */}
            <Route
              path="bookings/:bookingId"
              element={<BookingDetailsPage />}
            />
            <Route path="bookings" element={<Booking />} />
            <Route
              path="booking"
              element={<Navigate to="/vendor/bookings" replace />}
            />
            {/* Trips & Departures */}
            <Route path="trips" element={<TripsDepartures />} />
            <Route path="trips/:id" element={<TripDepartureDetails />} />
            {/* Earnings & Payouts */}
            <Route path="earnings" element={<EarningsPayouts />} />
            <Route path="earnings/:id" element={<PayoutDetails />} />
            <Route path="reviews" element={<ReviewsRatings />} />
            <Route path="notifications" element={<VendorNotifications />} />
            {/* Support */}
            <Route path="support" element={<SupportDashboard />} />
            <Route path="support/create" element={<CreateTicket />} />
            <Route path="support/tickets" element={<MyTickets />} />
            <Route
              path="support/tickets/:ticketId"
              element={<TicketDetails />}
            />
            <Route path="support/help" element={<HelpCenter />} />
            <Route path="settings" element={<SecuritySettings />} />
            {/* Reports & Analytics submodules */}
            <Route
              path="reports"
              element={<ReportsAnalytics section="overview" />}
            />
            <Route
              path="reports/sales"
              element={<ReportsAnalytics section="sales" />}
            />
            <Route
              path="reports/bookings"
              element={<ReportsAnalytics section="booking-reports" />}
            />
            <Route
              path="reports/revenue"
              element={<ReportsAnalytics section="earnings" />}
            />
            <Route
              path="reports/packages"
              element={<ReportsAnalytics section="packages" />}
            />
            <Route
              path="reports/customers"
              element={<ReportsAnalytics section="customers" />}
            />
            {/* Other Vendor Modules */}
            {placeholders.map(([path, title]) => (
              <Route
                key={path}
                path={path}
                element={<VendorPlaceholder title={title} />}
              />
            ))}
            {/* Invalid Vendor Route */}
            <Route path="*" element={<Navigate to="/vendor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireVendorAuth() {
  const location = useLocation();

  return hasLocalVendorSession() ? (
    <VendorApp />
  ) : (
    <Navigate to="/login" replace state={{ from: location.pathname }} />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Vendor Panel */}
        <Route path="/vendor/*" element={<RequireVendorAuth />} />

        {/* Invalid Route */}
        <Route path="*" element={<Navigate to="/vendor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
