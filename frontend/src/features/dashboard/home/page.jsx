import { useEffect, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useAuth } from "@/app/providers/AuthProvider";
import { dashboardService } from "@/api/dashboard.service";
import RevenueChart from "./components/RevenueChart";
import UpcomingAppointments from "./components/UpcomingAppointments";

const CLP = (v) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(v);

export default function HomePage() {
  const { user } = useAuth();

  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showEarnings, setShowEarnings] = useState(false);
  const [chartMonth,   setChartMonth]   = useState(null);

  useEffect(() => {
    dashboardService.stats()
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  const cards = [
    {
      label: "Citas hoy",
      value: statsLoading ? "—" : String(stats?.appointments_today ?? 0),
      sub:   "No canceladas",
      sensitive: false,
    },
    {
      label: "Clientes registrados",
      value: statsLoading ? "—" : String(stats?.clients_total ?? 0),
      sub:   null,
      sensitive: false,
    },
    {
      label: "Ingresos del mes",
      value: statsLoading
        ? "—"
        : showEarnings
          ? CLP(stats?.earnings_month ?? 0)
          : "••••••",
      sub:      stats?.month_label ?? null,
      sensitive: true,
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-accent">
          Bienvenido, {user?.first_name}
        </h1>
        <p className="text-text-primary/50 mt-1 text-[14px]">
          Panel de administración de tu salón.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-border p-6 relative"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-text-primary/50">{card.label}</p>
              {card.sensitive && (
                <button
                  type="button"
                  onClick={() => setShowEarnings((v) => !v)}
                  className="p-1 rounded-lg text-text-primary/35 hover:text-text-primary/60 hover:bg-black/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand -mt-0.5 -mr-1 shrink-0"
                  title={showEarnings ? "Ocultar ingresos" : "Mostrar ingresos"}
                >
                  {showEarnings
                    ? <EyeSlashIcon size={16} />
                    : <EyeIcon size={16} />}
                </button>
              )}
            </div>
            <p className={`text-3xl font-bold text-accent mt-2 ${card.sensitive && !showEarnings && !statsLoading ? "tracking-widest" : ""}`}>
              {card.value}
            </p>
            {card.sub && (
              <p className="text-[11px] text-text-primary/35 mt-1 capitalize">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Gráfico + Próximas citas en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">

        {/* Gráfico ventas vs compras */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="mb-5">
            <h2 className="font-heading text-[16px] font-semibold text-accent">
              Ventas vs. Compras
            </h2>
            <p className="text-[13px] text-text-primary/45 mt-0.5 capitalize">
              {chartMonth ?? "Cargando…"}
            </p>
          </div>
          <RevenueChart onMonth={setChartMonth} />
        </div>

        {/* Próximas citas */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col min-h-0">
          <div className="mb-3 shrink-0">
            <h2 className="font-heading text-[16px] font-semibold text-accent">
              Próximas citas
            </h2>
            <p className="text-[13px] text-text-primary/45 mt-0.5">
              Sin canceladas
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            <UpcomingAppointments />
          </div>
        </div>

      </div>
    </div>
  );
}
