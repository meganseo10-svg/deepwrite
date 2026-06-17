import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeWeaknessReport } from "@/lib/weakness";
import { apiError } from "@/lib/http";

// 약점 리포트 (05). 누적 약점 랭킹 + 추이 + 맞춤 드릴. LLM 미사용.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHENTICATED", "로그인이 필요합니다.", 401);

  const report = await computeWeaknessReport(supabase, user.id);
  return NextResponse.json(report);
}
