"use server";

import { createClient } from "@/lib/supabase/server";
import type { HintMode, Tone } from "@/lib/constants";

// 톤·힌트모드 선택을 사용자 프로필 기본값으로 저장 (새로고침에도 유지).
export async function updateWritingPrefs(tone: Tone, hintMode: HintMode) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" as const };

  const { error } = await supabase
    .from("profiles")
    .update({ default_tone: tone, hint_mode: hintMode })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { ok: true as const };
}

// 마이페이지: 표시 이름 변경.
export async function updateDisplayName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "이름을 입력해 주세요." as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" as const };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed.slice(0, 60) })
    .eq("id", user.id);
  if (error) return { error: error.message };
  return { ok: true as const };
}

// 표현장에서 표현 삭제 (RLS own express + user_id 조건 이중 가드).
export async function deleteExpression(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" as const };

  const { error } = await supabase
    .from("saved_expressions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return { ok: true as const };
}

// 네이티브 리라이트(또는 표현)를 표현장에 저장 (03 saved_expressions, deepread 모방 훈련 소스).
export async function saveExpression(expression: string, note?: string) {
  const text = expression.trim();
  if (!text) return { error: "빈 표현은 저장할 수 없습니다." as const };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" as const };

  const { error } = await supabase.from("saved_expressions").insert({
    user_id: user.id,
    expression: text.slice(0, 4000),
    note: note?.trim() || null,
    from_deepread: false,
  });
  if (error) return { error: error.message };
  return { ok: true as const };
}
