import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_BACKTRANS_SCORE, userBacktransScore } from "@/lib/llm/prompts";
import {
  BacktransScoreRequestSchema,
  BacktransScoreSchema,
  type BacktransScore,
} from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";
import { isProPlan } from "@/lib/plan";

// 역번역 채점 (§4-b, 핵심). Pro 전용. backtranslations 적재.
// 사용자 영어 입력이 포함되므로 캐시 미사용(04 개인정보 규칙).
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
  const parsed = BacktransScoreRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);
  const { intentKo, userEn } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  if (!isProPlan(profile?.plan))
    return apiError("PLAN_REQUIRED", "역번역 채점은 Pro 전용 기능입니다.", 403);

  let result: BacktransScore;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_BACKTRANS_SCORE,
      user: userBacktransScore(intentKo, userEn),
      schema: BacktransScoreSchema,
      thinking: true,
      maxTokens: 4096,
    });
  } catch {
    return apiError("LLM_FAIL", "역번역 채점에 실패했습니다.", 502);
  }

  // backtranslations 적재
  const { error: bErr } = await supabase.from("backtranslations").insert({
    user_id: user.id,
    intent_ko: intentKo,
    user_en: userEn,
    back_ko: result.back_ko,
    fidelity: result.fidelity,
    gaps: result.gaps,
    model_answer: result.model_answer,
  });
  if (bErr) return apiError("LLM_FAIL", "결과 저장에 실패했습니다.", 500);

  return NextResponse.json(result);
}
