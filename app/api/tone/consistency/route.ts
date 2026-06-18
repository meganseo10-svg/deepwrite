import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_TONE_CONSISTENCY } from "@/lib/llm/prompts";
import {
  ConsistencyRequestSchema,
  ConsistencySchema,
  type Consistency,
} from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";
import { isUserPro } from "@/lib/plan";

// 톤 일관성 검사 (§2, 글 전체 대상). 3톤 도구의 고급 기능 → Pro 전용.
// 사용자 글 전체가 입력이므로 캐시 미사용(04 개인정보 규칙).
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
  const parsed = ConsistencyRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);

  if (!(await isUserPro(supabase, user.id)))
    return apiError("PLAN_REQUIRED", "톤 일관성 검사는 Pro 전용 기능입니다.", 403);

  let result: Consistency;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_TONE_CONSISTENCY,
      user: parsed.data.text,
      schema: ConsistencySchema,
      maxTokens: 2048,
    });
  } catch {
    return apiError("LLM_FAIL", "톤 일관성 검사에 실패했습니다.", 502);
  }

  return NextResponse.json(result);
}
