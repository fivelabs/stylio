import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
  XIcon,
} from "@phosphor-icons/react";
import { inventoryService } from "@/api/inventory.service";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("es-CL", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function ItemHistoryModal({ item, onClose }) {
  const [result,  setResult]  = useState({ data: [], meta: null });
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchMovements = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.listMovements(item.id, { page: p, limit: 15 });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [item.id]);

  useEffect(() => { fetchMovements(page); }, [page, fetchMovements]);

  const { data, meta } = result;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-lg mx-4 mb-4 sm:mb-0 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <div className="min-w-0">
            <h2 className="font-heading text-[17px] font-semibold text-accent truncate">
              Historial — {item.name}
            </h2>
            <p className="text-[12px] text-text-primary/45 mt-0.5">
              Stock actual:{" "}
              <span className="font-medium text-text-primary/70">
                {item.stock} {item.unit}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className={`flex-1 overflow-y-auto transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
          {error && (
            <p className="px-5 py-8 text-center text-red-500 text-[14px]">{error}</p>
          )}

          {!error && !loading && data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-primary/30">
              <ClockIcon size={40} weight="thin" />
              <p className="text-[14px]">Sin movimientos registrados aún.</p>
            </div>
          )}

          {data.length > 0 && (
            <ul className="divide-y divide-border">
              {data.map((mv) => {
                const isIn = mv.type === "in";
                return (
                  <li key={mv.id} className="flex items-start gap-3 px-5 py-4">
                    {/* Icono */}
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isIn ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    }`}>
                      {isIn
                        ? <ArrowUpIcon   size={13} weight="bold" />
                        : <ArrowDownIcon size={13} weight="bold" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[13px] font-semibold ${isIn ? "text-emerald-700" : "text-rose-700"}`}>
                          {isIn ? "+" : "−"}{mv.quantity} {item.unit}
                        </span>
                        <span className="text-[12px] text-text-primary/35 shrink-0">
                          → {mv.stock_after} {item.unit}
                        </span>
                      </div>
                      {isIn && mv.cost > 0 && (
                        <p className="mt-0.5 text-[12px] text-text-primary/50 font-mono">
                          Compra:{" "}
                          <span className="font-semibold text-text-primary/70">
                            {new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(mv.cost)}
                          </span>
                        </p>
                      )}
                      {mv.note && (
                        <p className="mt-0.5 text-[12px] text-text-primary/50 truncate">{mv.note}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-text-primary/30">{formatDate(mv.created_at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0 text-[13px] text-text-primary/50">
            <span>{meta.total} movimientos</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none"
              >
                <CaretLeftIcon size={14} />
              </button>
              <span className="px-2 text-[13px]">{page} / {meta.pages}</span>
              <button
                type="button"
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none"
              >
                <CaretRightIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
