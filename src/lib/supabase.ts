import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wjmtlewjkommnaylysiu.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_NbeYcoaaFx2YPXe_4yQyEQ_Bvc4E73i";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id")
);

// Client instance (fully typed as SupabaseClient)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
);
