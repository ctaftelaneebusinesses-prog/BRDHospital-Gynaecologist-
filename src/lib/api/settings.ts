import { supabase, isSupabaseConfigured } from "../supabase";
import { timeSlots as fallbackTimeSlots, sortTimeSlots } from "../../data/booking";

export interface AppSettings {
  upiId: string;
  bookingFeeAmount: number;
  payeeName: string;
  whatsappNumber: string;
  timeSlots: string[];
}

const DEFAULTS: AppSettings = {
  upiId: "brdhospital@upi",
  bookingFeeAmount: 100,
  payeeName: "BRD Hospital",
  whatsappNumber: "911234567890",
  timeSlots: fallbackTimeSlots,
};

function parseTimeSlots(raw: string | undefined): string[] {
  if (!raw) return DEFAULTS.timeSlots;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((t) => typeof t === "string") && parsed.length > 0) {
      return sortTimeSlots(parsed);
    }
  } catch {
    // fall through to default below
  }
  return DEFAULTS.timeSlots;
}

export async function getSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULTS;

  const { data, error } = await supabase.from("app_settings").select("key, value");
  if (error || !data) return DEFAULTS;

  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    upiId: map.upi_id ?? DEFAULTS.upiId,
    bookingFeeAmount: Number(map.booking_fee_amount ?? DEFAULTS.bookingFeeAmount),
    payeeName: map.payee_name ?? DEFAULTS.payeeName,
    whatsappNumber: map.whatsapp_number ?? DEFAULTS.whatsappNumber,
    timeSlots: parseTimeSlots(map.time_slots),
  };
}

/** Admin only (requires an authenticated session — enforced by RLS). */
export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Admin only. Replaces the doctor's bookable time-of-day list entirely. */
export async function updateTimeSlots(slots: string[]): Promise<void> {
  await updateSetting("time_slots", JSON.stringify(sortTimeSlots(slots)));
}
