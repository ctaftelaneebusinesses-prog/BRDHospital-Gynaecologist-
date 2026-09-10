import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/Button";
import { DatePicker } from "../components/booking/DatePicker";
import { TimeSlotSelector } from "../components/booking/TimeSlotSelector";
import { StepDetails } from "../components/booking/StepDetails";
import { StepPayment } from "../components/booking/StepPayment";
import { StepConfirmation } from "../components/booking/StepConfirmation";
import { emptyBookingState, type BookingState, type PatientDetails } from "../components/booking/types";
import { appointmentServices, timeSlots } from "../data/booking";
import { doctors } from "../data/doctors";
import { createAppointment, getBookedSlots, BookingError } from "../lib/api/appointments";
import { getBlockedSlotsForDate } from "../lib/api/blockedSlots";
import { notifyNewBooking } from "../lib/api/notifications";
import { getActiveReasonOptions, type ReasonOption } from "../lib/api/reasonOptions";
import { getSettings, type AppSettings } from "../lib/api/settings";
import { useLanguage } from "../context/LanguageContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,}$/;
const LAST_STEP = 4;

const selectedDoctor = doctors[0];
const selectedService = appointmentServices[0];

export function BookingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const STEP_LABELS = [
    t("booking.stepDate"),
    t("booking.stepTime"),
    t("booking.stepDetails"),
    t("booking.stepPayment"),
    t("booking.stepConfirm"),
  ];
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BookingState>(emptyBookingState);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientDetails, string>>>({});
  const [serverBookedSlots, setServerBookedSlots] = useState<string[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<{ wholeDayBlocked: boolean; times: string[] }>({
    wholeDayBlocked: false,
    times: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reasonOptions, setReasonOptions] = useState<ReasonOption[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getActiveReasonOptions().then(setReasonOptions);
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (!state.date) {
      setServerBookedSlots([]);
      setBlockedSlots({ wholeDayBlocked: false, times: [] });
      return;
    }
    let cancelled = false;
    getBookedSlots(selectedDoctor.id, state.date).then((slots) => {
      if (!cancelled) setServerBookedSlots(slots);
    });
    getBlockedSlotsForDate(selectedDoctor.id, state.date).then((result) => {
      if (!cancelled) setBlockedSlots(result);
    });
    return () => {
      cancelled = true;
    };
  }, [state.date]);

  const isLastStep = step === LAST_STEP;
  const isConfirmation = step === LAST_STEP;
  const unavailable = blockedSlots.wholeDayBlocked
    ? timeSlots
    : Array.from(new Set([...blockedSlots.times, ...serverBookedSlots]));

  function validateStep(current: number): boolean {
    if (current === 0) return Boolean(state.date);
    if (current === 1) return Boolean(state.time);
    if (current === 2) return validatePatientDetails();
    if (current === 3) return validatePayment();
    return true;
  }

  function validatePatientDetails(): boolean {
    const nextErrors: Partial<Record<keyof PatientDetails, string>> = {};
    const { fullName, phone, email, reason, reasonTags } = state.patient;

    if (!fullName.trim()) nextErrors.fullName = "errors.fullNameRequired";
    if (!phone.trim()) nextErrors.phone = "errors.phoneRequired";
    else if (!PHONE_RE.test(phone.trim())) nextErrors.phone = "errors.phoneInvalid";
    // Email is optional — only validate its format if the patient entered one.
    if (email.trim() && !EMAIL_RE.test(email.trim())) nextErrors.email = "errors.emailInvalid";
    if (reasonTags.length === 0 && !reason.trim()) {
      nextErrors.reason = "errors.reasonRequired";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validatePayment(): boolean {
    if (!state.patient.upiTransactionId.trim()) {
      setErrors((prev) => ({ ...prev, upiTransactionId: "errors.upiTransactionIdRequired" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, upiTransactionId: undefined }));
    return true;
  }

  async function handleNext() {
    if (!validateStep(step)) return;

    if (step === 3) {
      if (!state.date || !state.time) return;
      setSubmitError(null);
      setSubmitting(true);
      try {
        await createAppointment({
          doctorId: selectedDoctor.id,
          serviceId: selectedService.id,
          date: state.date,
          time: state.time,
          fullName: state.patient.fullName.trim(),
          phone: state.patient.phone.trim(),
          email: state.patient.email.trim(),
          reasonTags: state.patient.reasonTags,
          reason: state.patient.reason.trim(),
          paymentAmount: settings?.bookingFeeAmount ?? 0,
          upiTransactionId: state.patient.upiTransactionId.trim(),
        });
        notifyNewBooking({
          patientName: state.patient.fullName.trim(),
          patientPhone: state.patient.phone.trim(),
          patientEmail: state.patient.email.trim(),
          doctorName: selectedDoctor.name,
          serviceName: selectedService.name,
          date: state.date,
          time: state.time,
          reason: [...state.patient.reasonTags, state.patient.reason.trim()].filter(Boolean).join(", "),
        });
        setStep(4);
        window.scrollTo(0, 0);
      } catch (err) {
        setSubmitError(err instanceof BookingError ? err.message : t("errors.genericSubmit"));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((s) => Math.min(s + 1, LAST_STEP));
    window.scrollTo(0, 0);
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  }

  function updatePatient(field: keyof PatientDetails, value: string) {
    setState((prev) => ({ ...prev, patient: { ...prev.patient, [field]: value } }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleReasonTag(label: string) {
    setState((prev) => {
      const tags = prev.patient.reasonTags.includes(label)
        ? prev.patient.reasonTags.filter((t) => t !== label)
        : [...prev.patient.reasonTags, label];
      return { ...prev, patient: { ...prev.patient, reasonTags: tags } };
    });
    setErrors((prev) => ({ ...prev, reason: undefined }));
  }

  const canProceed = step < 2 ? validateStep(step) : true;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream-dark/40 pb-20 pt-28 sm:pt-32">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
          {!isConfirmation && (
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mb-5 flex items-center gap-1.5 text-sm font-medium text-plum/60 transition-colors hover:text-plum"
            >
              <ArrowLeft size={16} />
              {t("confirmation.backToHome")}
            </button>
          )}

          <div className="flex flex-col overflow-hidden rounded-[2rem] bg-cream shadow-card ring-1 ring-plum/5">
            <div className="flex shrink-0 items-center justify-between border-b border-plum/8 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">{t("booking.title")}</p>
                {!isConfirmation && (
                  <p className="mt-0.5 font-serif text-lg font-medium text-plum">
                    {t("booking.stepOf", { n: step + 1, label: STEP_LABELS[step] })}
                  </p>
                )}
              </div>
            </div>

            {!isConfirmation && (
              <div className="shrink-0 border-b border-plum/8 px-5 py-4 sm:px-8">
                <ol className="flex items-center gap-1.5 sm:gap-2">
                  {STEP_LABELS.map((label, index) => {
                    const isDone = index < step;
                    const isCurrent = index === step;
                    return (
                      <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                            isDone
                              ? "bg-sage-500 text-cream"
                              : isCurrent
                                ? "bg-rose-600 text-cream"
                                : "bg-plum/8 text-ink/40"
                          }`}
                        >
                          {isDone ? <Check size={13} strokeWidth={3} /> : index + 1}
                        </span>
                        <span
                          className={`hidden text-xs font-medium sm:inline ${
                            isCurrent ? "text-plum" : "text-ink/40"
                          }`}
                        >
                          {label}
                        </span>
                        {index < STEP_LABELS.length - 1 && (
                          <span className={`h-px flex-1 ${isDone ? "bg-sage-400" : "bg-plum/10"}`} />
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              {step === 0 && (
                <DatePicker
                  selected={state.date}
                  onSelect={(date) => setState((prev) => ({ ...prev, date, time: null }))}
                  doctorId={selectedDoctor.id}
                />
              )}
              {step === 1 && (
                <TimeSlotSelector
                  selected={state.time}
                  unavailable={unavailable}
                  onSelect={(time) => setState((prev) => ({ ...prev, time }))}
                />
              )}
              {step === 2 && (
                <StepDetails
                  patient={state.patient}
                  errors={errors}
                  reasonOptions={reasonOptions}
                  onChange={updatePatient}
                  onToggleReasonTag={toggleReasonTag}
                />
              )}
              {step === 3 && (
                <StepPayment
                  settings={settings ?? { upiId: "", payeeName: "", bookingFeeAmount: 0, whatsappNumber: "" }}
                  patient={state.patient}
                  errors={errors}
                  onChange={updatePatient}
                />
              )}
              {step === 4 && (
                <StepConfirmation
                  doctor={selectedDoctor}
                  service={selectedService}
                  date={state.date}
                  time={state.time}
                  patientName={state.patient.fullName}
                  onClose={() => navigate("/")}
                />
              )}
            </div>

            {!isConfirmation && (
              <div className="shrink-0 border-t border-plum/8 px-5 py-4 sm:px-8">
                {submitError && <p className="mb-3 text-sm text-rose-600">{submitError}</p>}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 0 || submitting}
                    icon={<ArrowLeft size={16} />}
                    iconPosition="left"
                  >
                    {t("booking.back")}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || submitting}
                    icon={isLastStep ? undefined : <ArrowRight size={16} />}
                  >
                    {step === 3
                      ? submitting
                        ? t("booking.bookingInProgress")
                        : t("booking.confirmAppointment")
                      : t("booking.continueBtn")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
