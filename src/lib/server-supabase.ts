import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from "@/lib/supabase";

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined in server environment");
  }

  cachedAdminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
