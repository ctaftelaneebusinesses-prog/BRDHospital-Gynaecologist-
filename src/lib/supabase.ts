import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — " +
      "booking persistence, slot-conflict checks, and the admin dashboard will not work " +
      "until you copy .env.example to .env.local and fill them in.",
  );
}

// Falls back to harmless placeholder values so createClient never throws at import
// time — every call site checks isSupabaseConfigured (or gets a clear error from
// the network call) instead of crashing the whole app on load.
export const supabase: SupabaseClient = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
);
