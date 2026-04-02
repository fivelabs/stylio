import { useState } from "react";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "@phosphor-icons/react";
import { inventoryService } from "@/api/inventory.service";

const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors disabled:opacity-50";

/**
 * @param {object}   item       — inventory item object
 * @param {"in"|"out"} initialType — preset direction
 * @param {Function} onClose
 * @param {Function} onUpdated(updatedItem)
 */
export default function StockMovementModal({ item, initialType = "in", onClose, onUpdated }) {
  const [type,     setType]     = useState(initialType);
  const [quantity, setQuantity] = useState("");
  const [cost,     setCost]     = useState("");
  const [note,     setNote]     = useState("");
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);

  const isIn = type === "in";

  // Preview del nuevo stock
  const qty         = parseFloat(quantity) || 0;
  const previewStock = isIn
    ? Number(item.stock) + qty
    : Number(item.stock) - qty;

  const stockInvalid = !isIn && previewStock < 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!quantity || parseFloat(quantity) <= 0) {
      return setError("Ingresa una cantidad mayor a 0.");
    }
    if (stockInvalid) {
      return setError(`Stock insuficiente. Máximo a descontar: ${item.stock} ${item.unit}.`);
    }

    setSaving(true);
    try {
      const payload = {
        type,
        quantity: parseFloat(quantity),
        note:     note.trim() || undefined,
      };
      if (isIn && cost !== "") {
        payload.cost = parseFloat(cost) || 0;
      }
      const updated = await inventoryService.addMovement(item.id, payload);
      onUpdated(updated);
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="font-heading text-[17px] font-semibold text-accent truncate max-w-[240px]">
              {item.name}
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
            disabled={saving}
            className="p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Tipo de movimiento */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setType("in"); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                isIn
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-border bg-surface text-text-primary/50 hover:border-border hover:text-text-primary"
              }`}
            >
              <ArrowUpIcon size={15} weight="bold" />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => { setType("out"); setError(null); }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                !isIn
                  ? "border-rose-500 bg-rose-50 text-rose-700"
                  : "border-border bg-surface text-text-primary/50 hover:border-border hover:text-text-primary"
              }`}
            >
              <ArrowDownIcon size={15} weight="bold" />
              Salida
            </button>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Cantidad <span className="text-text-primary/35">({item.unit})</span>
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) => { setQuantity(e.target.value); setError(null); }}
              placeholder="0"
              autoFocus
              disabled={saving}
              className={`${INPUT_CLASS} ${error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
            />
          </div>

          {/* Preview del stock resultante */}
          {qty > 0 && (
            <div className={`rounded-xl px-4 py-3 text-[13px] border ${
              stockInvalid
                ? "bg-red-50 border-red-200 text-red-700"
                : isIn
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
            }`}>
              Stock resultante:{" "}
              <span className="font-semibold">
                {stockInvalid ? "—" : `${previewStock} ${item.unit}`}
              </span>
            </div>
          )}

          {/* Costo total del lote — solo en entradas */}
          {isIn && (
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
                Costo total de esta compra{" "}
                <span className="text-text-primary/30 font-normal">(opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-primary/40 text-[13px] select-none">
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  disabled={saving}
                  className={`${INPUT_CLASS} pl-7`}
                />
              </div>
              <p className="text-[11px] text-text-primary/35 mt-1">
                Se suma al costo acumulado del ítem.
              </p>
            </div>
          )}

          {/* Nota opcional */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">
              Nota <span className="text-text-primary/30 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isIn ? "ej. Compra mensual" : "ej. Usada en cita de hoy"}
              disabled={saving}
              className={INPUT_CLASS}
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
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
              disabled={saving || stockInvalid}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-[13px] font-semibold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isIn
                  ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  : "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500"
              }`}
            >
              {isIn ? <ArrowUpIcon size={14} weight="bold" /> : <ArrowDownIcon size={14} weight="bold" />}
              {saving ? "Guardando…" : isIn ? "Registrar entrada" : "Registrar salida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
