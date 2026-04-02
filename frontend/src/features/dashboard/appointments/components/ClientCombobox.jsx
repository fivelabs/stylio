import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon, UserPlusIcon } from "@phosphor-icons/react";
import { clientsService } from "@/api/clients.service";
import { INPUT_CLASS } from "@/features/dashboard/appointments/helpers";

function clientDisplayName(client) {
  const name = [client.first_name, client.last_name].filter(Boolean).join(" ").trim();
  if (name && client.alias) return `${name} (${client.alias})`;
  if (name)                  return name;
  if (client.alias)          return client.alias;
  return `Cliente #${client.id}`;
}

export default function ClientCombobox({ value, onChange, onCreateClient, disabled }) {
  const [query, setQuery] = useState(value ?? "");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value ?? ""); }, [value]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await clientsService.list({ q: query || undefined, limit: 3 });
        setOptions(result.data);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleInput(e) {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  }

  function handleSelect(client) {
    const name = clientDisplayName(client);
    setQuery(name);
    onChange(name);
    setOpen(false);
  }

  function handleCreate() {
    setOpen(false);
    onCreateClient(query);
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
          placeholder="Buscar cliente…"
          autoFocus
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

          {!loading &&
            options.map((client) => (
              <button
                key={client.id}
                type="button"
                onMouseDown={() => handleSelect(client)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-brand/5 transition-colors focus-visible:outline-none focus-visible:bg-brand/5"
              >
                <span className="text-[14px] font-medium text-text-primary">
                  {clientDisplayName(client)}
                </span>
                {client.rut && (
                  <span className="text-[12px] font-mono text-text-primary/40 ml-2 shrink-0">{client.rut}</span>
                )}
              </button>
            ))}

          <button
            type="button"
            onMouseDown={handleCreate}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-brand hover:bg-brand/5 transition-colors border-t border-border focus-visible:outline-none"
          >
            <UserPlusIcon size={15} />
            {query.trim() ? `Crear cliente "${query.trim()}"` : "Crear nuevo cliente"}
          </button>
        </div>
      )}
    </div>
  );
}
