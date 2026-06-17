import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_COMPARE, userCompare } from "@/lib/llm/prompts";
import {
  CompareRequestSchema,
  CompareSchema,
  type Compare,
} from "@/lib/schemas/llm";
import { cacheKey, getCached, setCached } from "@/lib/llm/cache";
import { apiError } from "@/lib/http";
import { isUserPro } from "@/lib/plan";

// 비교 단어 카드 (§3-b). Pro 전용 게이트 + 단어 단위 캐시.
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
  const parsed = CompareRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);

  // Pro 게이트
  if (!(await isUserPro(supabase, user.id)))
    return apiError(
      "PLAN_REQUIRED",
      "비교 단어 카드는 Pro 전용 기능입니다.",
      403,
    );

  const word = parsed.data.word.trim().toLowerCase();
  const key = cacheKey({ text: word, mode: "compare" });
  const cached = await getCached<Compare>(key);
  if (cached) return NextResponse.json(cached);

  let result: Compare;
  try {
    result = await generateJSON({
      model: MODELS.light,
      system: SYSTEM_COMPARE,
      user: userCompare(word),
      schema: CompareSchema,
      maxTokens: 1024,
    });
  } catch {
    return apiError("LLM_FAIL", "비교 카드 생성에 실패했습니다.", 502);
  }

  await setCached(key, result);
  return NextResponse.json(result);
}
