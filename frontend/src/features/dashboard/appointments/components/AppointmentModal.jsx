import { useState } from "react";
import { XIcon, PlusIcon, CheckIcon, FloppyDiskIcon, TrashIcon, ClockIcon, CheckCircleIcon, XCircleIcon, SealCheckIcon } from "@phosphor-icons/react";
import { COLORS, INPUT_CLASS, toDateStr, toTimeStr } from "@/features/dashboard/appointments/helpers";
import ClientCombobox from "@/features/dashboard/appointments/components/ClientCombobox";
import QuickCreateClientModal from "@/features/dashboard/appointments/components/QuickCreateClientModal";
import ServiceCombobox from "@/features/dashboard/appointments/components/ServiceCombobox";
import QuickCreateServiceModal from "@/features/dashboard/appointments/components/QuickCreateServiceModal";

const STATUSES = [
  { value: "requested", label: "Solicitada",  Icon: ClockIcon,       color: "text-amber-600",   bg: "bg-amber-50 border-amber-300"   },
  { value: "verified",  label: "Verificada",  Icon: SealCheckIcon,   color: "text-blue-600",    bg: "bg-blue-50 border-blue-300"     },
  { value: "completed", label: "Finalizada",  Icon: CheckCircleIcon, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-300"},
  { value: "cancelled", label: "Cancelada",   Icon: XCircleIcon,     color: "text-red-500",     bg: "bg-red-50 border-red-300"       },
];

function formatPrice(price) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(price);
}

function buildInitialForm(appointment, initial) {
  if (appointment) {
    return {
      name:      appointment.title,
      services:  (appointment.services || []).map((s) => ({
        service_id:   s.service_id,
        service_name: s.service_name,
        price:        s.price,
      })),
      date:      toDateStr(appointment.start),
      startTime: toTimeStr(appointment.start.getHours(), appointment.start.getMinutes()),
      endTime:   toTimeStr(appointment.end.getHours(), appointment.end.getMinutes()),
      color:     appointment.color  ?? "brand",
      status:    appointment.status ?? "requested",
    };
  }
  return {
    name:      "",
    services:  [],
    date:      initial?.dateStr  ?? toDateStr(new Date()),
    startTime: initial?.startStr ?? toTimeStr(9),
    endTime:   initial?.endStr   ?? toTimeStr(10),
    color:     "brand",
    status:    "requested",
  };
}

