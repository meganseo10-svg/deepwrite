import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_BACKTRANS_NEW, userBacktransNew } from "@/lib/llm/prompts";
import {
  BacktransNewRequestSchema,
  BacktransNewSchema,
  type BacktransNew,
} from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";

// 역번역 과제 생성 (§4-a). 인증만 필요(채점은 별도 Pro 게이트).
// 생성되는 한국어 의도는 개인정보 아님이나, CEFR/장르 조합이 다양해 캐시 미사용.
export const maxDuration = 60; // LLM 호출 → Vercel 기본(10s) 초과 방지

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHENTICATED", "로그인이 필요합니다.", 401);

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // 본문 없이 호출 가능(기본값 사용)
  }
  const parsed = BacktransNewRequestSchema.safeParse(body ?? {});
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);

  // CEFR 미지정 시 사용자 프로필의 추정 레벨을 활용
  let cefr = parsed.data.cefr;
  if (!cefr) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("estimated_cefr")
      .eq("id", user.id)
      .maybeSingle();
    cefr = profile?.estimated_cefr ?? undefined;
  }

  let result: BacktransNew;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_BACKTRANS_NEW,
      user: userBacktransNew(cefr, parsed.data.genre),
      schema: BacktransNewSchema,
      maxTokens: 512,
    });
  } catch {
    return apiError("LLM_FAIL", "역번역 문제 생성에 실패했습니다.", 502);
  }

  return NextResponse.json(result);
}
