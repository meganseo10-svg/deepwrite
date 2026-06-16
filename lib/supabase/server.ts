import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

/**
 * 서버(서버 컴포넌트 / 라우트 핸들러 / 서버 액션)용 Supabase 클라이언트.
 * 쿠키 기반 세션을 읽고 갱신한다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서 set 호출 시 무시 (미들웨어가 세션을 갱신함).
        }
      },
    },
  });
}
