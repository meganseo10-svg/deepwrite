import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Analyze } from "@/lib/schemas/llm";
import { avgScore } from "@/lib/constants";
import { computeStreak } from "@/lib/metrics";

// 대시보드 통합 데이터 (T13). 누적 작문/약점/프로필 기반 — LLM 미사용.

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;
type Scores = Analyze["scores"];

export type RecentWriting = {
  id: string;
  created_at: string;
  genre: string | null;
  target_tone: string;
  avg: number | null;
  preview: string;
};

export type DashboardData = {
  streak: number;
  recent: RecentWriting[];
  latestScores: Scores | null;
  avgDeltaPct: number | null; // 직전 작문 대비 평균 점수 변화(절대치, %포인트)
  topWeakness: string | null;
  totalWritings: number;
};

function avgOf(scores: Scores | null): number | null {
  return scores ? avgScore(scores) : null;
}

export async function computeDashboard(
  supabase: SupabaseServer,
  userId: string,
): Promise<DashboardData> {
  type Row = {
    id: string;
    created_at: string;
    genre: string | null;
    target_tone: string;
    scores: Scores | null;
    source_text: string;
  };

  // 서로 독립적인 두 쿼리(최근 작문 / 최다 약점)는 병렬 실행.
  const [writingsRes, weakRes] = await Promise.all([
    supabase
      .from("writings")
      .select("id, created_at, genre, target_tone, scores, source_text")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("weakness_summary")
      .select("category, cnt")
      .order("cnt", { ascending: false })
      .limit(1),
  ]);
  const rows = (writingsRes.data ?? []) as Row[];

  const recent: RecentWriting[] = rows.slice(0, 5).map((w) => ({
    id: w.id,
    created_at: w.created_at,
    genre: w.genre,
    target_tone: w.target_tone,
    avg: avgOf(w.scores),
    preview: w.source_text.replace(/\s+/g, " ").slice(0, 90),
  }));

  const scored = rows.filter((w) => w.scores);
  const latestScores = scored[0]?.scores ?? null;
  let avgDeltaPct: number | null = null;
  if (scored[0]?.scores && scored[1]?.scores) {
    const a = avgOf(scored[0].scores)!;
    const b = avgOf(scored[1].scores)!;
    avgDeltaPct = a - b;
  }

  const streak = computeStreak(rows.map((w) => w.created_at));

  // 최다 약점 (오늘의 과제용)
  const topWeakness =
    (weakRes.data as { category: string }[] | null)?.[0]?.category ?? null;

  return {
    streak,
    recent,
    latestScores,
    avgDeltaPct,
    topWeakness,
    totalWritings: rows.length,
  };
}
