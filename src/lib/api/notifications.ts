import { supabase, isSupabaseConfigured } from "../supabase";

interface ConfirmationEmailInput {
  toEmail: string;
  toName: string;
  doctorName: string;
  serviceName: string;
  date: Date;
  time: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "long", year: "numeric" });

/**
 * Best-effort email confirmation via the `send-confirmation` Edge Function.
 * Never throws and never blocks the booking flow — if it's not deployed yet,
 * or the Resend API key hasn't been configured, this just fails silently.
 */
export function sendConfirmationEmail(input: ConfirmationEmailInput): void {
  if (!isSupabaseConfigured) return;

  supabase.functions
    .invoke("send-confirmation", {
      body: {
        toEmail: input.toEmail,
        toName: input.toName,
        doctorName: input.doctorName,
        serviceName: input.serviceName,
        date: DATE_FORMAT.format(input.date),
        time: input.time,
      },
    })
    .catch(() => {
      // Confirmation email is a nice-to-have — the booking itself already succeeded.
    });
}
