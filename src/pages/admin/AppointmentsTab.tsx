import { useMemo, useState } from "react";
import { Download, RefreshCw, CalendarClock, Search, X } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import {
  updateAppointmentStatus,
  updatePaymentStatus,
  type Appointment,
  type AppointmentStatus,
  type PaymentStatus,
} from "../../lib/api/appointments";
import { doctors } from "../../data/doctors";
import { appointmentServices } from "../../data/booking";
import { downloadCsv } from "../../lib/csvExport";
import { sendConfirmationEmail } from "../../lib/api/notifications";
import { AppointmentDetailModal } from "../../components/admin/AppointmentDetailModal";

const STATUS_FILTERS: (AppointmentStatus | "all")[] = [
  "all",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no-show",
];

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-gold-300/40 text-[#8a6a1f]",
  confirmed: "bg-sage-100 text-sage-600",
  cancelled: "bg-rose-100 text-rose-600",
  completed: "bg-plum/10 text-plum",
  "no-show": "bg-ink/10 text-ink/60",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-gold-300/40 text-[#8a6a1f]",
  paid: "bg-sage-100 text-sage-600",
  failed: "bg-rose-100 text-rose-600",
};

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });

function doctorName(id: string) {
  return doctors.find((d) => d.id === id)?.name ?? id;
}
function serviceName(id: string) {
  return appointmentServices.find((s) => s.id === id)?.name ?? id;
}

export function AppointmentsTab() {
  const { appointments, loading, error, refresh } = useAdminData();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return appointments.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (dateFilter && a.appointment_date !== dateFilter) return false;
      if (term) {
        const haystack = [a.full_name, a.phone, a.email ?? "", a.upi_transaction_id ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [appointments, filter, search, dateFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: appointments.length };
    for (const a of appointments) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [appointments]);

  /** Fires the "your appointment is confirmed" email once status + payment are both good — never before. */
  function notifyIfFullyConfirmed(appointment: Appointment, status: AppointmentStatus, paymentStatus: PaymentStatus) {
    if (status !== "confirmed" || paymentStatus !== "paid") return;
    if (!appointment.email) return; // no email on file — nothing to send to
    sendConfirmationEmail({
      toEmail: appointment.email,
      toName: appointment.full_name,
      doctorName: doctorName(appointment.doctor_id),
      serviceName: serviceName(appointment.service_id),
      date: new Date(appointment.appointment_date + "T00:00:00"),
      time: appointment.appointment_time,
    });
  }

  async function handleStatusChange(appointment: Appointment, status: AppointmentStatus) {
    setUpdatingId(appointment.id);
    try {
      await updateAppointmentStatus(appointment.id, status);
      notifyIfFullyConfirmed(appointment, status, appointment.payment_status);
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handlePaymentChange(appointment: Appointment, paymentStatus: PaymentStatus) {
    setUpdatingId(appointment.id);
    try {
      await updatePaymentStatus(appointment.id, paymentStatus);
      notifyIfFullyConfirmed(appointment, appointment.status, paymentStatus);
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  function handleExport() {
    downloadCsv(
      `appointments-${new Date().toISOString().split("T")[0]}.csv`,
      ["Patient", "Phone", "Email", "UPI Transaction ID", "Doctor", "Service", "Date", "Time", "Reason", "Status", "Payment Status", "Amount", "Booked At"],
      filtered.map((a) => [
        a.full_name,
        a.phone,
        a.email ?? "",
        a.upi_transaction_id ?? "",
        doctorName(a.doctor_id),
        serviceName(a.service_id),
        a.appointment_date,
        a.appointment_time,
        [...(a.reason_tags ?? []), a.reason].filter(Boolean).join("; "),
        a.status,
        a.payment_status,
        a.payment_amount ?? "",
        a.created_at,
      ]),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-plum">Appointments</h1>
          <p className="mt-1 text-sm text-ink/55">{appointments.length} total bookings.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream hover:bg-plum/90"
          >
            <Download size={14} /> Download Excel
          </button>
          <button
            onClick={() => refresh()}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink/60 hover:bg-plum/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
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

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, or UPI ID…"
            className="w-full rounded-full border border-plum/12 bg-white py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-rose-400"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-full border border-plum/12 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose-400"
          />
          {(dateFilter || search) && (
            <button
              onClick={() => {
                setDateFilter("");
                setSearch("");
              }}
              aria-label="Clear filters"
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/40 hover:bg-plum/5 hover:text-ink/70"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading appointments…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-[1.75rem] bg-white py-16 text-center shadow-card ring-1 ring-plum/5">
          <CalendarClock className="text-ink/30" size={32} />
          <p className="text-sm text-ink/50">No appointments here yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-plum/8 bg-plum/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Date &amp; Time</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum/8">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-plum/[0.02]">
                  <td
                    className="cursor-pointer px-5 py-4"
                    onClick={() => setSelected(a)}
                    title="Click to view full details"
                  >
                    <p className="font-medium text-plum hover:underline">{a.full_name}</p>
                    <p className="text-xs text-ink/45">{doctorName(a.doctor_id)}</p>
                  </td>
                  <td className="max-w-[220px] px-5 py-4">
                    {a.reason_tags?.length > 0 && (
                      <div className="mb-1 flex flex-wrap gap-1">
                        {a.reason_tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-sage-50 px-2 py-0.5 text-[10px] font-medium text-sage-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {a.reason && <p className="truncate text-xs text-ink/50">{a.reason}</p>}
                  </td>
                  <td className="px-5 py-4 text-ink/70">
                    <p>{DATE_FORMAT.format(new Date(a.appointment_date + "T00:00:00"))}</p>
                    <p className="text-xs text-ink/45">{a.appointment_time}</p>
                  </td>
                  <td className="px-5 py-4 text-ink/70">
                    <p>{a.phone}</p>
                    <p className="text-xs text-ink/45">{a.email || <span className="italic text-ink/30">no email</span>}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={a.status}
                      disabled={updatingId === a.id}
                      onChange={(e) => handleStatusChange(a, e.target.value as AppointmentStatus)}
                      className={`rounded-lg border-none px-2 py-1.5 text-xs font-medium capitalize outline-none disabled:opacity-50 ${STATUS_STYLES[a.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="no-show">No-show</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={a.payment_status}
                      disabled={updatingId === a.id}
                      onChange={(e) => handlePaymentChange(a, e.target.value as PaymentStatus)}
                      className={`rounded-lg border-none px-2 py-1.5 text-xs font-medium capitalize outline-none disabled:opacity-50 ${PAYMENT_STYLES[a.payment_status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                    </select>
                    {a.payment_amount != null && (
                      <p className="mt-1 text-[11px] text-ink/40">₹{a.payment_amount}</p>
                    )}
                    {a.upi_transaction_id && (
                      <p className="mt-0.5 truncate text-[11px] text-ink/40" title={a.upi_transaction_id}>
                        UTR: {a.upi_transaction_id}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <AppointmentDetailModal
          appointment={selected}
          doctorName={doctorName(selected.doctor_id)}
          serviceName={serviceName(selected.service_id)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
