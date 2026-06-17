import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateJSON } from "@/lib/llm/generate";
import { MODELS } from "@/lib/llm/anthropic";
import { SYSTEM_ANALYZE, userAnalyze } from "@/lib/llm/prompts";
import { AnalyzeRequestSchema, AnalyzeSchema } from "@/lib/schemas/llm";
import { apiError } from "@/lib/http";

const FREE_DAILY_LIMIT = 3; // 05: free=일 3회 / basic+=무제한

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
  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", "입력이 올바르지 않습니다.", 400);
  const { text, genre } = parsed.data;

  // 플랜 게이트: free 는 1일 3회 (RLS 덕에 본인 글만 카운트됨)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const plan = profile?.plan ?? "free";
  if (plan === "free") {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("writings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString());
    if ((count ?? 0) >= FREE_DAILY_LIMIT)
      return apiError(
        "RATE_LIMIT",
        `무료 플랜은 하루 ${FREE_DAILY_LIMIT}회까지 진단할 수 있습니다. Pro로 업그레이드하면 무제한입니다.`,
        429,
      );
  }

  // 04 규칙: 사용자 글 원문은 캐싱하지 않음(개인정보) → analyze 는 캐시 미사용.
  let result;
  try {
    result = await generateJSON({
      model: MODELS.heavy,
      system: SYSTEM_ANALYZE,
      user: userAnalyze(text, genre),
      schema: AnalyzeSchema,
      thinking: true,
      maxTokens: 8000,
    });
  } catch {
    return apiError(
      "LLM_FAIL",
      "진단 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      502,
    );
  }

  // writings 적재
  const { data: writing, error: wErr } = await supabase
    .from("writings")
    .insert({
      user_id: user.id,
      genre: genre ?? null,
      target_tone: "neutral", // 톤 미선택 — 중립 리라이트를 기준으로 저장
      source_text: text,
      rewrite_text: result.rewrites.neutral,
      scores: result.scores,
      diff: result.diff,
      explanations: result.explanations,
    })
    .select("id")
    .single();
  if (wErr || !writing)
    return apiError("LLM_FAIL", "결과 저장에 실패했습니다.", 500);

  // weakness_events 적재 (누적 약점 분석용)
  if (result.weaknesses.length > 0) {
    await supabase.from("weakness_events").insert(
      result.weaknesses.map((w) => ({
        user_id: user.id,
        writing_id: writing.id,
        category: w.category,
        detail: w.detail,
        example: w.example,
      })),
    );
  }

  return NextResponse.json({
    writingId: writing.id,
    scores: result.scores,
    rewrites: result.rewrites,
    diff: result.diff,
    explanations: result.explanations,
  });
}
