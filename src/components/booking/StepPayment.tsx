import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import type { AppSettings } from "../../lib/api/settings";
import type { PatientDetails } from "./types";
import { useLanguage } from "../../context/LanguageContext";

interface StepPaymentProps {
  settings: AppSettings;
  patient: PatientDetails;
  errors: Partial<Record<keyof PatientDetails, string>>;
  onChange: (field: keyof PatientDetails, value: string) => void;
}

const inputClass =
  "w-full rounded-xl border border-plum/12 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition-colors focus:border-rose-400 focus:ring-2 focus:ring-rose-100";
const errorClass = "border-red-300 focus:border-red-400 focus:ring-red-100";

export function StepPayment({ settings, patient, errors, onChange }: StepPaymentProps) {
  const { t } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
      settings.payeeName,
    )}&am=${settings.bookingFeeAmount}&cu=INR&tn=${encodeURIComponent("Appointment booking fee")}`;

    QRCode.toDataURL(upiUri, { width: 240, margin: 1, color: { dark: "#4a0f1f", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [settings]);

  const whatsappMessage = encodeURIComponent(t("stepPayment.whatsappMessage", { amount: settings.bookingFeeAmount }));
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="rounded-[1.75rem] bg-white p-5 text-center shadow-card ring-1 ring-plum/5 sm:p-7">
      <h3 className="font-serif text-xl font-medium text-plum">{t("stepPayment.heading")}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
        {t("stepPayment.instructions", { amount: settings.bookingFeeAmount })}
      </p>

      <div className="mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-2xl bg-cream-dark/60 p-4 ring-1 ring-plum/8">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="UPI payment QR code" className="h-full w-full" />
        ) : (
          <p className="text-xs text-ink/40">{t("stepPayment.generatingQr")}</p>
        )}
      </div>

      <p className="mt-3 text-xs text-ink/45">{t("stepPayment.payingTo", { payee: settings.payeeName, upi: settings.upiId })}</p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-sage-50 p-4 text-left text-sm text-sage-700">
        <div className="flex items-start gap-2.5">
          <MessageCircleHeart size={18} className="mt-0.5 shrink-0" />
          <p>{t("stepPayment.step1Instructions")}</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-sage-600 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-sage-700"
        >
          {t("stepPayment.shareWhatsapp")}
        </a>
      </div>

      <div className="mx-auto mt-4 max-w-md text-left">
        <p className="mb-2 text-sm font-medium text-plum">{t("stepPayment.step2Label")}</p>
        <p className="mb-2 text-xs text-ink/50">{t("stepPayment.step2Helper")}</p>
        <input
          type="text"
          autoComplete="off"
          value={patient.upiTransactionId}
          onChange={(e) => onChange("upiTransactionId", e.target.value)}
          placeholder={t("stepPayment.transactionPlaceholder")}
          className={`${inputClass} ${errors.upiTransactionId ? errorClass : ""}`}
        />
        {errors.upiTransactionId && <p className="mt-1.5 text-xs text-red-500">{t(errors.upiTransactionId)}</p>}
      </div>

      <div className="mx-auto mt-4 flex max-w-md items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-left text-sm text-rose-700">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>{t("stepPayment.disclaimer")}</p>
      </div>
    </div>
  );
}
