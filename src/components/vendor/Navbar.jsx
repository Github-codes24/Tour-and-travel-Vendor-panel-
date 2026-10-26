import { Link, NavLink } from "react-router-dom";
import { Plane, Ticket, CalendarDays } from "lucide-react";

export function Navbar() {
  const navItems = [
    { to: "/my-bookings", label: "My Bookings" },
    { to: "/booking", label: "Book a Trip" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/vendor/packages" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-700/20">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Travel</div>
            <div className="text-lg font-extrabold tracking-tight text-slate-900">Voyage</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/my-bookings"
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 sm:px-4"
          >
            <Ticket className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Trips</span>
          </Link>
          <Link
            to="/vendor/packages"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:px-4"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Packages</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
