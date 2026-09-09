import { useMemo, useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  XCircle,
  UserX,
  Wallet,
  IndianRupee,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { BookingCalendar } from "../../components/admin/BookingCalendar";
import { doctors } from "../../data/doctors";

function todayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];
}

function doctorName(id: string) {
  return doctors.find((d) => d.id === id)?.name ?? id;
}

interface StatCardProps {
  icon: typeof CalendarDays;
  label: string;
  value: string | number;
  tone?: "default" | "rose" | "sage" | "gold";
}

function StatCard({ icon: Icon, label, value, tone = "default" }: StatCardProps) {
  const toneClass = {
    default: "bg-plum/5 text-plum",
    rose: "bg-rose-50 text-rose-600",
    sage: "bg-sage-50 text-sage-600",
    gold: "bg-gold-300/30 text-[#8a6a1f]",
  }[tone];

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-plum/5">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={17} />
      </span>
      <p className="mt-3 font-serif text-2xl font-medium text-plum">{value}</p>
      <p className="mt-0.5 text-xs text-ink/50">{label}</p>
    </div>
  );
}

export function OverviewTab() {
  const { appointments, loading } = useAdminData();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = todayIso();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];

    const revenue = appointments
      .filter((a) => a.payment_status === "paid")
      .reduce((sum, a) => sum + (a.payment_amount ?? 0), 0);

    return {
      total: appointments.length,
      today: appointments.filter((a) => a.appointment_date === today).length,
      tomorrow: appointments.filter((a) => a.appointment_date === tomorrowIso).length,
      upcoming: appointments.filter((a) => a.appointment_date >= today && a.status !== "cancelled").length,
      completed: appointments.filter((a) => a.status === "completed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      noShow: appointments.filter((a) => a.status === "no-show").length,
      paymentPending: appointments.filter((a) => a.payment_status === "pending").length,
      paymentPaid: appointments.filter((a) => a.payment_status === "paid").length,
      paymentFailed: appointments.filter((a) => a.payment_status === "failed").length,
      revenue,
    };
  }, [appointments]);

  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of appointments) {
      if (a.status === "cancelled") continue;
      map[a.appointment_date] = (map[a.appointment_date] ?? 0) + 1;
    }
    return map;
  }, [appointments]);

  const dayAppointments = useMemo(
    () => (selectedDate ? appointments.filter((a) => a.appointment_date === selectedDate) : []),
    [appointments, selectedDate],
  );

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-plum">Overview</h1>
      <p className="mt-1 text-sm text-ink/55">A snapshot of bookings and revenue.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={CalendarDays} label="Total Appointments" value={stats.total} />
        <StatCard icon={CalendarClock} label="Today's Appointments" value={stats.today} tone="rose" />
        <StatCard icon={CalendarCheck} label="Upcoming" value={stats.upcoming} tone="sage" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} tone="sage" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} tone="rose" />
        <StatCard icon={UserX} label="No-shows" value={stats.noShow} tone="rose" />
        <StatCard icon={Clock3} label="Payment Pending" value={stats.paymentPending} tone="gold" />
        <StatCard icon={Wallet} label="Successful Payments" value={stats.paymentPaid} tone="sage" />
        <StatCard icon={AlertTriangle} label="Failed Payments" value={stats.paymentFailed} tone="rose" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${stats.revenue}`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <BookingCalendar countsByDate={countsByDate} selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
          {!selectedDate ? (
            <p className="text-sm text-ink/45">Select a date on the calendar to see its bookings.</p>
          ) : dayAppointments.length === 0 ? (
            <p className="text-sm text-ink/45">No appointments on {selectedDate}.</p>
          ) : (
            <>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink/45">
                {dayAppointments.length} appointment{dayAppointments.length === 1 ? "" : "s"} on {selectedDate}
              </p>
              <div className="space-y-3">
                {dayAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-xl bg-cream-dark/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-plum">{a.full_name}</p>
                      <p className="text-xs text-ink/50">
                        {a.appointment_time} · {doctorName(a.doctor_id)}
                      </p>
                    </div>
                    <span className="rounded-full bg-plum/8 px-2.5 py-1 text-[11px] font-medium capitalize text-plum/70">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
