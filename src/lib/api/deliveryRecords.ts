import { supabase } from "../supabase";

export type RecordStatus = "expecting" | "delivered";
export type BabyGender = "Boy" | "Girl" | "Other";

export const DELIVERY_TYPES = [
  "Normal (Vaginal)",
  "C-Section (Planned)",
  "C-Section (Emergency)",
  "Assisted – Forceps",
  "Assisted – Vacuum",
  "VBAC (Normal after C-Section)",
] as const;

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const BABY_GENDERS: BabyGender[] = ["Boy", "Girl", "Other"];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export interface DeliveryRecord {
  id: string;
  record_status: RecordStatus;
  mother_name: string;
  mother_age: number | null;
  mother_occupation: string | null;
  mother_blood_group: string | null;
  father_name: string;
  father_occupation: string | null;
  contact_number: string;
  alternate_contact_number: string | null;
  address: string;
  district: string;
  state: string;
  pincode: string | null;
  expected_delivery_date: string | null;
  delivery_date: string | null;
  delivery_type: string | null;
  gestation_weeks: number | null;
  baby_birth_date: string | null;
  baby_birth_time: string | null;
  baby_weight_kg: number | null;
  baby_gender: BabyGender | null;
  baby_blood_group: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryRecordInput = Omit<DeliveryRecord, "id" | "created_at" | "updated_at">;

/** Admin only (RLS: authenticated staff). Newest deliveries first; expecting mothers have no delivery date and sort last. */
export async function listDeliveryRecords(): Promise<DeliveryRecord[]> {
  const { data, error } = await supabase
    .from("delivery_records")
    .select("*")
    .order("delivery_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as DeliveryRecord[];
}

/** Admin only. */
export async function createDeliveryRecord(input: DeliveryRecordInput): Promise<void> {
  const { error } = await supabase.from("delivery_records").insert(input);
  if (error) throw error;
}

/** Admin only. */
export async function updateDeliveryRecord(id: string, input: DeliveryRecordInput): Promise<void> {
  const { error } = await supabase
    .from("delivery_records")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/** Admin only. */
export async function deleteDeliveryRecord(id: string): Promise<void> {
  const { error } = await supabase.from("delivery_records").delete().eq("id", id);
  if (error) throw error;
}
