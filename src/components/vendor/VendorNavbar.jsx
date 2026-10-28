import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  UserRound,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const pageTitles = {
  "/vendor": "Dashboard",
  "/vendor/business-profile": "Business Profile",
  "/vendor/verification": "Verification / KYC",
  "/vendor/packages": "My Packages",
  "/vendor/packages/new": "Add New Package",
  "/vendor/availability": "Pricing & Availability",
  "/vendor/bookings": "Bookings",
  "/vendor/trips": "Trips & Departures",
  "/vendor/earnings": "Earnings & Payouts",
  "/vendor/reviews": "Reviews & Ratings",
  "/vendor/notifications": "Notifications",
  "/vendor/support": "Support",
  "/vendor/settings": "Security & Settings",
};

export default function VendorNavbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/vendor/packages/")
      ? "Package Management"
      : "Vendor Portal");

  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    navigate(`/vendor/bookings?search=${encodeURIComponent(query)}`);
  }

  function handleLogout() {
    setProfileOpen(false);
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 bg-white/95 shadow-[0_2px_12px_rgba(15,23,42,0.025)] backdrop-blur">
      <div className="flex min-h-[82px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Page title area */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 lg:hidden"
          >
            <Menu size={21} />
          </button>

          <div className="min-w-0">
            {/* फक्त Dashboard /vendor वरच Breadcrumb आणि Title दिसेल */}
            {location.pathname === "/vendor" && (
              <>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                  <button
                    type="button"
                    onClick={() => navigate("/vendor")}
                    className="font-medium text-slate-400 transition hover:text-teal-700"
                  >
                    Vendor Portal
                  </button>

                  <ChevronRight size={13} className="shrink-0 text-slate-400" />

                  <span className="font-semibold text-teal-700">
                    Management
                  </span>
                </div>

                <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  {currentTitle}
                </h1>
              </>
            )}
          </div>
        </div>

        {/* Navbar actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
          {/* Booking search - फक्त Dashboard /vendor वरच दिसेल */}
          {location.pathname === "/vendor" && (
            <form
              onSubmit={handleSearch}
              className="hidden w-56 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 transition focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 md:flex lg:w-72"
            >
              <Search size={19} className="shrink-0 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bookings..."
                aria-label="Search bookings"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </form>
          )}

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setNotificationsOpen((previous) => !previous);
              }}
              aria-label="Toggle notifications"
              aria-expanded={notificationsOpen}
              className={`relative rounded-xl border p-3 transition ${
                notificationsOpen
                  ? "border-teal-200 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              }`}
            >
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">Notifications</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Your latest updates
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    aria-label="Close notifications"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={17} />
                  </button>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <Bell size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Stay updated
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Booking and package alerts will appear here when
                        connected to your API.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/vendor/notifications")}
                  className="mt-3 w-full rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div
            className="relative ml-1 border-l border-slate-200 pl-3 sm:ml-2 sm:pl-4 lg:pl-5"
            ref={profileRef}
          >
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(false);
                setProfileOpen((previous) => !previous);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50 sm:gap-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-base font-bold text-teal-800 ring-1 ring-teal-100 sm:h-12 sm:w-12">
                V
              </span>

              <span className="hidden text-left sm:block">
                <span className="block whitespace-nowrap text-sm font-bold text-slate-800">
                  Travel Vendor
                </span>
                <span className="mt-1 block whitespace-nowrap text-xs text-slate-500">
                  Business Account
                </span>
              </span>

              <ChevronDown
                size={16}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
              >
                <div className="mb-2 border-b border-slate-100 px-3 py-3">
                  <p className="text-sm font-bold text-slate-800">
                    Travel Vendor
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Business Account
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigate("/vendor/business-profile")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  <UserRound size={17} />
                  Business Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => navigate("/vendor/settings")}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  <Settings size={17} />
                  Account Settings
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
