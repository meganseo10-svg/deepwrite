import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: middleware → proxy 컨벤션. 매 요청마다 세션 갱신 + 보호경로 통제.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 정적 자산·이미지·favicon 제외한 모든 경로.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
