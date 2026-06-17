import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { trendPct } from "@/lib/metrics";

// 약점 리포트 집계 (05 GET /api/weakness).
// weakness_summary 뷰(유형별 총 누적) + weakness_events 기간 비교로 추이(trendPct)를 계산한다.
// LLM 미사용 — 누적 데이터만으로 산출(라이브 크레딧과 무관).

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

const DAY_MS = 24 * 60 * 60 * 1000;

export type WeaknessRankItem = {
  category: string;
  cnt: number;
  trendPct: number; // 지난주 대비 ±% (음수=개선). prior=0 & recent>0 → 100(신규).
};

export type DrillItem = { detail: string | null; example: string | null };

export type WeaknessReport = {
  ranking: WeaknessRankItem[];
  drillSuggestion: { category: string; items: DrillItem[] } | null;
};

export async function computeWeaknessReport(
  supabase: SupabaseServer,
  userId: string,
): Promise<WeaknessReport> {
  // 1) 유형별 총 누적 (RLS security_invoker → 본인 행만)
  // 2) 최근 14일 이벤트로 추이 계산 (최근 7일 vs 직전 7일)
  // 두 쿼리는 서로 독립이므로 병렬 실행.
  const now = Date.now();
  const since14 = new Date(now - 14 * DAY_MS).toISOString();
  const cutoff7 = now - 7 * DAY_MS;

  const [summaryRes, recentRes] = await Promise.all([
    supabase
      .from("weakness_summary")
      .select("category, cnt")
      .order("cnt", { ascending: false }),
    supabase
      .from("weakness_events")
      .select("category, created_at")
      .eq("user_id", userId)
      .gte("created_at", since14),
  ]);

  const totals = (summaryRes.data ?? []) as { category: string; cnt: number }[];
  const recentEvents = recentRes.data;

  const recent: Record<string, number> = {};
  const prior: Record<string, number> = {};
  for (const e of (recentEvents ?? []) as {
    category: string;
    created_at: string;
  }[]) {
    const bucket = new Date(e.created_at).getTime() >= cutoff7 ? recent : prior;
    bucket[e.category] = (bucket[e.category] ?? 0) + 1;
  }

  const ranking: WeaknessRankItem[] = totals.map((t) => ({
    category: t.category,
    cnt: t.cnt,
    trendPct: trendPct(recent[t.category] ?? 0, prior[t.category] ?? 0),
  }));

  // 3) 맞춤 드릴: 최다 약점 유형의 최근 실수 예시 (집중 복습용)
  let drillSuggestion: WeaknessReport["drillSuggestion"] = null;
  const top = ranking[0]?.category;
  if (top) {
    const { data: items } = await supabase
      .from("weakness_events")
      .select("detail, example")
      .eq("user_id", userId)
      .eq("category", top)
      .order("created_at", { ascending: false })
      .limit(3);
    drillSuggestion = {
      category: top,
      items: (items ?? []) as DrillItem[],
    };
  }

  return { ranking, drillSuggestion };
}
