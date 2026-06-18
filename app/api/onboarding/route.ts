import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_ONBOARDING, userOnboarding } from "@/lib/llm/prompts";
import {
  OnboardingRequestSchema,
  OnboardingSchema,
  type Onboarding,
} from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";

// 온보딩 진단 (§5). 짧은 글 3개를 5차원으로 분석·평균 → 추정 CEFR + 최약점.
// 사용자 글 입력이라 캐시 미사용(04 개인정보 규칙). 결과의 CEFR 을 profiles 에 반영.
export const maxDuration = 60; // LLM 호출 → Vercel 기본(10s) 초과 방지

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
  const parsed = OnboardingRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "짧은 글 3개를 모두 입력해 주세요.", 400);

  let result: Onboarding;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_ONBOARDING,
      user: userOnboarding(parsed.data.texts),
      schema: OnboardingSchema,
      thinking: true,
      maxTokens: 4096,
    });
  } catch {
    return apiError("LLM_FAIL", "온보딩 진단에 실패했습니다.", 502);
  }

  // profiles 업데이트: 추정 CEFR 베이스라인 반영
  const { error: pErr } = await supabase
    .from("profiles")
    .update({ estimated_cefr: result.estimated_cefr })
    .eq("id", user.id);
  if (pErr) return apiError("LLM_FAIL", "프로필 저장에 실패했습니다.", 500);

  return NextResponse.json(result);
}
