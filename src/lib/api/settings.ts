import { supabase, isSupabaseConfigured } from "../supabase";

export interface AppSettings {
  upiId: string;
  bookingFeeAmount: number;
  payeeName: string;
}

const DEFAULTS: AppSettings = {
  upiId: "brdhospital@upi",
  bookingFeeAmount: 100,
  payeeName: "BRD Hospital",
};

export async function getSettings(): Promise<AppSettings> {
  if (!isSupabaseConfigured) return DEFAULTS;

  const { data, error } = await supabase.from("app_settings").select("key, value");
  if (error || !data) return DEFAULTS;

  const map = Object.fromEntries(data.map((row) => [row.key, row.value]));
  return {
    upiId: map.upi_id ?? DEFAULTS.upiId,
    bookingFeeAmount: Number(map.booking_fee_amount ?? DEFAULTS.bookingFeeAmount),
    payeeName: map.payee_name ?? DEFAULTS.payeeName,
  };
}

/** Admin only (requires an authenticated session — enforced by RLS). */
export async function updateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
