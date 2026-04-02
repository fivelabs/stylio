import { useEffect, useState } from "react";
import {
  CrownSimpleIcon,
  CalendarBlankIcon,
  IdentificationCardIcon,
  ArrowSquareOutIcon,
  GearIcon,
  ReceiptIcon,
} from "@phosphor-icons/react";
import { billingService } from "@/api/billing.service";

const STATUS_CONFIG = {
  trialing: { label: "Prueba", className: "bg-blue-100   text-blue-700   border-blue-200" },
  active: { label: "Activa", className: "bg-green-100  text-green-700  border-green-200" },
  canceled: { label: "Cancelada", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  past_due: { label: "Pago pendiente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  revoked: { label: "Revocada", className: "bg-red-100    text-red-700    border-red-200" },
  unpaid: { label: "Sin pago", className: "bg-red-100    text-red-700    border-red-200" },
};

const INTERVAL_LABELS = { month: "Mensual", year: "Anual", week: "Semanal" };

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(iso));
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: "bg-surface text-text-primary border-border" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function BillingSection() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    billingService.getSubscriptionDetails()
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  const openPortal = async (path = "") => {
    setWorking(true);
    try {
      const { url } = await billingService.getPortalUrl(path);
      window.open(url, "_blank");
    } catch {
      const { url } = await billingService.getCheckoutUrl();
      window.location.href = url;
    } finally {
      setWorking(false);
    }
  };

  return (
    <section>
      <h2 className="font-semibold text-accent mb-4">Facturación</h2>

      {loading ? (
        <div className="h-32 rounded-2xl bg-border/30 animate-pulse" />
      ) : (
        <div className="space-y-3">
          <div className="bg-canvas border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <p className="text-xs font-semibold text-text-primary/40 uppercase tracking-wider mb-3">
                Plan actual
              </p>

              {sub ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="font-heading text-xl font-bold text-accent">
                      {INTERVAL_LABELS[sub.interval] ?? sub.plan_name}
                    </span>
                    <StatusBadge status={sub.status} />
                    {sub.cancel_at_period_end && (
                      <span className="text-xs text-orange-600 font-medium">· Cancela al vencer</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <CalendarBlankIcon size={16} className="text-text-primary/40 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-text-primary/40 uppercase tracking-wider mb-0.5">
                          {sub.cancel_at_period_end ? "Acceso hasta" : "Próximo cobro"}
                        </p>
                        <p className="text-sm font-medium text-accent">{formatDate(sub.current_period_end)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <IdentificationCardIcon size={16} className="text-text-primary/40 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-text-primary/40 uppercase tracking-wider mb-0.5">
                          ID de suscripción
                        </p>
                        <p className="text-xs font-mono text-text-primary/60 break-all">{sub.id}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 py-1">
                  <CrownSimpleIcon size={20} className="text-text-primary/30" />
                  <p className="text-text-primary/50 text-sm">No tienes una suscripción activa.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex flex-wrap gap-3">
              {sub ? (
                <button
                  onClick={() => openPortal()}
                  disabled={working}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:bg-border/40 transition-colors disabled:opacity-50"
                >
                  <GearIcon size={14} weight="bold" />
                  Gestionar suscripción
                  <ArrowSquareOutIcon size={12} className="text-text-primary/40" />
                </button>
              ) : (
                <button
                  onClick={() => openPortal()}
                  disabled={working}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  <CrownSimpleIcon size={14} weight="bold" />
                  Activar suscripción
                </button>
              )}
            </div>
          </div>

          <div className="bg-canvas border border-border rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ReceiptIcon size={18} className="text-text-primary/40 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-accent">Historial de compras</p>
                <p className="text-xs text-text-primary/50 mt-0.5">Ver pedidos y facturas anteriores.</p>
              </div>
            </div>
            <button
              onClick={() => openPortal("/orders")}
              disabled={working}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:bg-border/40 transition-colors disabled:opacity-50 shrink-0"
            >
              Ver pedidos
              <ArrowSquareOutIcon size={12} className="text-text-primary/40" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
