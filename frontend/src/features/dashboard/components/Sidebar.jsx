import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  SquaresFourIcon,
  CalendarBlankIcon,
  UsersIcon,
  ScissorsIcon,
  ArchiveIcon,
  ReceiptIcon,
  GearIcon,
  CaretRightIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTenant } from "@/app/providers/TenantProvider";

const NAV_ITEMS = [
  { to: "/",          icon: SquaresFourIcon,   label: "Dashboard"  },
  { to: "/citas",     icon: CalendarBlankIcon, label: "Citas"      },
  { to: "/clientes",  icon: UsersIcon,         label: "Clientes"   },
  { to: "/servicios", icon: ScissorsIcon,      label: "Servicios"  },
  { to: "/inventario", icon: ArchiveIcon,  label: "Inventario" },
  { to: "/ventas",     icon: ReceiptIcon,  label: "Ventas"     },
];

const NAV_LINK_CLASS = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
    isActive
      ? "bg-brand/10 text-brand"
      : "text-text-primary/80 hover:bg-black/[0.04] hover:text-text-primary"
  }`;

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { tenant, preferences } = useTenant();
  const brandName = preferences?.visible_name || tenant?.name || "Stylio";
  const logoUrl   = preferences?.logo_url;
  const location  = useLocation();

  useEffect(() => { onClose?.(); }, [location.pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-surface z-40 overflow-hidden transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ boxShadow: "1px 0 0 0 var(--color-border)" }}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-5 pt-6 pb-2 shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandName}
                className="h-10 w-auto max-w-[200px] object-contain object-left"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="font-heading font-semibold text-[17px] text-accent tracking-tight">
                {brandName}
              </span>
            )}
          </div>

          <nav className="flex-1 px-3 pt-2 pb-4 overflow-y-auto" aria-label="Principal">
            <ul className="space-y-0.5">
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink to={to} end={to === "/"} className={NAV_LINK_CLASS}>
                    {({ isActive }) => (
                      <>
                        <Icon size={22} className="shrink-0" />
                        <span className="flex-1 truncate">{label}</span>
                        {isActive && (
                          <CaretRightIcon size={14} weight="bold" className="shrink-0 text-brand" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-3 border-t border-border shrink-0 space-y-1.5">
            <NavLink to="/configuracion" className={NAV_LINK_CLASS}>
              {({ isActive }) => (
                <>
                  <GearIcon size={22} className="shrink-0" />
                  <span className="flex-1 truncate">Configuración</span>
                  {isActive && (
                    <CaretRightIcon size={14} weight="bold" className="shrink-0 text-brand" />
                  )}
                </>
              )}
            </NavLink>

            <div className="px-3 py-2.5 rounded-lg bg-canvas flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-brand/15 flex items-center justify-center shrink-0">
                <span className="font-semibold text-[13px] text-brand">
                  {user?.first_name?.[0]}
                  {user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-text-primary truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-[13px] text-text-primary/50 truncate">{user?.email}</p>
              </div>
              <CaretRightIcon size={14} className="text-text-primary/40 shrink-0" />
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium text-text-primary/70 hover:bg-black/[0.04] hover:text-red-600 transition-colors duration-200 ease-apple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <SignOutIcon size={22} weight="regular" className="shrink-0" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
