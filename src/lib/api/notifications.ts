import { supabase, isSupabaseConfigured } from "../supabase";

interface ConfirmationEmailInput {
  toEmail: string;
  toName: string;
  doctorName: string;
  serviceName: string;
  date: Date;
  time: string;
}

interface NewBookingNotificationInput {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  serviceName: string;
  date: Date;
  time: string;
  reason?: string;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "long", year: "numeric" });

/**
 * Sends the patient their "your appointment is confirmed" email via the
 * `send-confirmation` Edge Function. Call this once staff have confirmed
 * both the appointment status and payment in the admin dashboard — not at
 * booking time.
 *
 * Never throws and never blocks the caller — if the function isn't deployed
 * yet, or the Resend API key hasn't been configured, this just fails silently.
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

/**
 * Notifies hospital staff by email that a new appointment was just booked,
 * via the `notify-new-booking` Edge Function. Call this immediately after a
 * booking is created, regardless of confirmation/payment status.
 *
 * Never throws and never blocks the caller, same as sendConfirmationEmail.
 */
export function notifyNewBooking(input: NewBookingNotificationInput): void {
  if (!isSupabaseConfigured) return;

  supabase.functions
    .invoke("notify-new-booking", {
      body: {
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        patientEmail: input.patientEmail,
        doctorName: input.doctorName,
        serviceName: input.serviceName,
        date: DATE_FORMAT.format(input.date),
        time: input.time,
        reason: input.reason,
      },
    })
    .catch(() => {
      // Staff notification is a nice-to-have — the booking itself already succeeded.
    });
}
