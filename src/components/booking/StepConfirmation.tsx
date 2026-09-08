import { motion } from "framer-motion";
import { CalendarPlus, CheckCircle2, Home } from "lucide-react";
import { Button } from "../ui/Button";
import { Img } from "../ui/Img";
import type { Doctor } from "../../data/doctors";
import type { AppointmentService } from "../../data/booking";

interface StepConfirmationProps {
  doctor: Doctor | undefined;
  service: AppointmentService | undefined;
  date: Date | null;
  time: string | null;
  patientName: string;
  onClose: () => void;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "long", year: "numeric" });

function buildIcsFile(service: AppointmentService | undefined, doctor: Doctor | undefined, date: Date | null, time: string | null) {
  if (!date || !time) return null;

  const [rawTime, meridiem] = time.split(" ");
  const [hourStr, minuteStr] = rawTime.split(":");
  let hour = parseInt(hourStr, 10) % 12;
  if (meridiem === "PM") hour += 12;
  const minute = parseInt(minuteStr, 10);

  const start = new Date(date);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const toIcsDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BRDHospital//Appointment Booking//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@aurawomenshealth.com`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${service?.name ?? "Appointment"} with ${doctor?.name ?? "your doctor"}`,
    `DESCRIPTION:Appointment at BRDHospital with ${doctor?.name ?? ""}.`,
    "LOCATION:214 Willowbrook Avenue, Suite 300, Riverdale",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new Blob([ics], { type: "text/calendar;charset=utf-8" });
}

export function StepConfirmation({ doctor, service, date, time, patientName, onClose }: StepConfirmationProps) {
  function handleAddToCalendar() {
    const blob = buildIcsFile(service, doctor, date, time);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aura-appointment.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-sage-100 text-sage-600"
      >
        <CheckCircle2 size={40} />
      </motion.div>

      <h3 className="mt-6 font-serif text-2xl font-medium text-plum sm:text-3xl">Appointment Confirmed</h3>
      <p className="mt-2 text-sm text-ink/60">
        Thank you, {patientName.split(" ")[0] || "there"} — your appointment has been successfully scheduled.
      </p>

      <div className="mt-8 flex w-full max-w-md items-center gap-4 overflow-hidden rounded-[1.75rem] bg-white p-5 text-left shadow-card ring-1 ring-plum/5">
        {doctor && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-rose-100">
            <Img slug={doctor.image} alt={doctor.name} width={128} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="min-w-0 flex-1 divide-y divide-plum/8 text-sm">
          <Row label="Doctor" value={doctor?.name ?? "—"} />
        </div>
      </div>

      <div className="mt-4 grid w-full max-w-md grid-cols-1 gap-3 rounded-[1.75rem] bg-white p-5 text-left shadow-card ring-1 ring-plum/5 sm:grid-cols-3">
        <SummaryTile label="Service" value={service?.name ?? "—"} />
        <SummaryTile label="Date" value={date ? DATE_FORMAT.format(date) : "—"} />
        <SummaryTile label="Time" value={time ?? "—"} />
      </div>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button variant="outline" icon={<CalendarPlus size={17} />} iconPosition="left" onClick={handleAddToCalendar}>
          Add to Calendar
        </Button>
        <Button icon={<Home size={17} />} iconPosition="left" onClick={onClose}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 first:pt-0 last:pb-0">
      <span className="text-xs text-ink/45">{label}</span>
      <span className="font-medium text-plum">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">{label}</p>
      <p className="mt-1 text-sm font-medium text-plum">{value}</p>
    </div>
  );
}
