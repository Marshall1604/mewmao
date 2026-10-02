import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  let url = (rawUrl || "https://wjmtlewjkommnaylysiu.supabase.co").trim();
  url = url.replace(/^["']|["']$/g, "");
  url = url.replace(/\/rest\/v1\/?$/i, "");
  url = url.replace(/\/+$/, "");
  return url;
}

export function sanitizeSupabaseKey(rawKey?: string, defaultKey: string = ""): string {
  let key = (rawKey || defaultKey).trim();
  return key.replace(/^["']|["']$/g, "");
}

const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeSupabaseKey(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
