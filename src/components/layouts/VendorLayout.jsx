import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search } from "lucide-react";

import VendorSidebar from "./VendorSidebar"; // path adjust kara

/* Route -> page title */
const pageTitles = [
  { path: "/vendor/business-profile", title: "Business Profile" },
  { path: "/vendor/packages/new", title: "Add New Package" },
  { path: "/vendor/packages", title: "My Packages" },
  { path: "/vendor/calendar", title: "Availability Calendar" },
  { path: "/vendor/bookings", title: "Bookings" },
  { path: "/vendor/trips", title: "Trips & Departures" },
  { path: "/vendor/earnings", title: "Earnings & Payouts" },
  { path: "/vendor/reports", title: "Reports & Analytics" },
  { path: "/vendor/reviews", title: "Reviews & Ratings" },
  { path: "/vendor/notifications", title: "Notifications" },
  { path: "/vendor/support", title: "Support" },
  { path: "/vendor/settings", title: "Security & Settings" },
];

function getPageTitle(pathname) {
  const match = pageTitles.find(
    (p) => pathname === p.path || pathname.startsWith(p.path + "/"),
  );
  return match ? match.title : "Dashboard";
}

/* Top bar */
function TopBar({ vendor, notificationCount, onMenuClick, onLogout }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initial = vendor.name.trim().charAt(0).toUpperCase() || "V";

  // Dropdown baher click kela ki band kara
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      {/* Breadcrumb + title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="text-slate-400">Vendor Portal</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-violet-600">Management</span>
        </div>
        <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
          {getPageTitle(pathname)}
        </h1>
      </div>

      {/* Search */}
      <div className="relative hidden w-72 md:block lg:w-96">
        <Search
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          placeholder="Search bookings..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      {/* Notifications */}
      <button
        type="button"
        onClick={() => navigate("/vendor/notifications")}
        aria-label="Notifications"
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
      >
        <Bell size={20} />
        {notificationCount > 0 && (
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>

      <div className="hidden h-10 w-px bg-slate-200 sm:block" />

      {/* Profile dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-slate-50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-bold text-violet-700 ring-1 ring-violet-200">
            {initial}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-slate-900">
              {vendor.name}
            </p>
            <p className="text-xs text-slate-500">{vendor.accountType}</p>
          </div>

          <ChevronDown
            size={16}
            className={`hidden text-slate-400 transition-transform sm:block ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/vendor/business-profile");
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Business Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/vendor/settings");
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Security & Settings
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

/* Layout */
export default function VendorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // TODO: real data ithe ghala (API / context)
  const vendor = {
    name: "Travel Vendor",
    accountType: "Business Account",
    verified: true,
  };
  const badges = { bookings: 0, notifications: 1 };

  const handleLogout = () => {
    // TODO: tumcha logout logic (clear token, etc.)
    navigate("/login");
  };

  // Route badalla ki mobile drawer band kara
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Drawer ughada asel tevha background scroll band kara
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Esc dabla ki drawer band kara
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      {/* Desktop sidebar: full height, topbar chya khali nahi, bajula */}
      <div className="hidden lg:block">
        <VendorSidebar
          vendor={vendor}
          badges={badges}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-y-0 left-0 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <VendorSidebar
            vendor={vendor}
            badges={badges}
            onLogout={handleLogout}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </div>

      {/* Right side: topbar + page content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          vendor={vendor}
          notificationCount={badges.notifications}
          onMenuClick={() => setMobileOpen(true)}
          onLogout={handleLogout}
        />

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}