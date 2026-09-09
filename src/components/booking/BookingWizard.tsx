import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useBooking } from "../../context/BookingContext";
import { Button } from "../ui/Button";
import { DatePicker } from "./DatePicker";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { StepDetails } from "./StepDetails";
import { StepConfirmation } from "./StepConfirmation";
import { emptyBookingState, STEP_LABELS, type BookingState, type PatientDetails } from "./types";
import { appointmentServices, unavailableSlotsByDate } from "../../data/booking";
import { doctors } from "../../data/doctors";
import { createAppointment, getBookedSlots, BookingError } from "../../lib/api/appointments";
import { sendConfirmationEmail } from "../../lib/api/notifications";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,}$/;

const selectedDoctor = doctors[0];
const selectedService = appointmentServices[0];

export function BookingWizard() {
  const { isOpen, closeBooking } = useBooking();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BookingState>(emptyBookingState);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientDetails, string>>>({});
  const [serverBookedSlots, setServerBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setState(emptyBookingState);
    setErrors({});
    setSubmitError(null);
    setStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!state.date) {
      setServerBookedSlots([]);
      return;
    }
    let cancelled = false;
    getBookedSlots(selectedDoctor.id, state.date).then((slots) => {
      if (!cancelled) setServerBookedSlots(slots);
    });
    return () => {
      cancelled = true;
    };
  }, [state.date]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) closeBooking();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeBooking]);

  if (!isOpen) return null;

  const isLastStep = step === 3;
  const isConfirmation = step === 3;
  const dateKey = state.date ? state.date.toISOString().split("T")[0] : "";
  const unavailable = Array.from(new Set([...(unavailableSlotsByDate[dateKey] ?? []), ...serverBookedSlots]));

  function validateStep(current: number): boolean {
    if (current === 0) return Boolean(state.date);
    if (current === 1) return Boolean(state.time);
    if (current === 2) return validatePatientDetails();
    return true;
  }

  function validatePatientDetails(): boolean {
    const nextErrors: Partial<Record<keyof PatientDetails, string>> = {};
    const { fullName, phone, email, dob, reason } = state.patient;

    if (!fullName.trim()) nextErrors.fullName = "Please enter your full name.";
    if (!phone.trim()) nextErrors.phone = "Please enter a phone number.";
    else if (!PHONE_RE.test(phone.trim())) nextErrors.phone = "Please enter a valid phone number.";
    if (!email.trim()) nextErrors.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim())) nextErrors.email = "Please enter a valid email address.";
    if (!dob) nextErrors.dob = "Please enter your date of birth.";
    if (!reason.trim()) nextErrors.reason = "Please tell us the reason for your visit.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleNext() {
    if (!validateStep(step)) return;

    if (step === 2) {
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
          dob: state.patient.dob,
          reason: state.patient.reason.trim(),
          message: state.patient.message.trim(),
        });
        sendConfirmationEmail({
          toEmail: state.patient.email.trim(),
          toName: state.patient.fullName.trim(),
          doctorName: selectedDoctor.name,
          serviceName: selectedService.name,
          date: state.date,
          time: state.time,
        });
        setStep(3);
      } catch (err) {
        setSubmitError(
          err instanceof BookingError ? err.message : "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep((s) => Math.min(s + 1, 3));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function updatePatient(field: keyof PatientDetails, value: string) {
    setState((prev) => ({ ...prev, patient: { ...prev.patient, [field]: value } }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const canProceed = step < 2 ? validateStep(step) : true;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-plum/50 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBooking();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-cream shadow-2xl sm:max-h-[88vh] sm:rounded-[2rem]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-plum/8 px-5 py-4 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-rose-500">
                  Book an Appointment
                </p>
                {!isConfirmation && (
                  <p className="mt-0.5 font-serif text-lg font-medium text-plum">
                    Step {step + 1} of 4 — {STEP_LABELS[step]}
                  </p>
                )}
              </div>
              <button
                onClick={closeBooking}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-plum/60 transition-colors hover:bg-plum/5 hover:text-plum"
                aria-label="Close booking"
              >
                <X size={20} />
              </button>
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

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
              {step === 0 && (
                <DatePicker
                  selected={state.date}
                  onSelect={(date) => setState((prev) => ({ ...prev, date, time: null }))}
                />
              )}
              {step === 1 && (
                <TimeSlotSelector
                  selected={state.time}
                  unavailable={unavailable}
                  onSelect={(time) => setState((prev) => ({ ...prev, time }))}
                />
              )}
              {step === 2 && <StepDetails patient={state.patient} errors={errors} onChange={updatePatient} />}
              {step === 3 && (
                <StepConfirmation
                  doctor={selectedDoctor}
                  service={selectedService}
                  date={state.date}
                  time={state.time}
                  patientName={state.patient.fullName}
                  onClose={closeBooking}
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
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed || submitting}
                    icon={isLastStep ? undefined : <ArrowRight size={16} />}
                  >
                    {step === 2 ? (submitting ? "Booking…" : "Confirm Appointment") : "Continue"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
