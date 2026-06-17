import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScoreBars } from "@/components/editor/ScoreBars";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { computeDashboard, type DashboardData } from "@/lib/dashboard";
import { weaknessLabel, TONE_OPTIONS } from "@/lib/constants";

const DEEPREAD_URL = process.env.NEXT_PUBLIC_DEEPREAD_URL ?? "#";

const EMPTY: DashboardData = {
  streak: 0,
  recent: [],
  latestScores: null,
  avgDeltaPct: null,
  topWeakness: null,
  totalWritings: 0,
};

function toneLabel(value: string): string {
  return TONE_OPTIONS.find((t) => t.value === value)?.label ?? value;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default async function DashboardPage() {
  let data: DashboardData = EMPTY;
  let displayName: string | null = null;
  let estimatedCefr: string | null = null;
  let onboarded = true;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, estimated_cefr")
        .eq("id", user.id)
        .maybeSingle();
      displayName = profile?.display_name ?? null;
      estimatedCefr = profile?.estimated_cefr ?? null;
      onboarded = !!estimatedCefr;
      data = await computeDashboard(supabase, user.id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            대시보드
            {displayName && (
              <span className="ml-2 text-base font-normal text-soft">
                {displayName}님
              </span>
            )}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-soft">
            오늘도 한 편 써볼까요? 통역사처럼 5차원으로 분석해 드립니다.
            {estimatedCefr && (
              <Badge tone="ox">베이스라인 {estimatedCefr}</Badge>
            )}
          </p>
        </div>
        <Link href="/write">
          <Button>새 작문 시작</Button>
        </Link>
      </div>

      {/* 온보딩 미완료 안내 */}
      {!onboarded && (
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <div className="text-sm font-medium text-ink">
                먼저 베이스라인을 진단해 보세요
              </div>
              <p className="mt-0.5 text-sm text-soft">
                짧은 글 3개로 추정 CEFR과 최약점을 잡아 드립니다.
              </p>
            </div>
            <Link href="/onboarding">
              <Button size="sm">온보딩 진단</Button>
            </Link>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {/* 오늘의 과제 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 과제</CardTitle>
          </CardHeader>
          <CardBody>
            {data.topWeakness ? (
              <>
                <p className="text-sm text-soft">
                  최약점{" "}
                  <span className="font-semibold text-ink">
                    {weaknessLabel(data.topWeakness)}
                  </span>
                  에 집중해 한 편 써보세요.
                </p>
                <div className="mt-3 flex gap-2">
                  <Link href="/write">
                    <Button size="sm">작문하기</Button>
                  </Link>
                  <Link href="/backtranslate">
                    <Button size="sm" variant="secondary">
                      역번역
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-soft">
                  약점 맞춤 과제가 여기에 표시됩니다.
                </p>
                <Badge tone="ox" className="mt-3">
                  첫 진단 후 활성화
                </Badge>
              </>
            )}
          </CardBody>
        </Card>

        {/* 연속 작성 streak */}
        <Card>
          <CardHeader>
            <CardTitle>연속 작성</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="text-3xl font-bold text-brand">
              {data.streak}일
            </div>
            <p className="mt-1 text-sm text-soft">
              {data.streak > 0
                ? "이 기세를 이어가요!"
                : "오늘 한 편으로 streak을 시작하세요."}
            </p>
          </CardBody>
        </Card>

        {/* 5차원 점수 추이 */}
        <Card>
          <CardHeader>
            <CardTitle>5차원 점수</CardTitle>
          </CardHeader>
          <CardBody>
            {data.latestScores ? (
              <div className="space-y-2">
                <ScoreBars scores={data.latestScores} />
                {data.avgDeltaPct !== null && (
                  <p className="text-xs text-faint">
                    직전 대비 평균{" "}
                    <span
                      className={
                        data.avgDeltaPct >= 0 ? "text-ox-dark" : "text-gold"
                      }
                    >
                      {data.avgDeltaPct >= 0 ? "▲" : "▼"}{" "}
                      {Math.abs(data.avgDeltaPct)}점
                    </span>
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-soft">
                첫 진단을 받으면 점수가 표시됩니다.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* 최근 작문 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 작문</CardTitle>
        </CardHeader>
        <CardBody>
          {data.recent.length > 0 ? (
            <ul className="divide-y divide-line">
              {data.recent.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span className="w-10 shrink-0 text-xs text-faint">
                    {fmtDate(w.created_at)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Badge>{toneLabel(w.target_tone)}</Badge>
                      {w.genre && (
                        <span className="text-xs text-faint">{w.genre}</span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-sm text-soft">
                      {w.preview || "—"}
                    </p>
                  </div>
                  {w.avg !== null && (
                    <span className="shrink-0 text-sm font-semibold text-ink">
                      {w.avg}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-btn border border-dashed border-line2 bg-paper2 px-4 py-10 text-center text-sm text-faint">
              아직 작문이 없습니다. 첫 글을 작성해 보세요.
            </div>
          )}
        </CardBody>
      </Card>

      {/* DEEPREAD 딥링크 */}
      <a
        href={DEEPREAD_URL}
        className="block rounded-card border border-ox/20 bg-ox/5 px-5 py-4 transition-colors hover:bg-ox/10"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-ox-dark">
              DEEPREAD로 읽기 훈련 →
            </div>
            <p className="mt-0.5 text-sm text-soft">
              자매 앱에서 읽은 표현을 여기 작문으로 옮겨 보세요.
            </p>
          </div>
          <span className="text-lg text-ox-dark">📖</span>
        </div>
      </a>
    </div>
  );
}
