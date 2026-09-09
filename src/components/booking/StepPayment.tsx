import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import type { AppSettings } from "../../lib/api/settings";

interface StepPaymentProps {
  settings: AppSettings;
}

export function StepPayment({ settings }: StepPaymentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(
      settings.payeeName,
    )}&am=${settings.bookingFeeAmount}&cu=INR&tn=${encodeURIComponent("Appointment booking fee")}`;

    QRCode.toDataURL(upiUri, { width: 240, margin: 1, color: { dark: "#45262e", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [settings]);

  return (
    <div className="rounded-[1.75rem] bg-white p-5 text-center shadow-card ring-1 ring-plum/5 sm:p-7">
      <h3 className="font-serif text-xl font-medium text-plum">Confirm with a small booking fee</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
        To secure your slot, please scan the QR code below and pay{" "}
        <span className="font-semibold text-plum">₹{settings.bookingFeeAmount}</span> via any UPI app.
      </p>

      <div className="mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-2xl bg-cream-dark/60 p-4 ring-1 ring-plum/8">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="UPI payment QR code" className="h-full w-full" />
        ) : (
          <p className="text-xs text-ink/40">Generating QR code…</p>
        )}
      </div>

      <p className="mt-3 text-xs text-ink/45">
        Paying to <span className="font-medium text-ink/60">{settings.payeeName}</span> ·{" "}
        {settings.upiId}
      </p>

      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-sage-50 p-4 text-left text-sm text-sage-700">
        <div className="flex items-start gap-2.5">
          <MessageCircleHeart size={18} className="mt-0.5 shrink-0" />
          <p>
            After paying, please take a screenshot of the payment confirmation and send it to the clinic
            on WhatsApp so we can verify it quickly.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-md items-start gap-2.5 rounded-2xl bg-rose-50 p-4 text-left text-sm text-rose-700">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" />
        <p>
          Your appointment slot is reserved now. We'll mark it confirmed as soon as your payment is
          verified — this usually takes a little while, not necessarily right away.
        </p>
      </div>
    </div>
  );
}
