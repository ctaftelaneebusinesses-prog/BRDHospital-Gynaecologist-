import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function toIsoDate(d: Date): string {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const offset = copy.getTimezoneOffset();
  return new Date(copy.getTime() - offset * 60000).toISOString().split("T")[0];
}

interface BookingCalendarProps {
  /** ISO date -> count of appointments on that date. */
  countsByDate: Record<string, number>;
  selectedDate: string | null;
  onSelectDate: (isoDate: string | null) => void;
}

export function BookingCalendar({ countsByDate, selectedDate, onSelectDate }: BookingCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayIso = toIsoDate(new Date());
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-serif text-base font-medium text-plum">{MONTH_FORMAT.format(viewDate)}</p>
        <div className="flex gap-1">
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-plum/5"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-plum/5"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="py-1 text-[11px] font-semibold uppercase text-ink/35">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const iso = toIsoDate(date);
          const count = countsByDate[iso] ?? 0;
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          return (
            <button
              key={iso}
              onClick={() => onSelectDate(isSelected ? null : iso)}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-xs transition-colors ${
                isSelected
                  ? "bg-rose-600 text-cream"
                  : isToday
                    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                    : count > 0
                      ? "bg-sage-50 text-plum hover:bg-sage-100"
                      : "text-ink/60 hover:bg-plum/5"
              }`}
            >
              {date.getDate()}
              {count > 0 && (
                <span
                  className={`mt-0.5 rounded-full px-1 text-[9px] font-semibold ${
                    isSelected ? "bg-cream/25 text-cream" : "bg-sage-500 text-cream"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
