import { useState } from "react";
import { XIcon } from "@phosphor-icons/react";
import { clientsService } from "@/api/clients.service";

const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors disabled:opacity-50";

const INITIAL_FORM = { first_name: "", last_name: "", alias: "", rut: "" };

export default function CreateClientModal({ onClose, onCreated }) {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [global, setGlobal] = useState(null);
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
      setGlobal(null);
    };
  }

  function validate() {
    const errs = {};
    const hasName  = form.first_name.trim();
    const hasAlias = form.alias.trim();

    if (!hasName && !hasAlias) {
      errs._base = "Ingresa al menos un nombre o un alias (ej. @usuario de Instagram).";
    }
    if (form.rut.trim()) {
      // Validación básica de formato RUT
      if (!/^\d{7,8}[0-9Kk]$/.test(form.rut.trim())) {
        errs.rut = "Formato inválido. Ej: 12345678K (sin puntos ni guion)";
      }
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setGlobal(null);
    try {
      const payload = {};
      if (form.first_name.trim()) payload.first_name = form.first_name.trim();
      if (form.last_name.trim())  payload.last_name  = form.last_name.trim();
      if (form.alias.trim())      payload.alias      = form.alias.trim();
      if (form.rut.trim())        payload.rut        = form.rut.trim().toUpperCase();

      const client = await clientsService.create(payload);
      onCreated(client);
    } catch (err) {
      setGlobal(err.message ?? "Error al crear el cliente.");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={saving ? undefined : onClose}
      />

      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-md mx-4 mb-4 sm:mb-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h2 className="font-heading text-[17px] font-semibold text-accent">Nuevo cliente</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Nombre
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={set("first_name")}
                placeholder="María"
                disabled={saving}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Apellido
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={set("last_name")}
                placeholder="González"
                disabled={saving}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Alias */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Alias{" "}
              <span className="text-text-primary/30 font-normal">(ej. @usuaria.ig)</span>
            </label>
            <input
              type="text"
              value={form.alias}
              onChange={set("alias")}
              placeholder="@usuaria.ig"
              disabled={saving}
              className={INPUT_CLASS}
            />
            {errors._base && (
              <p className="mt-1 text-[12px] text-red-500">{errors._base}</p>
            )}
            <p className="mt-1 text-[11px] text-text-primary/35">
              Si no tienes nombre, puedes registrar solo el alias.
            </p>
          </div>

          {/* RUT */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              RUT{" "}
              <span className="text-text-primary/30 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.rut}
              onChange={set("rut")}
              placeholder="12345678K"
              disabled={saving}
              className={`${INPUT_CLASS} font-mono ${errors.rut ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
            />
            {errors.rut && (
              <p className="mt-1 text-[12px] text-red-500">{errors.rut}</p>
            )}
          </div>

          {global && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {global}
            </p>
          )}

          {/* Footer */}
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
              className="px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              {saving ? "Guardando…" : "Crear cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
