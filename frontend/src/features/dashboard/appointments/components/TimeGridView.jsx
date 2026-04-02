import { useRef, useEffect } from "react";
import {
  COLORS, DAYS_SHORT, HOURS, HOUR_HEIGHT, START_HOUR, END_HOUR,
  isSameDay, formatTime, calcEventStyle,
} from "@/features/dashboard/appointments/helpers";

export default function TimeGridView({ days, appointments, selected, onSelectAppt, onEditAppt, onDayClick, onDaySelect }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (8 - START_HOUR) * HOUR_HEIGHT;
    }
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const now = new Date();
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNowLine = now.getHours() >= START_HOUR && now.getHours() < END_HOUR;

  const apptForDay = (day) => appointments.filter((a) => isSameDay(a.start, day));

  const handleColumnClick = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const totalMinutes = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const rounded = Math.round(totalMinutes / 30) * 30;
    onDayClick(day, Math.floor(rounded / 60), rounded % 60);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex shrink-0 border-b border-border bg-canvas">
        <div className="w-14 shrink-0" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          const isMulti = days.length > 1;

          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${i < days.length - 1 ? "border-r border-border/30" : ""}`}
            >
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-primary/40">
                {DAYS_SHORT[day.getDay()]}
              </span>
              <button
                type="button"
                onClick={() => onDaySelect?.(day)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  isToday
                    ? `bg-brand text-white ${isMulti ? "hover:bg-brand-dark" : "cursor-default"}`
                    : isMulti
                      ? "text-text-primary hover:bg-black/[0.06]"
                      : "text-text-primary cursor-default"
                }`}
              >
                {day.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          <div className="w-14 shrink-0 relative select-none">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-3 text-[11px] text-text-primary/35"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT - 8 }}
              >
                {h < 10 ? `0${h}` : h}:00
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-border/60"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
              />
            ))}
            {HOURS.map((h) => (
              <div
                key={`half-${h}`}
                className="absolute left-0 right-0 border-t border-border/25"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2, borderTopStyle: "dashed" }}
              />
            ))}

            {showNowLine && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                style={{ top: nowTop }}
              >
                <div className="w-2 h-2 rounded-full bg-brand shrink-0 -ml-1" />
                <div className="flex-1 border-t-[1.5px] border-brand" />
              </div>
            )}

            <div
              className="absolute inset-0 grid"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((day, dayIdx) => (
                <div
                  key={dayIdx}
                  onClick={(e) => handleColumnClick(e, day)}
                  className={`relative h-full cursor-cell ${dayIdx > 0 ? "border-l border-border/30" : ""}`}
                >
                  {apptForDay(day).map((appt) => {
                    const { top, height } = calcEventStyle(appt);
                    const c = COLORS[appt.color];
                    const isSelected = selected?.id === appt.id;
                    return (
                      <button
                        key={appt.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onSelectAppt(isSelected ? null : appt); }}
                        onDoubleClick={(e) => { e.stopPropagation(); onEditAppt(appt); }}
                        className={`absolute left-1 right-1 rounded px-1.5 py-1 text-left overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 ${c.block} ${isSelected ? "ring-2 ring-brand ring-offset-1" : "hover:opacity-90"}`}
                        style={{ top, height }}
                      >
                        <p className={`text-[11px] font-semibold leading-tight truncate ${c.text}`}>{appt.title}</p>
                        {height > 36 && (
                          <p className={`text-[10px] leading-tight truncate opacity-75 ${c.text}`}>{appt.service}</p>
                        )}
                        {height > 54 && (
                          <p className={`text-[10px] leading-tight opacity-55 ${c.text}`}>
                            {formatTime(appt.start)} – {formatTime(appt.end)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
