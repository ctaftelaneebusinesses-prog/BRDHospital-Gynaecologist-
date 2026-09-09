import type { PatientDetails } from "./types";
import type { ReasonOption } from "../../lib/api/reasonOptions";
import { VoiceDictationButton } from "./VoiceDictationButton";
import { useLanguage } from "../../context/LanguageContext";

interface StepDetailsProps {
  patient: PatientDetails;
  errors: Partial<Record<keyof PatientDetails, string>>;
  reasonOptions: ReasonOption[];
  onChange: (field: keyof PatientDetails, value: string) => void;
  onToggleReasonTag: (label: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-plum/12 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-100";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-ink/55";

export function StepDetails({ patient, errors, reasonOptions, onChange, onToggleReasonTag }: StepDetailsProps) {
  const { t } = useLanguage();

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
            autoComplete="off"
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
            autoComplete="off"
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
            autoComplete="off"
            value={patient.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder={t("stepDetails.emailPlaceholder")}
            className={`${inputClass} ${errors.email ? errorClass : ""}`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("stepDetails.reason")}</label>

          <div className="flex flex-wrap gap-2">
            {reasonOptions.map((option) => {
              const selected = patient.reasonTags.includes(option.label);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onToggleReasonTag(option.label)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "border-rose-500 bg-rose-500 text-cream"
                      : "border-plum/15 bg-white text-ink/65 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <p className="mb-1.5 mt-4 text-xs text-ink/45">
            Select any that apply, describe it below, or use your voice — whatever's easiest.
          </p>
          <div className="relative">
            <textarea
              id="reason"
              rows={2}
              autoComplete="off"
              value={patient.reason}
              onChange={(e) => onChange("reason", e.target.value)}
              placeholder={t("stepDetails.reasonPlaceholder")}
              className={`${inputClass} resize-none pr-12 ${errors.reason ? errorClass : ""}`}
            />
            <VoiceDictationButton
              className="absolute bottom-2.5 right-2.5"
              onTranscript={(text) => onChange("reason", patient.reason ? `${patient.reason} ${text}` : text)}
            />
          </div>
          {errors.reason && <p className="mt-1.5 text-xs text-red-500">{errors.reason}</p>}
        </div>
      </div>
    </div>
  );
}
