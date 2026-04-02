import { useState } from "react";
import { UserPlusIcon, XIcon } from "@phosphor-icons/react";
import { clientsService } from "@/api/clients.service";
import { INPUT_CLASS } from "@/features/dashboard/appointments/helpers";

export default function QuickCreateClientModal({ initialName, onClose, onCreated }) {
  const [form, setForm] = useState(() => {
    const trimmed = (initialName ?? "").trim();
    const isRut = /^\d{6,8}[0-9Kk]?$/.test(trimmed);
    if (isRut) {
      return { rut: trimmed.toUpperCase(), first_name: "", last_name: "" };
    }
    const parts = trimmed.split(/\s+/);
    return { rut: "", first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setError(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rut.trim()) return setError("El RUT es requerido.");
    if (!form.first_name.trim()) return setError("El nombre es requerido.");

    setSaving(true);
    try {
      const client = await clientsService.create({
        rut: form.rut.trim().toUpperCase(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      onCreated(client);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={saving ? undefined : onClose}
      />
      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-sm mx-4 mb-4 sm:mb-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="font-heading text-[17px] font-semibold text-accent">Nuevo cliente</h2>
            <p className="text-[12px] text-text-primary/45 mt-0.5">
              Quedará guardado para futuras citas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">RUT</label>
            <input
              type="text"
              value={form.rut}
              onChange={set("rut")}
              placeholder="ej. 12345678K"
              autoFocus
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Nombre</label>
              <input
                type="text"
                value={form.first_name}
                onChange={set("first_name")}
                placeholder="ej. María"
                disabled={saving}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Apellido</label>
              <input
                type="text"
                value={form.last_name}
                onChange={set("last_name")}
                placeholder="ej. González"
                disabled={saving}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-primary/60 hover:bg-black/[0.04] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <UserPlusIcon size={14} />
              {saving ? "Guardando…" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
