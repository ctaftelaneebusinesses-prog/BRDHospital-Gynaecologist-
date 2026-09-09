import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, CalendarClock, Wallet, Settings, LogOut } from "lucide-react";
import { AdminDataProvider, useAdminData } from "../../context/AdminDataContext";
import { signOut } from "../../lib/auth";
import { Logo } from "../../components/Logo";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarClock, end: false },
  { to: "/admin/payments", label: "Payments", icon: Wallet, end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
];

function Sidebar() {
  const { pendingCount } = useAdminData();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-plum/8 bg-cream">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo className="h-8 w-8" />
        <span className="font-serif text-lg font-medium text-plum">Admin</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const showBadge = item.label === "Appointments" && pendingCount > 0;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-plum text-cream" : "text-ink/65 hover:bg-plum/5"
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} />
                {item.label}
              </span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-semibold text-cream">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={() => signOut()}
        className="mx-3 mb-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-ink/60 hover:bg-plum/5"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </aside>
  );
}

export function AdminLayout() {
  return (
    <AdminDataProvider>
      <div className="flex min-h-screen bg-cream-dark/40">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-auto px-6 py-8 sm:px-10">
          <Outlet />
        </main>
      </div>
    </AdminDataProvider>
  );
}
