import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTenant } from "@/app/providers/TenantProvider";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/citas", icon: CalendarDays, label: "Citas" },
  { to: "/clientes", icon: Users, label: "Clientes" },
  { to: "/servicios", icon: Scissors, label: "Servicios" },
  { to: "/configuracion", icon: Settings, label: "Configuración" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { tenant, preferences } = useTenant();
  const brandName = preferences?.visible_name || tenant?.name || "Stylio";
  const logoUrl = preferences?.logo_url;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-surface border-r border-border rounded-r-2xl z-40 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-5 shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-12 w-auto max-w-[200px] object-contain object-left"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span
              className="font-bold text-lg text-accent tracking-tight block"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {brandName}
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                      ? "bg-brand/10 text-brand"
                      : "text-text-primary/70 hover:bg-canvas hover:text-text-primary"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 shrink-0 text-brand" />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <div className="px-3 py-2.5 rounded-xl bg-canvas border border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
              <span className="text-brand font-semibold text-sm">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-text-primary/50 truncate">{user?.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-text-primary/40 shrink-0" />
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-primary/70 hover:bg-canvas hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
