import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpDownIcon,
  CaretUpIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { servicesService } from "@/api/services.service";
import { useToast } from "@/components/Toast";
import CreateServiceModal from "./components/CreateServiceModal";

const COLUMNS = [
  { key: "name",       label: "Nombre"     },
  { key: "price",      label: "Precio"     },
  { key: "created_at", label: "Registrado" },
];

const INITIAL_PARAMS = {
  page:     1,
  limit:    20,
  sort_by:  "name",
  sort_dir: "asc",
  q:        "",
};

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
      <span>
        {meta.total} servicios · página {meta.page} de {meta.pages}
      </span>

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

function formatPrice(price) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(price);
}

export default function ServicesPage() {
  const toast = useToast();

  const [params,      setParams]      = useState(INITIAL_PARAMS);
  const [search,      setSearch]      = useState("");
  const [result,      setResult]      = useState({ data: [], meta: null });
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);
  const debounceRef                   = useRef(null);

  const fetchServices = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicesService.list(p);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(params); }, [params, fetchServices]);

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

  function handleCreated(service) {
    setShowCreate(false);
    toast.success(`Servicio "${service.name}" creado correctamente.`);
    fetchServices(params);
  }

  const { data, meta } = result;

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-accent">Servicios</h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[14px] font-medium hover:bg-brand-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <PlusIcon size={17} />
          Nuevo servicio
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlassIcon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-[14px] rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-primary/35 focus:outline-none focus:ring-2 focus:ring-brand transition"
        />
      </div>

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
              <th className="px-4 py-3 text-left font-medium text-text-primary/55">Descripción</th>
            </tr>
          </thead>

          <tbody
            className={`transition-opacity duration-150 ${loading ? "opacity-40 pointer-events-none" : ""}`}
          >
            {error && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-red-500">
                  {error}
                </td>
              </tr>
            )}

            {!error && !loading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-text-primary/35">
                  No se encontraron servicios.
                </td>
              </tr>
            )}

            {data.map((service) => (
              <tr
                key={service.id}
                className="border-t border-border hover:bg-black/[0.02] transition-colors"
              >
                <td className="px-4 py-3 font-medium">{service.name}</td>
                <td className="px-4 py-3 font-mono text-[13px] text-text-primary/70">
                  {formatPrice(service.price)}
                </td>
                <td className="px-4 py-3 text-text-primary/50">
                  {new Date(service.created_at).toLocaleDateString("es-CL")}
                </td>
                <td className="px-4 py-3 text-text-primary/50 max-w-xs truncate">
                  {service.description || <span className="text-text-primary/30">—</span>}
                </td>
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
          {meta.total} {meta.total === 1 ? "servicio" : "servicios"} en total
        </p>
      )}

      {showCreate && (
        <CreateServiceModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
