import { Clock } from "lucide-react";
import { timeSlots } from "../../data/booking";
import { useLanguage } from "../../context/LanguageContext";

interface TimeSlotSelectorProps {
  selected: string | null;
  onSelect: (time: string) => void;
  unavailable?: string[];
}

export function TimeSlotSelector({ selected, onSelect, unavailable = [] }: TimeSlotSelectorProps) {
  const { t } = useLanguage();
  const morning = timeSlots.filter((slot) => slot.includes("AM"));
  const afternoon = timeSlots.filter((slot) => slot.includes("PM"));

  function renderGroup(label: string, slots: string[]) {
    return (
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink/45">{label}</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((time) => {
            const isDisabled = unavailable.includes(time);
            const isSelected = selected === time;
            return (
              <button
                key={time}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(time)}
                className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                  isSelected
                    ? "border-rose-600 bg-rose-600 text-cream shadow-md"
                    : isDisabled
                      ? "cursor-not-allowed border-plum/5 bg-plum/5 text-ink/30 line-through"
                      : "border-plum/10 bg-white text-ink/70 hover:border-rose-300 hover:bg-rose-50"
                }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-7">
      <div className="flex items-center gap-2 text-sm text-ink/50">
        <Clock size={15} />
        {t("timeSlot.timezoneNote")}
      </div>
      {renderGroup(t("timeSlot.morning"), morning)}
      {renderGroup(t("timeSlot.afternoon"), afternoon)}
    </div>
  );
}
