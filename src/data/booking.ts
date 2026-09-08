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

export const timeSlots: string[] = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

/** Slots that are pre-booked in the demo, to make the picker feel alive. Keyed by ISO date. */
export const unavailableSlotsByDate: Record<string, string[]> = {};
