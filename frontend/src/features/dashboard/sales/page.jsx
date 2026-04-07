import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { salesService } from "@/api/sales.service";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "start_at", label: "Fecha"    },
  { key: "title",    label: "Cliente"  },
  { key: "service",  label: "Servicio" },
];

const INITIAL_PARAMS = {
  page:     1,
  limit:    20,
  sort_by:  "start_at",
  sort_dir: "desc",
  q:        "",
  from:     "",
  to:       "",
};

const MONTH_PRESETS = [
  { label: "Este mes",       getValue: () => getMonthRange(0)  },
  { label: "Mes anterior",   getValue: () => getMonthRange(-1) },
  { label: "Últimos 3 meses",getValue: () => getMonthRange(-2) },
];

function getMonthRange(offsetStart) {
  const now   = new Date();
  const from  = new Date(now.getFullYear(), now.getMonth() + offsetStart, 1);
  const to    = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-CL", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ column, params }) {
  if (params.sort_by !== column) return <CaretUpDownIcon size={13} className="opacity-25" />;
  return params.sort_dir === "asc"
    ? <CaretUpIcon   size={13} weight="bold" className="text-brand" />
    : <CaretDownIcon size={13} weight="bold" className="text-brand" />;
}

function Pagination({ meta, onPage }) {
  const pages = Array.from({ length: meta.pages }, (_, i) => i + 1).reduce(
    (acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push(null);
      acc.push(p);
      return acc;
    },
    [],
  );

  return (
    <div className="flex items-center justify-between mt-4 text-[13px] text-text-primary/60">
      <span>{meta.total} ventas · página {meta.page} de {meta.pages}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={meta.page <= 1}
          onClick={() => onPage(meta.page - 1)}
          className="p-1.5 rounded-lg hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <CaretLeftIcon size={15} />
        </button>
        {pages.map((p, idx) =>
          p === null ? (
            <span key={`sep-${idx}`} className="px-1.5">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`min-w-[32px] h-8 rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                p === meta.page
                  ? "bg-brand text-white"
                  : "hover:bg-black/[0.04] text-text-primary/70"
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={meta.page >= meta.pages}
          onClick={() => onPage(meta.page + 1)}
          className="p-1.5 rounded-lg hover:bg-black/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <CaretRightIcon size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function formatCLP(amount) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount);
}

export default function SalesPage() {
  const [params,   setParams]   = useState(INITIAL_PARAMS);
  const [search,   setSearch]   = useState("");
  const [result,   setResult]   = useState({ data: [], meta: null });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [summary,  setSummary]  = useState(null);
  const [showEarnings, setShowEarnings] = useState(false);
  const debounceRef = useRef(null);

  const fetchSales = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesService.list(p);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(params); }, [params, fetchSales]);

  // El summary se carga una sola vez (siempre son los últimos 30 días)
  useEffect(() => {
    salesService.summary().then(setSummary).catch(() => {});
  }, []);

  function handleSearch(value) {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParams((p) => ({ ...p, q: value, page: 1 }));
    }, 300);
  }

  function handleSort(col) {
    setParams((p) => ({
      ...p,
      sort_by:  col,
      sort_dir: p.sort_by === col && p.sort_dir === "asc" ? "desc" : "asc",
      page:     1,
    }));
  }

  function applyPreset(preset) {
    const { from, to } = preset.getValue();
    setParams((p) => ({ ...p, from, to, page: 1 }));
  }

  function clearDates() {
    setParams((p) => ({ ...p, from: "", to: "", page: 1 }));
  }

  const { data, meta } = result;
  const hasDateFilter = params.from || params.to;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-accent">Ventas</h1>
          <p className="text-[13px] text-text-primary/45 mt-0.5">
            Historial de citas finalizadas.
          </p>
        </div>

        {/* Earnings chip */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <TrendUpIcon size={18} weight="fill" className="shrink-0" />
            <div className="text-right">
              <p className="text-[11px] font-medium text-emerald-600/70 leading-none mb-0.5">
                Ventas últimos 30 días
              </p>
              <p className="text-[16px] font-bold leading-none tracking-tight">
                {showEarnings
                  ? (summary ? formatCLP(summary.earnings_30d) : "—")
                  : "••••••"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowEarnings((v) => !v)}
              title={showEarnings ? "Ocultar" : "Mostrar"}
              className="p-1 rounded-lg text-emerald-600/60 hover:text-emerald-700 hover:bg-emerald-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {showEarnings
                ? <EyeSlashIcon size={15} />
                : <EyeIcon      size={15} />}
            </button>
          </div>
          {summary && (
            <p className="text-[11px] text-text-primary/35">
              {summary.count_30d} {summary.count_30d === 1 ? "venta" : "ventas"} en ese período
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlassIcon
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por cliente o servicio…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[14px] rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-primary/35 focus:outline-none focus:ring-2 focus:ring-brand transition"
          />
        </div>

        {/* Month presets */}
        <div className="flex items-center gap-2 flex-wrap">
          {MONTH_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="px-3 py-2 rounded-lg text-[13px] font-medium border border-border bg-surface text-text-primary/60 hover:text-text-primary hover:border-brand/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {preset.label}
            </button>
          ))}
          {hasDateFilter && (
            <button
              type="button"
              onClick={clearDates}
              className="px-3 py-2 rounded-lg text-[13px] font-medium text-brand hover:bg-brand/5 transition-colors focus-visible:outline-none"
            >
              Ver todas
            </button>
          )}
        </div>

        {/* Custom date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={params.from}
            onChange={(e) => setParams((p) => ({ ...p, from: e.target.value, page: 1 }))}
            className="px-3 py-2 text-[13px] rounded-lg border border-border bg-surface text-text-primary/70 focus:outline-none focus:ring-2 focus:ring-brand transition"
          />
          <span className="text-text-primary/30 text-[13px]">—</span>
          <input
            type="date"
            value={params.to}
            onChange={(e) => setParams((p) => ({ ...p, to: e.target.value, page: 1 }))}
            className="px-3 py-2 text-[13px] rounded-lg border border-border bg-surface text-text-primary/70 focus:outline-none focus:ring-2 focus:ring-brand transition"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-surface">
        <table className="w-full text-[14px] text-text-primary">
          <thead>
            <tr className="border-b border-border bg-canvas">
              {COLUMNS.map(({ key, label }) => (
                <th key={key} className="px-4 py-3 text-left font-medium text-text-primary/55">
                  <button
                    type="button"
                    onClick={() => handleSort(key)}
                    className="flex items-center gap-1.5 hover:text-text-primary transition-colors focus-visible:outline-none"
                  >
                    {label}
                    <SortIcon column={key} params={params} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
            {error && (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-red-500">{error}</td>
              </tr>
            )}

            {!error && !loading && data.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center">
                  <p className="text-text-primary/35 text-[14px]">
                    {hasDateFilter
                      ? "No hay ventas en el período seleccionado."
                      : "Aún no hay ventas registradas."}
                  </p>
                  {hasDateFilter && (
                    <button
                      type="button"
                      onClick={clearDates}
                      className="mt-2 text-[13px] text-brand hover:underline focus-visible:outline-none"
                    >
                      Ver todas las ventas
                    </button>
                  )}
                </td>
              </tr>
            )}

            {data.map((sale, idx) => (
              <tr
                key={sale.id}
                className={`border-t border-border hover:bg-black/[0.02] transition-colors ${
                  idx % 2 === 0 ? "" : ""
                }`}
              >
                <td className="px-4 py-3 text-text-primary/60 tabular-nums">
                  {formatDate(sale.date)}
                </td>
                <td className="px-4 py-3 font-medium">{sale.title}</td>
                <td className="px-4 py-3 text-text-primary/70">{(sale.services || []).map((s) => s.service_name).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.pages > 1 && (
        <Pagination meta={meta} onPage={(p) => setParams((prev) => ({ ...prev, page: p }))} />
      )}

      {meta && meta.pages <= 1 && meta.total > 0 && (
        <p className="mt-3 text-[13px] text-text-primary/40">
          {meta.total} {meta.total === 1 ? "venta" : "ventas"} en total
        </p>
      )}
    </div>
  );
}
