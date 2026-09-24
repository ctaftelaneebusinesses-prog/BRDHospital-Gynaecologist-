/** Normalises an Indian phone number for wa.me — strips everything but digits and adds the 91 country code to bare 10-digit numbers. */
export function toWhatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/** Builds a click-to-chat link that opens WhatsApp with `message` pre-filled for `phone`. */
export function buildWhatsappUrl(phone: string, message: string): string {
  return `https://wa.me/${toWhatsappNumber(phone)}?text=${encodeURIComponent(message)}`;
}

const CONFIRM_DATE_FORMAT = new Intl.DateTimeFormat("en-US", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

/** The message the admin sends from their WhatsApp to the patient once an appointment is confirmed. */
export function buildPatientConfirmationMessage(details: {
  patientName: string;
  doctorName: string;
  serviceName: string;
  appointmentDate: string; // ISO date, e.g. "2026-09-12"
  appointmentTime: string;
}): string {
  const date = CONFIRM_DATE_FORMAT.format(new Date(details.appointmentDate + "T00:00:00"));
  return [
    `Hello ${details.patientName},`,
    "",
    "Your appointment at *BRD Hospital* is *confirmed* ✅",
    "",
    `Doctor: ${details.doctorName}`,
    `Service: ${details.serviceName}`,
    `Date: ${date}`,
    `Time: ${details.appointmentTime}`,
    "",
    "Address: Opposite R&B Guest House, Near Area Hospital Circle, Kuppam, Andhra Pradesh",
    "",
    "Please arrive 10 minutes early. Reply to this message if you need to reschedule.",
    "",
    "Thank you!",
  ].join("\n");
}
