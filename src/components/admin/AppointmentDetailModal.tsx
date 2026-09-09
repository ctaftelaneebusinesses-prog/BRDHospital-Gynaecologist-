import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { Appointment, AppointmentStatus, PaymentStatus } from "../../lib/api/appointments";

interface AppointmentDetailModalProps {
  appointment: Appointment;
  doctorName: string;
  serviceName: string;
  onClose: () => void;
}

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
const DATETIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      <span className="text-right text-sm font-medium text-plum">{value}</span>
    </div>
  );
}

export function AppointmentDetailModal({ appointment: a, doctorName, serviceName, onClose }: AppointmentDetailModalProps) {
  const reasonCombined = [...(a.reason_tags ?? []), a.reason].filter(Boolean).join(", ") || "—";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-plum/8 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Appointment Details</p>
            <h2 className="mt-0.5 font-serif text-xl font-medium text-plum">{a.full_name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-plum/60 hover:bg-plum/5 hover:text-plum"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[a.status]}`}>
              Status: {a.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${PAYMENT_STYLES[a.payment_status]}`}>
              Payment: {a.payment_status}
            </span>
          </div>

          <div className="mt-2 divide-y divide-plum/8">
            <Row label="Full Name" value={a.full_name} />
            <Row label="Phone" value={a.phone} />
            <Row label="Email" value={a.email || <span className="text-ink/35">Not provided</span>} />
            <Row
              label="UPI Transaction ID"
              value={a.upi_transaction_id || <span className="text-ink/35">Not provided</span>}
            />
            <Row label="Doctor" value={doctorName} />
            <Row label="Service" value={serviceName} />
            <Row label="Appointment Date" value={DATE_FORMAT.format(new Date(a.appointment_date + "T00:00:00"))} />
            <Row label="Appointment Time" value={a.appointment_time} />
            <Row label="Reason" value={<span className="text-right">{reasonCombined}</span>} />
            <Row label="Payment Amount" value={a.payment_amount != null ? `₹${a.payment_amount}` : "—"} />
            <Row
              label="Payment Confirmed At"
              value={a.payment_confirmed_at ? DATETIME_FORMAT.format(new Date(a.payment_confirmed_at)) : "—"}
            />
            <Row label="Booked At" value={DATETIME_FORMAT.format(new Date(a.created_at))} />
          </div>
        </div>
      </div>
    </div>
  );
}
