import { useEffect, useMemo, useState } from "react";
import { LogOut, RefreshCw, CalendarClock } from "lucide-react";
import {
  listAppointments,
  updateAppointmentStatus,
  type Appointment,
  type AppointmentStatus,
} from "../../lib/api/appointments";
import { signOut } from "../../lib/auth";
import { doctors } from "../../data/doctors";
import { appointmentServices } from "../../data/booking";
import { Logo } from "../../components/Logo";

const STATUS_FILTERS: (AppointmentStatus | "all")[] = ["all", "pending", "confirmed", "cancelled", "completed"];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-gold-300/40 text-[#8a6a1f]",
  confirmed: "bg-sage-100 text-sage-600",
  cancelled: "bg-rose-100 text-rose-600",
  completed: "bg-plum/10 text-plum",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

function doctorName(id: string) {
  return doctors.find((d) => d.id === id)?.name ?? id;
}

function serviceName(id: string) {
  return appointmentServices.find((s) => s.id === id)?.name ?? id;
}

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setAppointments(await listAppointments());
    } catch {
      setError("Couldn't load appointments. Make sure you're signed in and the backend is configured.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? appointments : appointments.filter((a) => a.status === filter)),
    [appointments, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: appointments.length };
    for (const a of appointments) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [appointments]);

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setUpdatingId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    } catch {
      setError("Couldn't update that appointment. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-cream-dark/40">
      <header className="flex items-center justify-between border-b border-plum/8 bg-cream px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Logo className="h-8 w-8" />
          <span className="font-serif text-lg font-medium text-plum">Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/60 hover:bg-plum/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 rounded-full bg-plum/5 px-3 py-1.5 text-sm text-plum hover:bg-plum/10"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filter === status ? "bg-plum text-cream" : "bg-white text-ink/60 ring-1 ring-plum/10 hover:bg-plum/5"
              }`}
            >
              {status} {counts[status] ? `(${counts[status]})` : ""}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

        {loading ? (
          <p className="text-sm text-ink/50">Loading appointments…</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] bg-white py-16 text-center shadow-card ring-1 ring-plum/5">
            <CalendarClock className="text-ink/30" size={32} />
            <p className="text-sm text-ink/50">No appointments here yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-plum/8 bg-plum/[0.03] text-xs uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Service / Doctor</th>
                  <th className="px-5 py-3 font-medium">Date &amp; Time</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-plum/8">
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-plum">{a.full_name}</p>
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-ink/45">{a.reason}</p>
                    </td>
                    <td className="px-5 py-4 text-ink/70">
                      <p>{serviceName(a.service_id)}</p>
                      <p className="text-xs text-ink/45">{doctorName(a.doctor_id)}</p>
                    </td>
                    <td className="px-5 py-4 text-ink/70">
                      <p>{DATE_FORMAT.format(new Date(a.appointment_date + "T00:00:00"))}</p>
                      <p className="text-xs text-ink/45">{a.appointment_time}</p>
                    </td>
                    <td className="px-5 py-4 text-ink/70">
                      <p>{a.phone}</p>
                      <p className="text-xs text-ink/45">{a.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={a.status}
                        disabled={updatingId === a.id}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as AppointmentStatus)}
                        className="rounded-lg border border-plum/15 bg-cream px-2 py-1.5 text-xs text-plum outline-none disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
