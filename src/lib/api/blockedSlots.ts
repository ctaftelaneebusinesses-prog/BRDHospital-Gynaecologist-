import { supabase, isSupabaseConfigured } from "../supabase";

export interface BlockedSlot {
  id: string;
  doctor_id: string;
  blocked_date: string; // ISO date, e.g. "2026-09-12"
  blocked_time: string | null; // null = the entire day is blocked
  reason: string | null;
  created_at: string;
}

function toIsoDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** For the booking flow: is this date fully blocked, and which individual slots are blocked on it. */
export async function getBlockedSlotsForDate(
  doctorId: string,
  date: Date,
): Promise<{ wholeDayBlocked: boolean; times: string[] }> {
  if (!isSupabaseConfigured) return { wholeDayBlocked: false, times: [] };

  const { data, error } = await supabase
    .from("blocked_slots")
    .select("blocked_time")
    .eq("doctor_id", doctorId)
    .eq("blocked_date", toIsoDate(date));

  if (error || !data) return { wholeDayBlocked: false, times: [] };

  const rows = data as { blocked_time: string | null }[];
  return {
    wholeDayBlocked: rows.some((r) => r.blocked_time === null),
    times: rows.map((r) => r.blocked_time).filter((t): t is string => t !== null),
  };
}

/** For the DatePicker: which dates in [from, to] are fully blocked, so they can be greyed out. */
export async function getFullyBlockedDates(doctorId: string, from: Date, to: Date): Promise<string[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("blocked_slots")
    .select("blocked_date")
    .eq("doctor_id", doctorId)
    .is("blocked_time", null)
    .gte("blocked_date", toIsoDate(from))
    .lte("blocked_date", toIsoDate(to));

  if (error || !data) return [];
  return (data as { blocked_date: string }[]).map((r) => r.blocked_date);
}

/** Admin only (requires an authenticated session — enforced by RLS). Lists blocked entries from today onward. */
export async function listBlockedSlots(doctorId: string, fromDate: Date): Promise<BlockedSlot[]> {
  const { data, error } = await supabase
    .from("blocked_slots")
    .select("*")
    .eq("doctor_id", doctorId)
    .gte("blocked_date", toIsoDate(fromDate))
    .order("blocked_date", { ascending: true });

  if (error) throw error;
  return data as BlockedSlot[];
}

/** Admin only. Pass time=null to block the entire day. */
export async function addBlockedSlot(doctorId: string, date: Date, time: string | null, reason: string): Promise<void> {
  const { error } = await supabase.from("blocked_slots").insert({
    doctor_id: doctorId,
    blocked_date: toIsoDate(date),
    blocked_time: time,
    reason: reason.trim() || null,
  });
  if (error) {
    if (error.code === "23505") return; // already blocked — treat as success, not an error
    throw error;
  }
}

/** Admin only. */
export async function removeBlockedSlot(id: string): Promise<void> {
  const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
  if (error) throw error;
}
