import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_COLLOCATION, userCollocation } from "@/lib/llm/prompts";
import {
  CollocationRequestSchema,
  CollocationSchema,
  type Collocation,
} from "@/lib/schemas/llm";
import { cacheKey, getCached, setCached } from "@/lib/llm/cache";
import { apiError } from "@/lib/http";

// 라이브 콜로케이션 힌트 (경량 모델 + 캐시). 일반 단어 단위라 캐싱 안전(04).
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
  const parsed = CollocationRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);

  const headword = parsed.data.headword.trim().toLowerCase();
  const { tone } = parsed.data;

  // 캐시 확인 (headword + tone)
  const key = cacheKey({ text: headword, tone, mode: "collocation" });
  const cached = await getCached<Collocation>(key);
  if (cached) return NextResponse.json(cached);

  let result: Collocation;
  try {
    result = await generateJSON({
      model: MODELS.light,
      system: SYSTEM_COLLOCATION,
      user: userCollocation(headword, tone),
      schema: CollocationSchema,
      maxTokens: 1024,
    });
  } catch {
    return apiError("LLM_FAIL", "힌트 생성에 실패했습니다.", 502);
  }

  await setCached(key, result);
  return NextResponse.json(result);
}
