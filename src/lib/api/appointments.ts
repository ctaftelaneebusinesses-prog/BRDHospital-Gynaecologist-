import { supabase, isSupabaseConfigured } from "../supabase";

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  doctor_id: string;
  service_id: string;
  appointment_date: string; // ISO date, e.g. "2026-09-12"
  appointment_time: string; // e.g. "09:00 AM"
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  reason: string;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
}

export interface NewAppointmentInput {
  doctorId: string;
  serviceId: string;
  date: Date;
  time: string;
  fullName: string;
  phone: string;
  email: string;
  dob: string;
  reason: string;
  message: string;
}

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Thrown when a booking can't be created — the message is safe to show to the patient. */
export class BookingError extends Error {}

/**
 * Creates a new appointment. Throws BookingError with a user-facing message on failure.
 *
 * Deliberately does NOT chain `.select()` after `.insert()`: patients can only ever
 * INSERT into appointments (by RLS design, to keep other patients' data private), and
 * Postgres additionally checks the table's SELECT policy against any row an INSERT
 * tries to return — so asking for the inserted row back would fail even though the
 * insert itself succeeds. The caller already has everything it needs client-side.
 */
export async function createAppointment(input: NewAppointmentInput): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new BookingError(
      "Booking isn't connected to the server yet. Please contact the clinic directly to confirm your appointment.",
    );
  }

  const { error } = await supabase.from("appointments").insert({
    doctor_id: input.doctorId,
    service_id: input.serviceId,
    appointment_date: toIsoDate(input.date),
    appointment_time: input.time,
    full_name: input.fullName,
    phone: input.phone,
    email: input.email,
    date_of_birth: input.dob || null,
    reason: input.reason,
    message: input.message || null,
  });

  if (error) {
    if (error.code === "23505") {
      throw new BookingError("That time slot was just booked by someone else — please pick another.");
    }
    throw new BookingError("We couldn't save your booking. Please check your connection and try again.");
  }
}

/** Returns the list of time-slot labels already booked for a doctor on a given date. */
export async function getBookedSlots(doctorId: string, date: Date): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase.rpc("get_booked_slots", {
    p_doctor_id: doctorId,
    p_date: toIsoDate(date),
  });

  if (error) return [];
  return (data as { appointment_time: string }[]).map((row) => row.appointment_time);
}

/** Admin only (requires an authenticated session — enforced by RLS). */
export async function listAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true });

  if (error) throw error;
  return data as Appointment[];
}

/** Admin only (requires an authenticated session — enforced by RLS). */
export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) throw error;
}
