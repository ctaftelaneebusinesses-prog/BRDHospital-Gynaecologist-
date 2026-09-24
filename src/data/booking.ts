import type { LucideIcon } from "lucide-react";
import { Stethoscope } from "lucide-react";

export interface AppointmentService {
  id: string;
  name: string;
  description: string;
  duration: string;
  icon: LucideIcon;
}

export const appointmentServices: AppointmentService[] = [
  {
    id: "gynecological-consultation",
    name: "Gynecological Consultation",
    description: "Routine checkup, menstrual and reproductive health guidance.",
    duration: "30 min",
    icon: Stethoscope,
  },
];

/** Fallback slots used until the admin-configured list loads (or if none was ever set). */
export const timeSlots: string[] = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

const TIME_LABEL_RE = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;

/** Minutes since midnight, for sorting — returns Infinity for anything that doesn't match "hh:mm AM/PM" so bad input sorts last instead of crashing. */
export function timeToMinutes(label: string): number {
  const match = TIME_LABEL_RE.exec(label.trim());
  if (!match) return Infinity;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + Number(match[2]);
}

export function sortTimeSlots(slots: string[]): string[] {
  return [...slots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
}

export function isValidTimeSlotLabel(label: string): boolean {
  return TIME_LABEL_RE.test(label.trim());
}
