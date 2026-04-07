import { useState } from "react";
import { TrashIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { servicesService } from "@/api/services.service";

export default function DeleteServiceModal({ service, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState(null);

  async function handleDelete() {
    setDeleting(true);
    try {
      await servicesService.delete(service.id);
      onDeleted(service);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={deleting ? undefined : onClose}
      />

      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-sm mx-4 mb-4 sm:mb-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <WarningIcon size={20} className="text-red-500" weight="fill" />
            <h2 className="font-heading text-[17px] font-semibold text-accent">Eliminar servicio</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <p className="text-[14px] text-text-primary/70">
            ¿Estás seguro de que deseas eliminar el servicio{" "}
            <span className="font-semibold text-text-primary">{service.name}</span>?
            Las citas existentes que usen este servicio no se verán afectadas.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-primary/60 hover:bg-black/[0.04] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
            >
              <TrashIcon size={14} />
              {deleting ? "Eliminando…" : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
