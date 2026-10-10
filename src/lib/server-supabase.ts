import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sanitizeSupabaseUrl, sanitizeSupabaseKey } from "@/lib/supabase";

let cachedAdminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const supabaseUrl = sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  // Ưu tiên Service Role Key. Nếu Vercel chưa có SUPABASE_SERVICE_ROLE_KEY trong Environment Variables,
  // tự động fallback về NEXT_PUBLIC_SUPABASE_ANON_KEY để không bị crash khi thêm/sửa seller.
  const serviceKey = sanitizeSupabaseKey(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );


  if (!serviceKey) {
    throw new Error("Không thể khởi tạo kết nối cơ sở dữ liệu Supabase");
  }

  cachedAdminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}

