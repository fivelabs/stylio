export const MONTHS_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export const DAYS_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export const HOUR_HEIGHT = 64;
export const START_HOUR = 7;
export const END_HOUR = 22;
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);

export const COLORS = {
  brand:   { block: "bg-brand/15 border-l-[3px] border-brand",         text: "text-brand-dark",  dot: "bg-brand",      swatch: "bg-brand" },
  rose:    { block: "bg-rose-100 border-l-[3px] border-rose-400",      text: "text-rose-800",    dot: "bg-rose-400",   swatch: "bg-rose-400" },
  indigo:  { block: "bg-indigo-100 border-l-[3px] border-indigo-400",  text: "text-indigo-800",  dot: "bg-indigo-400", swatch: "bg-indigo-400" },
  emerald: { block: "bg-emerald-100 border-l-[3px] border-emerald-500",text: "text-emerald-800", dot: "bg-emerald-500",swatch: "bg-emerald-500" },
  amber:   { block: "bg-amber-100 border-l-[3px] border-amber-400",    text: "text-amber-800",   dot: "bg-amber-400",  swatch: "bg-amber-400" },
};

export const INPUT_CLASS =
  "w-full px-3 py-2 rounded-lg bg-surface border border-border text-[14px] text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-colors";

export const pad = (n) => String(n).padStart(2, "0");

export function toDateStr(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toTimeStr(hour, minute = 0) {
  return `${pad(hour)}:${pad(minute)}`;
}

export function makeDate(base, dayOffset, hour, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatTime(date) {
  return date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function getMonthGrid(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), outside: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), outside: false });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ date: new Date(year, month + 1, i), outside: true });
  }
  return cells;
}

export function calcEventStyle(appt) {
  const startMin = (appt.start.getHours() - START_HOUR) * 60 + appt.start.getMinutes();
  const endMin = (appt.end.getHours() - START_HOUR) * 60 + appt.end.getMinutes();
  return {
    top: (startMin / 60) * HOUR_HEIGHT,
    height: Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 26),
  };
}
