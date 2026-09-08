import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  const today = startOfDay(new Date());
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const canGoPrev = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1) > new Date(today.getFullYear(), today.getMonth(), 1);
  const canGoNext = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1) < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1)),
  ];

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-plum transition-colors hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="font-serif text-base font-medium text-plum">{MONTH_FORMAT.format(viewDate)}</p>
        <button
          type="button"
          disabled={!canGoNext}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-plum transition-colors hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((day, i) => (
          <span key={`${day}-${i}`} className="text-xs font-semibold uppercase text-ink/40">
            {day}
          </span>
        ))}

        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const disabled = date < today;
          const isSelected = selected && isSameDay(date, selected);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-rose-600 text-cream shadow-md"
                  : disabled
                    ? "text-ink/25"
                    : "text-ink/75 hover:bg-rose-50"
              }`}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-rose-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
