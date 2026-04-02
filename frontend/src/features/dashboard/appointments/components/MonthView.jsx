import { COLORS, DAYS_SHORT, isSameDay, getMonthGrid } from "@/features/dashboard/appointments/helpers";

export default function MonthView({ currentDate, appointments, selected, onSelectAppt, onEditAppt, onDayClick }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = getMonthGrid(currentDate);
  const apptForDay = (day) => appointments.filter((a) => isSameDay(a.start, day));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-border shrink-0">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-text-primary/40">
            {d}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/50">
        {cells.map(({ date, outside }, i) => {
          const isToday = isSameDay(date, today);
          const dayAppts = apptForDay(date);
          return (
            <div
              key={i}
              onClick={() => onDayClick(date)}
              className={`p-1.5 min-h-[100px] cursor-cell ${
                outside ? "bg-surface/50" : "bg-canvas hover:bg-surface/40"
              } transition-colors`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center rounded-full text-[13px] font-medium mb-1 ${
                  isToday ? "bg-brand text-white" : outside ? "text-text-primary/25" : "text-text-primary"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayAppts.slice(0, 3).map((appt) => {
                  const c = COLORS[appt.color];
                  const isSelected = selected?.id === appt.id;
                  return (
                    <button
                      key={appt.id}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onSelectAppt(isSelected ? null : appt); }}
                      onDoubleClick={(e) => { e.stopPropagation(); onEditAppt(appt); }}
                      className={`w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded text-left hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand ${c.block} ${c.text} ${isSelected ? "ring-1 ring-brand" : ""}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                      <span className="text-[11px] font-medium truncate">{appt.title}</span>
                    </button>
                  );
                })}
                {dayAppts.length > 3 && (
                  <p className="text-[11px] text-text-primary/40 pl-1.5">+{dayAppts.length - 3} más</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
