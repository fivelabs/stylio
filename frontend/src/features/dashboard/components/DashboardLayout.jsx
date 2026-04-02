import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ListIcon } from "@phosphor-icons/react";
import { useTenant } from "@/app/providers/TenantProvider";
import Sidebar from "@/features/dashboard/components/Sidebar";

function MobileTopBar({ onOpen }) {
  const { tenant, preferences } = useTenant();
  const brandName = preferences?.visible_name || tenant?.name || "Stylio";
  const logoUrl = preferences?.logo_url;

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 bg-surface z-30 flex items-center gap-3 px-4 lg:hidden"
      style={{ boxShadow: "0 1px 0 0 var(--color-border)" }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="p-1.5 rounded-lg text-text-primary/60 hover:bg-black/[0.04] hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        aria-label="Abrir menú"
      >
        <ListIcon size={22} />
      </button>

      {logoUrl ? (
        <img
          src={logoUrl}
          alt={brandName}
          className="h-7 w-auto max-w-[160px] object-contain object-left"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-heading font-semibold text-[16px] text-accent tracking-tight truncate">
          {brandName}
        </span>
      )}
    </header>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <MobileTopBar onOpen={() => setSidebarOpen(true)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen"
        role="main"
      >
        <Outlet />
      </main>
    </div>
  );
}
