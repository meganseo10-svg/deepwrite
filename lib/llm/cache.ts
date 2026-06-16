import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 캐시 키: sha256(normalizedText + tone + mode) (02 §6).
 * 개인정보 없는 일반 표현(힌트·비교단어)만 캐싱 — 사용자 글 원문은 캐싱하지 않음(04 비용·안정 규칙).
 */
export function cacheKey(parts: {
  text: string;
  tone?: string;
  mode: string;
}): string {
  const normalized = parts.text.trim().toLowerCase().replace(/\s+/g, " ");
  return createHash("sha256")
    .update(`${normalized}|${parts.tone ?? ""}|${parts.mode}`)
    .digest("hex");
}

export async function getCached<T>(key: string): Promise<T | null> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from("llm_cache")
    .select("payload")
    .eq("cache_key", key)
    .maybeSingle();
  if (error || !data) return null;
  return data.payload as T;
}

export async function setCached(key: string, payload: unknown): Promise<void> {
  const sb = createAdminClient();
  await sb.from("llm_cache").upsert({ cache_key: key, payload });
}
