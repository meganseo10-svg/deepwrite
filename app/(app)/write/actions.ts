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
