import { supabase, isSupabaseConfigured } from "../supabase";

export interface ReasonOption {
  id: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

const FALLBACK: ReasonOption[] = [
  { id: "fallback-1", label: "Routine Checkup", sort_order: 1, is_active: true },
  { id: "fallback-2", label: "Pregnancy Consultation", sort_order: 2, is_active: true },
  { id: "fallback-3", label: "Other", sort_order: 3, is_active: true },
];

/** Public — active checklist options for the booking form. */
export async function getActiveReasonOptions(): Promise<ReasonOption[]> {
  if (!isSupabaseConfigured) return FALLBACK;

  const { data, error } = await supabase
    .from("reason_options")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) return FALLBACK;
  return data as ReasonOption[];
}

/** Admin only — every option, active or not, so it can be managed. */
export async function listAllReasonOptions(): Promise<ReasonOption[]> {
  const { data, error } = await supabase.from("reason_options").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data as ReasonOption[];
}

export async function addReasonOption(label: string): Promise<void> {
  const { data: existing } = await supabase
    .from("reason_options")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1;

  const { error } = await supabase.from("reason_options").insert({ label, sort_order: nextOrder });
  if (error) throw error;
}

export async function setReasonOptionActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase.from("reason_options").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deleteReasonOption(id: string): Promise<void> {
  const { error } = await supabase.from("reason_options").delete().eq("id", id);
  if (error) throw error;
}
