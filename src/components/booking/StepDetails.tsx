import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { PatientDetails } from "./types";
import { getReasonLabel, type ReasonOption } from "../../lib/api/reasonOptions";
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
  const { t, language } = useLanguage();
  const [reasonOpen, setReasonOpen] = useState(false);
  const reasonRef = useRef<HTMLDivElement>(null);
  const reasonPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (reasonRef.current && !reasonRef.current.contains(e.target as Node)) setReasonOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (reasonOpen) reasonPanelRef.current?.scrollIntoView({ block: "nearest" });
  }, [reasonOpen]);

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
          {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{t(errors.fullName)}</p>}
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
          {errors.phone && <p className="mt-1.5 text-xs text-red-500">{t(errors.phone)}</p>}
        </div>

        <div>
          <label className={labelClass} htmlFor="email">
            {t("stepDetails.email")} <span className="normal-case text-ink/35">({t("stepDetails.optional")})</span>
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
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{t(errors.email)}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t("stepDetails.reason")}</label>

          <div ref={reasonRef}>
            <button
              type="button"
              onClick={() => setReasonOpen((v) => !v)}
              aria-expanded={reasonOpen}
              className={`${inputClass} flex items-center justify-between gap-3 text-left ${errors.reason ? errorClass : ""}`}
            >
              <span className={`truncate ${patient.reasonTags.length ? "text-ink" : "text-ink/35"}`}>
                {patient.reasonTags.length
                  ? patient.reasonTags
                      .map((label) => {
                        const option = reasonOptions.find((o) => o.label === label);
                        return option ? getReasonLabel(option, language) : label;
                      })
                      .join(", ")
                  : t("stepDetails.reasonDropdownPlaceholder")}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-ink/40 transition-transform duration-200 ${reasonOpen ? "rotate-180" : ""}`}
              />
            </button>

            {reasonOpen && (
              <div
                ref={reasonPanelRef}
                className="relative z-10 mt-2 max-h-64 w-full touch-pan-y overflow-y-auto overscroll-contain rounded-2xl border border-plum/10 bg-white p-2 shadow-card"
              >
                {reasonOptions.map((option) => {
                  const selected = patient.reasonTags.includes(option.label);
                  return (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-plum transition-colors hover:bg-rose-50"
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selected}
                        onChange={() => onToggleReasonTag(option.label)}
                      />
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                          selected ? "border-rose-500 bg-rose-500" : "border-plum/20 bg-white"
                        }`}
                      >
                        {selected && <Check size={13} strokeWidth={3} className="text-cream" />}
                      </span>
                      {getReasonLabel(option, language)}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mb-1.5 mt-4 text-xs text-ink/45">{t("stepDetails.reasonHelper")}</p>
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
          {errors.reason && <p className="mt-1.5 text-xs text-red-500">{t(errors.reason)}</p>}
        </div>
      </div>
    </div>
  );
}
