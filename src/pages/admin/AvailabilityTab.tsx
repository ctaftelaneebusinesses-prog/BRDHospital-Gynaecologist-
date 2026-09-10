import { useEffect, useMemo, useState } from "react";
import { CalendarOff, Ban, Trash2, Clock } from "lucide-react";
import {
  listBlockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
  type BlockedSlot,
} from "../../lib/api/blockedSlots";
import { doctors } from "../../data/doctors";
import { timeSlots } from "../../data/booking";

const selectedDoctor = doctors[0];

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

function todayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

function isoToDate(iso: string): Date {
  return new Date(iso + "T00:00:00");
}

export function AvailabilityTab() {
  const [entries, setEntries] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  function refresh() {
    setLoading(true);
    listBlockedSlots(selectedDoctor.id, isoToDate(todayIso()))
      .then(setEntries)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  const entriesForDate = useMemo(
    () => entries.filter((e) => e.blocked_date === selectedDate),
    [entries, selectedDate],
  );
  const wholeDayEntry = entriesForDate.find((e) => e.blocked_time === null);
  const blockedTimesForDate = new Set(entriesForDate.filter((e) => e.blocked_time !== null).map((e) => e.blocked_time));

  const upcoming = useMemo(
    () => [...entries].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)),
    [entries],
  );

  async function handleToggleSlot(time: string) {
    const existing = entriesForDate.find((e) => e.blocked_time === time);
    setSaving(time);
    try {
      if (existing) {
        await removeBlockedSlot(existing.id);
      } else {
        await addBlockedSlot(selectedDoctor.id, isoToDate(selectedDate), time, reason);
      }
      refresh();
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleWholeDay() {
    setSaving("whole-day");
    try {
      if (wholeDayEntry) {
        await removeBlockedSlot(wholeDayEntry.id);
      } else {
        await addBlockedSlot(selectedDoctor.id, isoToDate(selectedDate), null, reason);
      }
      refresh();
    } finally {
      setSaving(null);
    }
  }

  async function handleRemove(id: string) {
    setSaving(id);
    try {
      await removeBlockedSlot(id);
      refresh();
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-plum">Availability</h1>
      <p className="mt-1 text-sm text-ink/55">
        Block a specific time slot or an entire day when {selectedDoctor.name} isn't available — on top of the
        regular {timeSlots[0]}–{timeSlots[timeSlots.length - 1]} schedule.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">Date</label>
          <input
            type="date"
            value={selectedDate}
            min={todayIso()}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
          />

          <label className="mb-1.5 mt-4 block text-xs font-semibold uppercase tracking-wide text-ink/55">
            Reason (optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Personal leave, conference"
            className="w-full rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
          />

          <button
            onClick={handleToggleWholeDay}
            disabled={saving !== null}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              wholeDayEntry
                ? "bg-sage-600 text-cream hover:bg-sage-700"
                : "bg-rose-600 text-cream hover:bg-rose-700"
            }`}
          >
            <CalendarOff size={15} />
            {wholeDayEntry ? "Unblock This Day" : "Block Entire Day"}
          </button>

          <p className="mt-3 text-xs text-ink/45">
            {wholeDayEntry
              ? "The whole day is currently blocked — patients can't book any slot on this date."
              : "Individual slots below still apply unless you block the whole day."}
          </p>
        </div>

        <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-plum">
            <Clock size={15} /> Slots on {DATE_FORMAT.format(isoToDate(selectedDate))}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {timeSlots.map((time) => {
              const isBlocked = blockedTimesForDate.has(time);
              const disabled = saving !== null || Boolean(wholeDayEntry);
              return (
                <button
                  key={time}
                  onClick={() => handleToggleSlot(time)}
                  disabled={disabled}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                    isBlocked
                      ? "border-rose-300 bg-rose-50 text-rose-600 line-through"
                      : "border-plum/10 bg-white text-ink/70 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/45">
            <Ban size={13} /> Tap a slot to block it; tap again to unblock.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
        <h2 className="font-serif text-lg font-medium text-plum">Upcoming Blocked Dates &amp; Slots</h2>
        {loading ? (
          <p className="mt-4 text-sm text-ink/50">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">Nothing blocked yet — the full schedule is open.</p>
        ) : (
          <ul className="mt-4 divide-y divide-plum/8">
            {upcoming.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-plum">
                    {DATE_FORMAT.format(isoToDate(entry.blocked_date))}
                    {entry.blocked_time ? ` · ${entry.blocked_time}` : " · Entire day"}
                  </p>
                  {entry.reason && <p className="text-xs text-ink/50">{entry.reason}</p>}
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  disabled={saving !== null}
                  aria-label="Unblock"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
