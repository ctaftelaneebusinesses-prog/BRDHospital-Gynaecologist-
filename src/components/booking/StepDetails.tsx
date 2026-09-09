import type { PatientDetails } from "./types";
import { useLanguage } from "../../context/LanguageContext";

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
  const { t } = useLanguage();
  const todayISO = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="fullName">
            {t("stepDetails.fullName")}
          </label>
          <input
            id="fullName"
            type="text"
            value={patient.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder={t("stepDetails.fullNamePlaceholder")}
            className={`${inputClass} ${errors.fullName ? errorClass : ""}`}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            {t("stepDetails.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            value={patient.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder={t("stepDetails.phonePlaceholder")}
            className={`${inputClass} ${errors.phone ? errorClass : ""}`}
          />
          {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            {t("stepDetails.email")}
          </label>
          <input
            id="email"
            type="email"
            value={patient.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={t("stepDetails.emailPlaceholder")}
            className={`${inputClass} ${errors.email ? errorClass : ""}`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="dob">
            {t("stepDetails.dob")}
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
            {t("stepDetails.reason")}
          </label>
          <input
            id="reason"
            type="text"
            value={patient.reason}
            onChange={(e) => onChange("reason", e.target.value)}
            placeholder={t("stepDetails.reasonPlaceholder")}
            className={`${inputClass} ${errors.reason ? errorClass : ""}`}
          />
          {errors.reason && <p className="mt-1.5 text-xs text-red-500">{errors.reason}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="message">
            {t("stepDetails.message")}
          </label>
          <textarea
            id="message"
            rows={3}
            value={patient.message}
            onChange={(e) => onChange("message", e.target.value)}
            placeholder={t("stepDetails.messagePlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
