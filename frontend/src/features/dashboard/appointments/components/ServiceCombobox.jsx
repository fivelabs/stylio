import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { servicesService } from "@/api/services.service";
import { INPUT_CLASS } from "@/features/dashboard/appointments/helpers";

function formatPrice(price) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(price);
}

/**
 * ServiceCombobox — searches services and returns the full service object
 * via onSelect({ id, name, price }).
 */
export default function ServiceCombobox({ onSelect, onCreateService, disabled, excludeIds = [] }) {
  const [query,   setQuery]   = useState("");
  const [options, setOptions] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef     = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await servicesService.list({ q: query || undefined, limit: 5 });
        setOptions(result.data.filter((s) => !excludeIds.includes(s.id)));
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, excludeIds.join(",")]);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleInput(e) {
    setQuery(e.target.value);
    setOpen(true);
  }

  function handleSelect(service) {
    onSelect({ id: service.id, name: service.name, price: service.price });
    setQuery("");
    setOpen(false);
  }

  function handleCreate() {
    setOpen(false);
    onCreateService(query);
  }

  const showDropdown = open && !disabled;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <MagnifyingGlassIcon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/35 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder="Buscar y agregar servicio…"
          disabled={disabled}
          className={`${INPUT_CLASS} pl-9`}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-canvas rounded-xl border border-border shadow-xl overflow-hidden">
          {loading && (
            <p className="px-3 py-2.5 text-[13px] text-text-primary/40">Buscando…</p>
          )}

          {!loading && options.length === 0 && query.trim() && (
            <p className="px-3 py-2.5 text-[13px] text-text-primary/40">Sin resultados.</p>
          )}

          {!loading && options.map((service) => (
            <button
              key={service.id}
              type="button"
              onMouseDown={() => handleSelect(service)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-brand/5 transition-colors focus-visible:outline-none focus-visible:bg-brand/5"
            >
              <span className="text-[14px] font-medium text-text-primary">{service.name}</span>
              <span className="text-[12px] font-mono text-text-primary/40">{formatPrice(service.price)}</span>
            </button>
          ))}

          <button
            type="button"
            onMouseDown={handleCreate}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-brand hover:bg-brand/5 transition-colors border-t border-border focus-visible:outline-none"
          >
            <PlusIcon size={15} weight="bold" />
            {query.trim() ? `Crear servicio "${query.trim()}"` : "Crear nuevo servicio"}
          </button>
        </div>
      )}
    </div>
  );
}
