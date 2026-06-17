import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_TONE, userTone } from "@/lib/llm/prompts";
import { ToneRequestSchema, ToneSchema, type ToneResult } from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";
import { isUserPro } from "@/lib/plan";

// 3톤 동시 변환 (§2). pro+ 무제한 / free·basic 은 하루 1회 미리보기.
// 입력이 사용자 글이므로 analyze 와 동일하게 캐시 미사용(04 개인정보 규칙).
const FEATURE = "tone_preview";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHENTICATED", "로그인이 필요합니다.", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError("INVALID_INPUT", "요청 본문이 올바르지 않습니다.", 400);
  }
  const parsed = ToneRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);

  // 플랜 게이트: pro+ 무제한, 그 외는 하루 1회 미리보기
  const pro = await isUserPro(supabase, user.id);
  if (!pro) {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("feature", FEATURE)
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= 1)
      return apiError(
        "PLAN_REQUIRED",
        "3톤 비교 미리보기는 하루 1회입니다. Pro로 업그레이드하면 무제한으로 사용할 수 있어요.",
        403,
      );
  }

  let result: ToneResult;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_TONE,
      user: userTone(parsed.data.text),
      schema: ToneSchema,
      maxTokens: 2048,
    });
  } catch {
    return apiError("LLM_FAIL", "3톤 변환에 실패했습니다.", 502);
  }

  // 미리보기 사용 1건 기록(LLM 성공 후에만 차감)
  if (!pro)
    await supabase.from("usage_events").insert({
      user_id: user.id,
      feature: FEATURE,
    });

  return NextResponse.json(result);
}
