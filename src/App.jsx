import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import VendorSidebar from "./components/vendor/VendorSidebar";
import VendorNavbar from "./components/vendor/VendorNavbar";

import VendorDashboard from "./pages/vendor/VendorDashboard";
import BusinessProfile from "./pages/vendor/BusinessProfile";
import MyPackages from "./pages/vendor/MyPackages";
import PackageDetails from "./pages/vendor/PackageDetails";
import AddPackage from "./pages/vendor/AddPackage";

// Add Package page import when your form component is ready.
// import AddEditPackage from "./pages/vendor/AddEditPackage";

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

const placeholders = [
  // Do not add "packages" here because it has a real page.
  // Do not add "packages/:id" here because it has a real page.
  ["availability", "Pricing & Availability"],
  ["bookings", "Bookings"],
  ["trips", "Trips & Departures"],
  ["earnings", "Earnings & Payouts"],
  ["reports", "Analytics Overview"],
  ["reports/sales", "Sales Report"],
  ["reports/bookings", "Booking Analytics"],
  ["reports/revenue", "Revenue Report"],
  ["reports/packages", "Package Performance"],
  ["reports/customers", "Customer Insights"],
  ["reviews", "Reviews & Ratings"],
  ["notifications", "Notifications"],
  ["support", "Support"],
  ["settings", "Security & Settings"],
];

function VendorApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close mobile sidebar when the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close mobile sidebar with the Escape key.
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

  return (
    <div className="flex min-h-dvh bg-slate-100">
      {/* Desktop Sidebar */}
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <VendorSidebar />
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

            {/* My Packages */}
            <Route path="packages" element={<MyPackages />} />

            {/* Package Details */}
            <Route path="packages/:id" element={<PackageDetails />} />

            {/* My Packages */}
            <Route path="packages" element={<MyPackages />} />

            {/* Add New Package */}
            <Route path="packages/new" element={<AddPackage />} />

            {/* Package Details */}
            <Route path="packages/:id" element={<PackageDetails />} />
            {/* Other Vendor Modules */}
            {placeholders.map(([path, title]) => (
              <Route
                key={path}
                path={path}
                element={<VendorPlaceholder title={title} />}
              />
            ))}

            {/* Invalid Vendor Route - Keep Last */}
            <Route path="*" element={<Navigate to="/vendor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/vendor" replace />} />

        <Route path="/vendor/*" element={<VendorApp />} />

        <Route path="*" element={<Navigate to="/vendor" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
