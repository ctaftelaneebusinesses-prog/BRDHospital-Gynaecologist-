import { supabase, isSupabaseConfigured } from "../supabase";
import { translateToAllLanguages } from "../translate";
import type { LanguageCode } from "../../i18n/translations";

export interface ReasonOption {
  id: string;
  label: string;
  sort_order: number;
  is_active: boolean;
  translations?: Partial<Record<LanguageCode, string>> | null;
}

/** Reads the label in the visitor's language, falling back to the stored (English) label. */
export function getReasonLabel(option: ReasonOption, language: LanguageCode): string {
  return option.translations?.[language] || option.label;
}

const FALLBACK: ReasonOption[] = [
  {
    id: "fallback-1",
    label: "Routine Checkup",
    sort_order: 1,
    is_active: true,
    translations: { en: "Routine Checkup", hi: "नियमित जाँच", te: "సాధారణ తనిఖీ", ta: "வழக்கமான சரிபார்ப்பு", kn: "ನಿಯಮಿತ ತಪಾಸಣೆ" },
  },
  {
    id: "fallback-2",
    label: "Pregnancy Consultation",
    sort_order: 2,
    is_active: true,
    translations: {
      en: "Pregnancy Consultation",
      hi: "गर्भावस्था परामर्श",
      te: "గర్భధారణ సంప్రదింపులు",
      ta: "கர்ப்ப ஆலோசனை",
      kn: "ಗರ್ಭಧಾರಣೆಯ ಸಮಾಲೋಚನೆ",
    },
  },
  {
    id: "fallback-3",
    label: "Other",
    sort_order: 3,
    is_active: true,
    translations: { en: "Other", hi: "अन्य", te: "ఇతర", ta: "மற்றவை", kn: "ಇತರೆ" },
  },
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

  // Auto-translate into every supported language so the checklist never shows
  // English-only text just because it was added after the fact.
  const translations = await translateToAllLanguages(label);

  const { error } = await supabase.from("reason_options").insert({ label, sort_order: nextOrder, translations });
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
