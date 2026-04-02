import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { inventoryService } from "@/api/inventory.service";
import { useToast } from "@/components/Toast";
import CreateItemModal    from "./components/CreateItemModal";
import StockMovementModal from "./components/StockMovementModal";
import ItemHistoryModal   from "./components/ItemHistoryModal";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: "name",  label: "Producto" },
  { key: "stock", label: "Stock"    },
  { key: "unit",  label: "Unidad"   },
  { key: "cost",  label: "Costo acumulado" },
];

const INITIAL_PARAMS = {
  page:     1,
  limit:    20,
  sort_by:  "name",
  sort_dir: "asc",
  q:        "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortIcon({ column, params }) {
  if (params.sort_by !== column) return <CaretUpDownIcon size={13} className="opacity-25" />;
  return params.sort_dir === "asc"
    ? <CaretUpIcon   size={13} weight="bold" className="text-brand" />
    : <CaretDownIcon size={13} weight="bold" className="text-brand" />;
}

function StockBadge({ item }) {
  if (item.stock_status === "empty") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
        <WarningCircleIcon size={11} weight="fill" />
        Sin stock
      </span>
    );
  }
  if (item.stock_status === "low") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
        <WarningCircleIcon size={11} weight="fill" />
        Stock bajo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
      Stock disponible
    </span>
  );
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
      <span>{meta.total} productos · página {meta.page} de {meta.pages}</span>
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

export default function InventoryPage() {
  const toast = useToast();

  const [params,       setParams]       = useState(INITIAL_PARAMS);
  const [search,       setSearch]       = useState("");
  const [result,       setResult]       = useState({ data: [], meta: null });
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [showCreate,   setShowCreate]   = useState(false);
  const [movementItem, setMovementItem] = useState(null); // { item, type }
  const [historyItem,  setHistoryItem]  = useState(null);
  const debounceRef = useRef(null);

  const fetchItems = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.list(p);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(params); }, [params, fetchItems]);

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

  // Actualiza el item en la lista sin re-fetch completo
  function patchItem(updated) {
    setResult((prev) => ({
      ...prev,
      data: prev.data.map((it) => (it.id === updated.id ? updated : it)),
    }));
  }

  function handleItemCreated(item) {
    setShowCreate(false);
    toast.success(`"${item.name}" agregado al inventario.`);
    fetchItems(params);
  }

  function handleMovementDone(updated) {
    setMovementItem(null);
    const action = movementItem?.type === "in" ? "Entrada" : "Salida";
    toast.success(`${action} registrada. Stock actual: ${updated.stock} ${updated.unit}`);
    patchItem(updated);
  }

  const { data, meta } = result;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-accent">Inventario</h1>
          <p className="text-[13px] text-text-primary/45 mt-0.5">
            Controla tus productos y registra entradas y salidas de stock.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[14px] font-medium hover:bg-brand-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <PlusIcon size={17} />
          Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlassIcon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar producto…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-[14px] rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-primary/35 focus:outline-none focus:ring-2 focus:ring-brand transition"
        />
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
              <th className="px-4 py-3 text-left font-medium text-text-primary/55">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>

          <tbody className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-500">{error}</td>
              </tr>
            )}

            {!error && !loading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-text-primary/35">
                  No se encontraron productos en el inventario.
                </td>
              </tr>
            )}

            {data.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-black/[0.02] transition-colors">
                {/* Nombre */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setHistoryItem(item)}
                    className="font-medium text-left hover:text-brand transition-colors focus-visible:outline-none focus-visible:underline"
                    title="Ver historial"
                  >
                    {item.name}
                  </button>
                  {item.description && (
                    <p className="text-[12px] text-text-primary/40 mt-0.5 truncate max-w-[200px]">
                      {item.description}
                    </p>
                  )}
                </td>

                {/* Stock */}
                <td className="px-4 py-3 font-mono text-[13px] font-semibold tabular-nums">
                  {item.stock}
                </td>

                {/* Unidad */}
                <td className="px-4 py-3 text-text-primary/55">{item.unit}</td>

                {/* Costo */}
                <td className="px-4 py-3 font-mono text-[13px] text-text-primary/70">
                  {item.cost > 0
                    ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(item.cost)
                    : <span className="text-text-primary/30">—</span>}
                </td>

                {/* Estado */}
                <td className="px-4 py-3">
                  <StockBadge item={item} />
                </td>

                {/* Acciones */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setMovementItem({ item, type: "in" })}
                      title="Registrar entrada"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <ArrowUpIcon size={16} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMovementItem({ item, type: "out" })}
                      title="Registrar salida"
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <ArrowDownIcon size={16} weight="bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryItem(item)}
                      title="Ver historial"
                      className="p-1.5 rounded-lg text-text-primary/40 hover:bg-black/[0.04] hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <ClockIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination / count */}
      {meta && meta.pages > 1 && (
        <Pagination meta={meta} onPage={(p) => setParams((prev) => ({ ...prev, page: p }))} />
      )}
      {meta && meta.pages <= 1 && meta.total > 0 && (
        <p className="mt-3 text-[13px] text-text-primary/40">
          {meta.total} {meta.total === 1 ? "producto" : "productos"} en total
        </p>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateItemModal
          onClose={() => setShowCreate(false)}
          onCreated={handleItemCreated}
        />
      )}

      {movementItem && (
        <StockMovementModal
          item={movementItem.item}
          initialType={movementItem.type}
          onClose={() => setMovementItem(null)}
          onUpdated={handleMovementDone}
        />
      )}

      {historyItem && (
        <ItemHistoryModal
          item={historyItem}
          onClose={() => setHistoryItem(null)}
        />
      )}
    </div>
  );
}
