import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * service_role 키를 쓰는 서버 전용 Supabase 클라이언트 (RLS 우회).
 * 절대 클라이언트 번들에 노출 금지 — llm_cache 등 서버 작업에만 사용.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
