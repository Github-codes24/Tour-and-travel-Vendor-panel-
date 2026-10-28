import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  Map,
  PlusCircle,
  CalendarDays,
  BookOpen,
  Route,
  Wallet,
  Star,
  Bell,
  Headset,
  Settings,
  X,
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Package,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  LifeBuoy,
} from "lucide-react";

import Safar2You from "../../assets/Safar2YouSidebar.png";

const menuSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/vendor",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Business Profile",
        path: "/vendor/business-profile",
        icon: Building2,
      },
    ],
  },
  {
    title: "Packages",
    items: [
      {
        label: "My Packages",
        path: "/vendor/packages",
        icon: Map,
        end: true,
      },
      {
        label: "Add New Package",
        path: "/vendor/packages/new",
        icon: PlusCircle,
      },
      {
        label: "Availability Calendar",
        path: "/vendor/calendar",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        label: "Bookings",
        path: "/vendor/bookings",
        icon: BookOpen,
        badgeKey: "bookings",
      },
      {
        label: "Trips & Departures",
        path: "/vendor/trips",
        icon: Route,
      },
    ],
  },
  {
    title: "Finance & Insights",
    items: [
      {
        label: "Earnings & Payouts",
        path: "/vendor/earnings",
        icon: Wallet,
      },
      {
        label: "Reports & Analytics",
        path: "/vendor/reports",
        icon: BarChart3,
        children: [
          {
            label: "Analytics Overview",
            path: "/vendor/reports",
            icon: PieChart,
            end: true,
          },
          {
            label: "Sales Report",
            path: "/vendor/reports/sales",
            icon: TrendingUp,
          },
          {
            label: "Booking Analytics",
            path: "/vendor/reports/bookings",
            icon: BookOpen,
          },
          {
            label: "Revenue Report",
            path: "/vendor/reports/revenue",
            icon: Wallet,
          },
          {
            label: "Package Performance",
            path: "/vendor/reports/packages",
            icon: Package,
          },
          {
            label: "Customer Insights",
            path: "/vendor/reports/customers",
            icon: Users,
          },
        ],
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        label: "Reviews & Ratings",
        path: "/vendor/reviews",
        icon: Star,
      },
      {
        label: "Notifications",
        path: "/vendor/notifications",
        icon: Bell,
        badgeKey: "notifications",
      },
      {
        label: "Support",
        path: "/vendor/support",
        icon: Headset,
        children: [
          {
            label: "Support Dashboard",
            path: "/vendor/support",
            icon: LayoutDashboard,
            end: true,
          },
          {
            label: "Create Ticket",
            path: "/vendor/support/create",
            icon: PlusCircle,
          },
          {
            label: "My Tickets",
            path: "/vendor/support/tickets",
            icon: BookOpen,
          },
          {
            label: "Help Center / FAQs",
            path: "/vendor/support/help",
            icon: LifeBuoy,
          },
        ],
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Security & Settings",
        path: "/vendor/settings",
        icon: Settings,
      },
    ],
  },
];

const defaultVendor = {
  name: "Travel Vendor",
  accountType: "Business Account",
  verified: true,
};

const linkBase =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-all duration-200";

const linkActive =
  "bg-violet-600 font-semibold text-white shadow-lg shadow-violet-600/25";

const linkIdle = "text-slate-600 hover:bg-violet-50 hover:text-violet-700";

const scrollbarSlim =
  "[color-scheme:light] " +
  "[&::-webkit-scrollbar]:w-1.5 " +
  "[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-button]:w-0 " +
  "[&::-webkit-scrollbar-track]:bg-transparent " +
  "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 " +
  "hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 " +
  "[@supports(not_selector(::-webkit-scrollbar))]:[scrollbar-color:rgba(100,116,139,0.4)_transparent] " +
  "[@supports(not_selector(::-webkit-scrollbar))]:[scrollbar-width:thin]";

const scrollbarHidden =
  "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

