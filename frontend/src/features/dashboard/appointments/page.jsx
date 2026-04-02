import { useState, useEffect } from "react";
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from "@phosphor-icons/react";
import {
  MONTHS_FULL, MONTHS_SHORT, HOUR_HEIGHT, START_HOUR, END_HOUR,
  getWeekStart, toDateStr, toTimeStr,
} from "@/features/dashboard/appointments/helpers";
import TimeGridView from "@/features/dashboard/appointments/components/TimeGridView";
import MonthView from "@/features/dashboard/appointments/components/MonthView";
import AppointmentModal from "@/features/dashboard/appointments/components/AppointmentModal";
import { appointmentsService } from "@/api/appointments.service";

const VIEWS = [
  { key: "day", label: "Día" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
];

function getCalendarTitle(view, currentDate, weekDays) {
  if (view === "month") return `${MONTHS_FULL[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  if (view === "day") return `${currentDate.getDate()} de ${MONTHS_SHORT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  const [s, e] = [weekDays[0], weekDays[6]];
  if (s.getMonth() === e.getMonth()) return `${MONTHS_FULL[s.getMonth()]} ${s.getFullYear()}`;
  return `${MONTHS_FULL[s.getMonth()]} – ${MONTHS_FULL[e.getMonth()]} ${e.getFullYear()}`;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [editingAppt, setEditingAppt] = useState(null);

  useEffect(() => {
    appointmentsService
      .list()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== "Delete" || !selected || modal || editingAppt) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      appointmentsService
        .delete(selected.id)
        .then(() => {
          setAppointments((prev) => prev.filter((a) => a.id !== selected.id));
          setSelected(null);
        })
        .catch(console.error);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selected, modal, editingAppt]);

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const navigate = (dir) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "week") d.setDate(d.getDate() + dir * 7);
      else if (view === "day") d.setDate(d.getDate() + dir);
      else d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const openCreateModal = (date, startHour = 9, startMinute = 0) => {
    const rounded = Math.round(startMinute / 30) * 30;
    const h = Math.min(Math.max(startHour + Math.floor(rounded / 60), START_HOUR), END_HOUR - 1);
    const m = rounded % 60;
    setSelected(null);
    setModal({ dateStr: toDateStr(date), startStr: toTimeStr(h, m), endStr: toTimeStr(Math.min(h + 1, END_HOUR), m) });
  };

  const openEditModal = (appt) => {
    setEditingAppt(appt);
    setSelected(null);
  };

  const handleCreate = async (formData) => {
    const created = await appointmentsService.create({
      title:   formData.title,
      service: formData.service,
      start:   formData.start.toISOString(),
      end:     formData.end.toISOString(),
      color:   formData.color,
      status:  formData.status,
    });
    setAppointments((prev) => [...prev, created]);
    setModal(null);
  };

  const handleUpdate = async (formData) => {
    const updated = await appointmentsService.update(editingAppt.id, {
      title:   formData.title,
      service: formData.service,
      start:   formData.start.toISOString(),
      end:     formData.end.toISOString(),
      color:   formData.color,
      status:  formData.status,
    });
    setAppointments((prev) => prev.map((a) => (a.id === editingAppt.id ? updated : a)));
    setEditingAppt(null);
  };

  const handleDeleteFromModal = async () => {
    await appointmentsService.delete(editingAppt.id);
    setAppointments((prev) => prev.filter((a) => a.id !== editingAppt.id));
    setEditingAppt(null);
  };

  const title = getCalendarTitle(view, currentDate, weekDays);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0 bg-canvas">
        <h1 className="font-heading text-[17px] font-semibold text-accent min-w-[200px]">{title}</h1>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-text-primary/50 hover:bg-black/[0.04] hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <CaretLeftIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg text-text-primary/50 hover:bg-black/[0.04] hover:text-text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <CaretRightIcon size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-primary/60 border border-border hover:border-brand/50 hover:text-brand transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Hoy
        </button>

        <div className="flex-1" />

        <div className="flex items-center bg-surface rounded-lg p-0.5">
          {VIEWS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${view === key ? "bg-canvas text-text-primary shadow-sm" : "text-text-primary/45 hover:text-text-primary"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openCreateModal(new Date())}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <PlusIcon size={15} weight="bold" />
          Nueva cita
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[13px] text-text-primary/30">Cargando citas…</span>
          </div>
        ) : view === "month" ? (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            selected={selected}
            onSelectAppt={setSelected}
            onEditAppt={openEditModal}
            onDayClick={(date) => openCreateModal(date)}
          />
        ) : (
          <TimeGridView
            key={view}
            days={view === "day" ? [currentDate] : weekDays}
            appointments={appointments}
            selected={selected}
            onSelectAppt={setSelected}
            onEditAppt={openEditModal}
            onDayClick={openCreateModal}
            onDaySelect={(day) => { setCurrentDate(day); if (view === "week") setView("day"); }}
          />
        )}
      </div>

      {modal && (
        <AppointmentModal
          initial={modal}
          onClose={() => setModal(null)}
          onSave={handleCreate}
        />
      )}

      {editingAppt && (
        <AppointmentModal
          appointment={editingAppt}
          onClose={() => setEditingAppt(null)}
          onSave={handleUpdate}
          onDelete={handleDeleteFromModal}
        />
      )}
    </div>
  );
}
