import type { PatientDetails } from "./types";

interface StepDetailsProps {
  patient: PatientDetails;
  errors: Partial<Record<keyof PatientDetails, string>>;
  onChange: (field: keyof PatientDetails, value: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-plum/12 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-ink/55";

export function StepDetails({ patient, errors, onChange }: StepDetailsProps) {
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="fullName">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={patient.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Jane Doe"
            className={`${inputClass} ${errors.fullName ? errorClass : ""}`}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={patient.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={`${inputClass} ${errors.phone ? errorClass : ""}`}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={patient.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="jane@example.com"
            className={`${inputClass} ${errors.email ? errorClass : ""}`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="dob">
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            value={patient.dob}
            max={todayISO}
            onChange={(e) => onChange("dob", e.target.value)}
            className={`${inputClass} ${errors.dob ? errorClass : ""}`}
          />
          {errors.dob && <p className="mt-1.5 text-xs text-red-500">{errors.dob}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="reason">
            Reason for Visit
          </label>
          <input
            id="reason"
            type="text"
            value={patient.reason}
            onChange={(e) => onChange("reason", e.target.value)}
            placeholder="e.g. Routine checkup, pregnancy consultation..."
            className={`${inputClass} ${errors.reason ? errorClass : ""}`}
          />
          {errors.reason && <p className="mt-1.5 text-xs text-red-500">{errors.reason}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="message">
            Optional Message
          </label>
          <textarea
            id="message"
            rows={3}
            value={patient.message}
            onChange={(e) => onChange("message", e.target.value)}
            placeholder="Anything else you'd like us to know before your visit..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
