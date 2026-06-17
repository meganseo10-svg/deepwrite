import "server-only";
import type { createClient } from "@/lib/supabase/server";
import type { Analyze } from "@/lib/schemas/llm";
import { avgScore } from "@/lib/constants";

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

// created_at(UTC 일자) 집합에서 오늘(또는 어제)부터 이어지는 연속 작성일 수.
function computeStreak(dates: string[]): number {
  const set = new Set(dates.map((d) => d.slice(0, 10)));
  if (set.size === 0) return 0;
  const dayMs = 24 * 60 * 60 * 1000;
  let cursor = Date.now();
  const today = new Date(cursor).toISOString().slice(0, 10);
  // 오늘 작성이 없으면 어제부터 카운트(연속성 유지)
  if (!set.has(today)) cursor -= dayMs;
  let streak = 0;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= dayMs;
  }
  return streak;
}

export async function computeDashboard(
  supabase: SupabaseServer,
  userId: string,
): Promise<DashboardData> {
  // 최근 작문 (점수·미리보기용) — 최신순
  const { data: writings } = await supabase
    .from("writings")
    .select("id, created_at, genre, target_tone, scores, source_text")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  type Row = {
    id: string;
    created_at: string;
    genre: string | null;
    target_tone: string;
    scores: Scores | null;
    source_text: string;
  };
  const rows = (writings ?? []) as Row[];

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
  const { data: weak } = await supabase
    .from("weakness_summary")
    .select("category, cnt")
    .order("cnt", { ascending: false })
    .limit(1);
  const topWeakness =
    (weak as { category: string }[] | null)?.[0]?.category ?? null;

  return {
    streak,
    recent,
    latestScores,
    avgDeltaPct,
    topWeakness,
    totalWritings: rows.length,
  };
}
