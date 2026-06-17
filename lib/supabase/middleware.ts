import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

// 인증이 필요한 보호 경로 (로그인해야 접근 가능).
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/write",
  "/backtranslate",
  "/weakness",
  "/onboarding",
  "/expressions",
  "/mypage",
];

/**
 * 매 요청마다 세션 토큰을 갱신하고, 보호 경로에 대한 접근을 통제한다.
 * (@supabase/ssr 표준 패턴)
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // 키가 아직 없으면 인증 없이 통과 (부트스트랩 단계).
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // getUser() 는 토큰을 검증하므로 미들웨어에서 호출해 세션을 갱신한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  // 미인증 + 보호 경로 → 로그인으로
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // 인증됨 + 로그인 페이지 → 대시보드로
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