export default function AppointmentModal({ initial, appointment, onClose, onSave, onDelete }) {
  const isEdit = !!appointment;
  const [form, setForm] = useState(() => buildInitialForm(appointment, initial));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [createClientQuery, setCreateClientQuery] = useState("");
  const [createServiceOpen, setCreateServiceOpen] = useState(false);
  const [createServiceQuery, setCreateServiceQuery] = useState("");

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const addService = (service) => {
    setForm((prev) => ({
      ...prev,
      services: [...prev.services, {
        service_id:   service.id,
        service_name: service.name,
        price:        service.price,
      }],
    }));
    setError(null);
  };

  const removeService = (index) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateServicePrice = (index, newPrice) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((s, i) =>
        i === index ? { ...s, price: newPrice } : s
      ),
    }));
  };

  const totalPrice = form.services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const excludeServiceIds = form.services.map((s) => s.service_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("El nombre del cliente es requerido.");
    if (form.services.length === 0) return setError("Debes agregar al menos un servicio.");
    if (form.startTime >= form.endTime) return setError("La hora de fin debe ser posterior a la de inicio.");

    for (const s of form.services) {
      if (s.price === "" || isNaN(Number(s.price)) || Number(s.price) < 0) {
        return setError(`El precio del servicio "${s.service_name}" no es válido.`);
      }
    }

    const [sh, sm] = form.startTime.split(":").map(Number);
    const [eh, em] = form.endTime.split(":").map(Number);
    const [y, mo, d] = form.date.split("-").map(Number);

    setSaving(true);
    try {
      await onSave({
        title:    form.name.trim(),
        services: form.services.map((s) => ({
          service_id: s.service_id,
          price:      Number(s.price),
        })),
        start:  new Date(y, mo - 1, d, sh, sm, 0, 0),
        end:    new Date(y, mo - 1, d, eh, em, 0, 0),
        color:  form.color,
        status: form.status,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const busy = saving || deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={busy ? undefined : onClose} />
      <div className="relative bg-canvas rounded-2xl shadow-2xl w-full max-w-lg mx-4 mb-4 sm:mb-0 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <h2 className="font-heading text-[17px] font-semibold text-accent">
            {isEdit ? "Editar cita" : "Nueva cita"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="p-1.5 rounded-lg text-text-primary/40 hover:text-text-primary hover:bg-black/[0.04] transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Cliente</label>
            {appointment ? (
              <div className={`${INPUT_CLASS} bg-surface/60 text-text-primary/60 cursor-not-allowed select-none`}>
                {form.name}
              </div>
            ) : (
              <ClientCombobox
                value={form.name}
                onChange={(v) => { setForm((p) => ({ ...p, name: v })); setError(null); }}
                onCreateClient={(q) => { setCreateClientQuery(q); setCreateClientOpen(true); }}
                disabled={busy}
              />
            )}
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Servicios</label>

            {form.services.length > 0 && (
              <div className="space-y-2 mb-3">
                {form.services.map((s, idx) => (
                  <div
                    key={`${s.service_id}-${idx}`}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-surface"
                  >
                    <span className="flex-1 text-[14px] font-medium text-text-primary truncate">
                      {s.service_name}
                    </span>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-text-primary/40 pointer-events-none select-none">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={s.price}
                        onChange={(e) => updateServicePrice(idx, e.target.value)}
                        disabled={busy}
                        className="w-full pl-6 pr-2 py-1.5 rounded-md bg-canvas border border-border text-[13px] font-mono text-text-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(idx)}
                      disabled={busy}
                      className="p-1 rounded-md text-text-primary/30 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      title="Quitar servicio"
                    >
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end">
                  <span className="text-[13px] font-semibold text-text-primary/70">
                    Total: <span className="font-mono">{formatPrice(totalPrice)}</span>
                  </span>
                </div>
              </div>
            )}

            <ServiceCombobox
              onSelect={addService}
              onCreateService={(q) => { setCreateServiceQuery(q); setCreateServiceOpen(true); }}
              disabled={busy}
              excludeIds={excludeServiceIds}
            />
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Fecha</label>
              <input type="date" value={form.date} onChange={set("date")} disabled={busy} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Inicio</label>
              <input type="time" value={form.startTime} onChange={set("startTime")} disabled={busy} className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-primary/60 mb-1.5">Fin</label>
              <input type="time" value={form.endTime} onChange={set("endTime")} disabled={busy} className={INPUT_CLASS} />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-2">Estado</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(({ value, label, Icon, color, bg }) => {
                const active = form.status === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={busy}
                    onClick={() => setForm((p) => ({ ...p, status: value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 ${
                      active
                        ? `${bg} ${color} border-current`
                        : "border-border text-text-primary/50 hover:border-border hover:text-text-primary bg-surface"
                    }`}
                  >
                    <Icon size={15} weight={active ? "fill" : "regular"} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-[13px] font-medium text-text-primary/60 mb-2">Color</label>
            <div className="flex items-center gap-2">
              {Object.entries(COLORS).map(([key, c]) => (
                <button
                  key={key}
                  type="button"
                  disabled={busy}
                  onClick={() => setForm((prev) => ({ ...prev, color: key }))}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 ${c.swatch} ${form.color === key ? "scale-110 ring-2 ring-offset-2 ring-text-primary/20" : "hover:scale-105"
                    }`}
                >
                  {form.color === key && <CheckIcon size={12} weight="bold" className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <TrashIcon size={15} />
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-text-primary/60 hover:bg-black/[0.04] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                {isEdit ? (
                  <>
                    <FloppyDiskIcon size={14} />
                    {saving ? "Guardando…" : "Guardar cambios"}
                  </>
                ) : (
                  <>
                    <PlusIcon size={14} weight="bold" />
                    {saving ? "Creando…" : "Crear cita"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {createClientOpen && (
        <QuickCreateClientModal
          initialName={createClientQuery}
          onClose={() => setCreateClientOpen(false)}
          onCreated={(client) => {
            const fullName = `${client.first_name} ${client.last_name}`.trim();
            setForm((p) => ({ ...p, name: fullName }));
            setCreateClientOpen(false);
          }}
        />
      )}

      {createServiceOpen && (
        <QuickCreateServiceModal
          initialName={createServiceQuery}
          onClose={() => setCreateServiceOpen(false)}
          onCreated={(service) => {
            addService(service);
            setCreateServiceOpen(false);
          }}
        />
      )}
    </div>
  );
}
