import { useState } from "react";
import { ArchiveIcon, XIcon } from "@phosphor-icons/react";
import { inventoryService } from "@/api/inventory.service";

const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors disabled:opacity-50";

const UNIT_SUGGESTIONS = ["unidades", "ml", "g", "kg", "oz", "pares", "cajas", "rollos"];

const INITIAL_FORM = {
  name:                "",
  description:         "",
  unit:                "unidades",
  stock:               "",
  cost:                "",
  low_stock_threshold: "",
};

export default function CreateItemModal({ onClose, onCreated }) {
  const [form,   setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(field) {
    return (e) => {
      setForm((p) => ({ ...p, [field]: e.target.value }));
      setErrors((p) => ({ ...p, [field]: undefined, _global: undefined }));
    };
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es requerido.";
    if (!form.unit.trim()) errs.unit = "La unidad es requerida.";
    if (form.stock !== "") {
      const v = parseFloat(form.stock);
      if (isNaN(v) || v < 0) errs.stock = "El stock inicial debe ser un número positivo.";
    }
    if (form.cost !== "") {
      const v = parseFloat(form.cost);
      if (isNaN(v) || v < 0) errs.cost = "El costo debe ser un número positivo.";
    }
    if (form.low_stock_threshold !== "") {
      const v = parseFloat(form.low_stock_threshold);
      if (isNaN(v) || v < 0) errs.low_stock_threshold = "Debe ser un número positivo.";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);

    setSaving(true);
    try {
      const item = await inventoryService.create({
        name:                form.name.trim(),
        description:         form.description.trim(),
        unit:                form.unit.trim(),
        stock:               form.stock !== "" ? parseFloat(form.stock) : 0,
        cost:                form.cost  !== "" ? parseFloat(form.cost)  : 0,
        low_stock_threshold: form.low_stock_threshold !== "" ? parseFloat(form.low_stock_threshold) : null,
      });
      onCreated(item);
    } catch (err) {
      setErrors({ _global: err.message });
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={saving ? undefined : onClose}
      />

      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-md mx-4 mb-4 sm:mb-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="font-heading text-[17px] font-semibold text-accent">Nuevo producto</h2>
            <p className="text-[12px] text-text-primary/45 mt-0.5">
              Agrega un producto a tu inventario.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {errors._global && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors._global}
            </p>
          )}

          {/* Name */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="ej. Pegamento para pestañas"
              autoFocus
              disabled={saving}
              className={`${INPUT_CLASS} ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
            />
            {errors.name && <p className="mt-1 text-[12px] text-red-600">{errors.name}</p>}
          </div>

          {/* Unit + Stock inicial + Costo */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Unidad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.unit}
                onChange={set("unit")}
                list="unit-suggestions"
                placeholder="ml, g, unidades…"
                disabled={saving}
                className={`${INPUT_CLASS} ${errors.unit ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
              />
              <datalist id="unit-suggestions">
                {UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
              </datalist>
              {errors.unit && <p className="mt-1 text-[12px] text-red-600">{errors.unit}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Stock inicial
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={form.stock}
                onChange={set("stock")}
                placeholder="0"
                disabled={saving}
                className={`${INPUT_CLASS} ${errors.stock ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
              />
              {errors.stock && <p className="mt-1 text-[12px] text-red-600">{errors.stock}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Costo inicial
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-primary/40 pointer-events-none select-none">$</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.cost}
                  onChange={set("cost")}
                  placeholder="0"
                  disabled={saving}
                  className={`${INPUT_CLASS} pl-7 ${errors.cost ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                />
              </div>
              {errors.cost && <p className="mt-1 text-[12px] text-red-600">{errors.cost}</p>}
            </div>
          </div>

          {/* Low stock threshold */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Alerta de stock bajo{" "}
              <span className="text-text-primary/30 font-normal">(opcional)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={form.low_stock_threshold}
              onChange={set("low_stock_threshold")}
              placeholder="ej. 5 — se marcará en amarillo al llegar a este nivel"
              disabled={saving}
              className={`${INPUT_CLASS} ${errors.low_stock_threshold ? "border-red-400" : ""}`}
            />
            {errors.low_stock_threshold && (
              <p className="mt-1 text-[12px] text-red-600">{errors.low_stock_threshold}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Descripción <span className="text-text-primary/30 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={set("description")}
              placeholder="ej. Marca XYZ, resistente al agua"
              disabled={saving}
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <ArchiveIcon size={14} />
              {saving ? "Guardando…" : "Agregar producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