/* Count badge */
function CountBadge({ count, active }) {
  if (!count) return null;

  return (
    <span
      className={`ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
        active ? "bg-white text-violet-700" : "bg-violet-100 text-violet-700"
      }`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* Normal navigation link */
function MenuLink({ item, badges, onNavigate, collapsed }) {
  const Icon = item.icon;
  const count = item.badgeKey ? badges[item.badgeKey] : 0;

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) =>
        `${linkBase} ${
          collapsed ? "relative justify-center px-2" : ""
        } ${isActive ? linkActive : linkIdle}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={19}
            strokeWidth={isActive ? 2.3 : 1.8}
            className={`shrink-0 ${
              isActive
                ? "text-white"
                : "text-slate-400 group-hover:text-violet-600"
            }`}
          />

          {!collapsed && (
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          )}

          {!collapsed && <CountBadge count={count} active={isActive} />}

          {collapsed && count > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-violet-500" />
          )}
        </>
      )}
    </NavLink>
  );
}

/* Navigation group with submenu */
function MenuGroup({ item, onNavigate, collapsed, onExpand }) {
  const { pathname } = useLocation();

  const Icon = item.icon;
  const isGroupActive = pathname.startsWith(item.path);

  const [open, setOpen] = useState(isGroupActive);

  const handleClick = () => {
    if (collapsed) {
      onExpand?.();
      setOpen(true);
      return;
    }

    setOpen((previous) => !previous);
  };

  return (
    <div>
      <button
        type="button"
        title={collapsed ? item.label : undefined}
        aria-expanded={!collapsed && open}
        onClick={handleClick}
        className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
          collapsed ? "justify-center px-2" : ""
        } ${
          isGroupActive
            ? "bg-violet-50 font-semibold text-violet-700"
            : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
        }`}
      >
        <Icon
          size={19}
          className={`shrink-0 ${
            isGroupActive
              ? "text-violet-600"
              : "text-slate-400 group-hover:text-violet-600"
          }`}
        />

        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>

            <ChevronDown
              size={15}
              className={`shrink-0 text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
          {item.children.map((child) => {
            const ChildIcon = child.icon;

            return (
              <NavLink
                key={child.path}
                to={child.path}
                end={child.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                    isActive
                      ? "bg-violet-50 font-semibold text-violet-700 ring-1 ring-inset ring-violet-200"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`
                }
              >
                <ChildIcon
                  size={16}
                  className={`shrink-0 ${
                    pathname === child.path
                      ? "text-violet-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />

                <span className="min-w-0 flex-1 truncate">{child.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Main Vendor Sidebar */
export default function VendorSidebar({
  onNavigate,
  onClose,
  onLogout,
  vendor = defaultVendor,
  badges = {},
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const vendorName = vendor?.name || defaultVendor.name;
  const accountType = vendor?.accountType || defaultVendor.accountType;
  const initial = vendorName.trim().charAt(0).toUpperCase() || "V";

  return (
    <aside
      className={`relative flex h-dvh shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-800 transition-[width] duration-300 ${
        collapsed ? "w-20" : "w-64 max-w-[85vw]"
      }`}
    >
      {/* Safar2You logo and collapse toggle */}
      <div
        className={`flex shrink-0 border-b border-slate-200 bg-white ${
          collapsed
            ? "min-h-[116px] flex-col items-center justify-center gap-2 px-2 py-3"
            : "min-h-[78px] items-center gap-2.5 px-3 py-4"
        }`}
      >
        {!collapsed &&
          (logoFailed ? (
            <span className="min-w-0 flex-1 truncate text-lg font-extrabold tracking-wide text-violet-800">
              Safar<span className="text-violet-600">2</span>You
            </span>
          ) : (
            <img
              src={Safar2You}
              alt="Safar2You"
              onError={() => setLogoFailed(true)}
              className="h-12 min-w-0 flex-1 object-contain object-left"
            />
          ))}

        <button
          type="button"
          onClick={() => setCollapsed((previous) => !previous)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex shrink-0 items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-violet-600 ${
            collapsed ? "order-1" : ""
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        {collapsed &&
          (logoFailed ? (
            <span className="text-sm font-extrabold text-violet-800">S2Y</span>
          ) : (
            <img
              src={Safar2You}
              alt="Safar2You"
              onError={() => setLogoFailed(true)}
              className="h-6 w-16 shrink-0 object-contain"
            />
          ))}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          >
            <X size={19} />
          </button>
        )}
      </div>

      {/* Vendor information */}
      <div
        className={`mt-4 flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 ${
          collapsed ? "mx-2 justify-center p-2" : "mx-3 gap-3 p-3"
        }`}
        title={collapsed ? `${vendorName} — ${accountType}` : undefined}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
          {initial}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {vendorName}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {accountType}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`mt-3 min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto pb-4 ${
          collapsed ? "px-2" : "pl-3 pr-1.5"
        } ${collapsed ? scrollbarHidden : scrollbarSlim}`}
        aria-label="Vendor navigation"
      >
        {menuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {section.title}
              </p>
            )}

            <div className="space-y-1">
              {section.items.map((item) =>
                item.children ? (
                  <MenuGroup
                    key={item.path}
                    item={item}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                    onExpand={() => setCollapsed(false)}
                  />
                ) : (
                  <MenuLink
                    key={item.path}
                    item={item}
                    badges={badges}
                    onNavigate={onNavigate}
                    collapsed={collapsed}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`shrink-0 space-y-2 border-t border-slate-200 ${
          collapsed ? "p-2" : "p-3"
        }`}
      >
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut size={17} className="shrink-0" />

            {!collapsed && <span>Logout</span>}
          </button>
        )}
      </div>
    </aside>
  );
}