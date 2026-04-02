import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  SealCheckIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { dashboardService } from "@/api/dashboard.service";
import { appointmentsService } from "@/api/appointments.service";

// ─── Configuración de estados ─────────────────────────────────────────────────
const STATUSES = [
  { value: "requested", label: "Solicitada", Icon: ClockIcon,       dot: "bg-amber-400",   text: "text-amber-600"  },
  { value: "verified",  label: "Verificada",  Icon: SealCheckIcon,   dot: "bg-blue-400",    text: "text-blue-600"   },
  { value: "completed", label: "Finalizada",  Icon: CheckCircleIcon, dot: "bg-emerald-400", text: "text-emerald-600"},
  { value: "cancelled", label: "Cancelada",   Icon: XCircleIcon,     dot: "bg-red-400",     text: "text-red-500"    },
];

function getStatus(value) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

// ─── Fecha formateada ─────────────────────────────────────────────────────────
function formatDateTime(dateStr) {
  const d   = new Date(dateStr);
  const now = new Date();
  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });

  if (sameDay(d, now))      return `Hoy · ${time}`;
  if (sameDay(d, tomorrow)) return `Mañana · ${time}`;
  return (
    d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" }) +
    ` · ${time}`
  );
}

// ─── Dropdown portal (evita clipping por overflow) ───────────────────────────
function StatusMenu({ anchor, current, onPick, onClose }) {
  const menuRef = useRef(null);

  // Posición calculada desde el botón disparador
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUp     = spaceBelow < 200;

  const style = {
    position: "fixed",
    right:    window.innerWidth - rect.right,
    width:    176,
    zIndex:   9999,
    ...(openUp
      ? { bottom: window.innerHeight - rect.top + 4 }
      : { top: rect.bottom + 4 }),
  };

  useEffect(() => {
    function handle(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) && !anchor.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [anchor, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={style}
      className="bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden py-1"
    >
      {STATUSES.map((st) => {
        const active = st.value === current;
        return (
          <button
            key={st.value}
            type="button"
            onMouseDown={() => { onPick(st.value); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-left transition-colors ${
              active ? "bg-surface" : "hover:bg-surface"
            }`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
            <span className={`${active ? "font-semibold" : "font-normal"} ${st.text}`}>
              {st.label}
            </span>
            {active && <CheckCircleIcon size={13} className={`ml-auto ${st.text}`} weight="fill" />}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

// ─── Botón de estado inline ───────────────────────────────────────────────────
function StatusButton({ appointmentId, current, onChange }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const s = getStatus(current);

  async function pick(value) {
    if (value === current) return;
    setLoading(true);
    try {
      await appointmentsService.update(appointmentId, { status: value });
      onChange(appointmentId, value);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-[12px] font-medium transition-opacity disabled:opacity-40 focus-visible:outline-none ${s.text}`}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
        {loading ? "…" : s.label}
      </button>

      {open && btnRef.current && (
        <StatusMenu
          anchor={btnRef.current}
          current={current}
          onPick={pick}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    dashboardService.upcoming(8)
      .then(setAppointments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusChange(id, newStatus) {
    setAppointments((prev) =>
      newStatus === "cancelled"
        ? prev.filter((a) => a.id !== id)
        : prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  }

  if (loading) {
    return (
      <div className="py-10 text-center text-text-primary/30 text-[13px]">
        Cargando…
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-400 text-[13px]">
        Error al cargar las citas.
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-3 text-text-primary/30">
        <CalendarBlankIcon size={36} weight="thin" />
        <p className="text-[13px]">Sin próximas citas.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {appointments.map((appt) => (
        <li
          key={appt.id}
          className="rounded-xl border border-border/60 bg-surface px-3.5 py-3"
          style={{ borderLeftWidth: 3, borderLeftColor: appt.color ?? "#9ca3af" }}
        >
          {/* Título */}
          <p className="text-[13px] font-semibold text-text-primary leading-snug">
            {appt.title}
          </p>

          {/* Servicio */}
          {appt.service && (
            <p className="text-[11px] text-text-primary/45 mt-0.5 truncate">
              {appt.service}
            </p>
          )}

          {/* Fecha · Estado */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-[11px] text-text-primary/35 font-medium">
              {formatDateTime(appt.start)}
            </p>
            <StatusButton
              appointmentId={appt.id}
              current={appt.status}
              onChange={handleStatusChange}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
