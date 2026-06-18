import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "@/components/mypage/ProfileForm";
import { CancelSubscriptionButton } from "@/components/billing/CancelSubscriptionButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plan";
import { computeStreak } from "@/lib/metrics";
import { avgScore } from "@/lib/constants";
import {
  computeLevel,
  achievements,
  xpOf,
  type GamiStats,
} from "@/lib/gamification";
import { signOut } from "@/app/(auth)/login/actions";

const PLAN_LABEL: Record<string, string> = {
  free: "무료",
  basic: "베이식",
  pro: "프로",
  master: "마스터",
  business: "비즈니스",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-soft">{label}</span>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <Card>
      <CardBody className="py-4 text-center">
        <div className="text-2xl font-bold text-brand">{value}</div>
        <div className="mt-1 text-xs text-soft">{label}</div>
      </CardBody>
    </Card>
  );
}

function dateStr(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

type ScoreSet = Parameters<typeof avgScore>[0];

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing } = await searchParams;
  let email: string | null = null;
  let displayName = "";
  let plan = "free";
  let cefr: string | null = null;
  let joined: string | null = null;
  let subPeriodEnd: string | null = null;
  const stats: GamiStats = { writings: 0, streak: 0, vocab: 0, backtrans: 0 };
  let avg: number | null = null;

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      email = user.email ?? null;

      const [profileRes, subRes, writingsRes, vocabRes, backtransRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("display_name, plan, estimated_cefr, created_at")
            .eq("id", user.id)
            .maybeSingle(),
          supabase
            .from("subscriptions")
            .select("current_period_end")
            .eq("user_id", user.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("writings")
            .select("created_at, scores")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(400),
          supabase
            .from("saved_expressions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("backtranslations")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

      displayName = profileRes.data?.display_name ?? "";
      plan = profileRes.data?.plan ?? "free";
      cefr = profileRes.data?.estimated_cefr ?? null;
      joined = profileRes.data?.created_at ?? null;
      subPeriodEnd = subRes.data?.current_period_end ?? null;

      const rows = (writingsRes.data ?? []) as {
        created_at: string;
        scores: ScoreSet | null;
      }[];
      stats.writings = rows.length;
      stats.streak = computeStreak(rows.map((r) => r.created_at));
      stats.vocab = vocabRes.count ?? 0;
      stats.backtrans = backtransRes.count ?? 0;

      const scored = rows.filter((r) => r.scores).slice(0, 20);
      if (scored.length > 0) {
        avg = Math.round(
          scored.reduce((a, r) => a + avgScore(r.scores as ScoreSet), 0) /
            scored.length,
        );
      }
    }
  }

  const hasActiveSub = !!subPeriodEnd;
  const lv = computeLevel(stats.writings);
  const xp = xpOf(stats);
  const badges = achievements(stats);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-ink">마이페이지</h1>

      {billing === "success" && (
        <div className="rounded-card border border-ox bg-ox/5 px-4 py-3 text-sm text-ink">
          결제가 완료되었어요. 새 요금제가 적용되었습니다. 🎉
        </div>
      )}

      {/* 레벨 / 성장 */}
      <Card>
        <CardBody className="pt-5">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-card bg-paper2 text-3xl">
              {lv.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-bold text-ink">
                  Lv.{lv.level} · {lv.title}
                </span>
                <span className="text-xs text-faint">XP {xp}</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${lv.progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-soft">
                {lv.isMax
                  ? "최고 레벨에 도달했어요. 멋져요! 🏆"
                  : `다음 레벨까지 작문 ${lv.toNext}편`}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={stats.writings} label="작문" />
        <Stat value={`${stats.streak}일`} label="연속 작성" />
        <Stat value={stats.vocab} label="저장 어휘" />
        <Stat value={avg ?? "—"} label="평균 점수" />
      </div>

      {/* 업적 */}
      <Card>
        <CardHeader>
          <CardTitle>업적</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {badges.map((b) => (
              <div
                key={b.key}
                className={
                  "flex items-center gap-2 rounded-btn border p-2.5 " +
                  (b.earned
                    ? "border-ox/40 bg-ox/5"
                    : "border-line2 bg-paper2 opacity-50")
                }
                title={b.desc}
              >
                <span className="text-xl">{b.earned ? b.emoji : "🔒"}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-ink">
                    {b.label}
                  </div>
                  <div className="truncate text-xs text-faint">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
        </CardHeader>
        <CardBody>
          <ProfileForm initialName={displayName} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
        </CardHeader>
        <CardBody className="divide-y divide-line">
          <Row label="이메일" value={email ?? "—"} />
          <Row
            label="요금제"
            value={
              <div className="flex items-center gap-2">
                <Badge tone={isProPlan(plan) ? "ox" : "neutral"}>
                  {PLAN_LABEL[plan] ?? plan}
                </Badge>
                {plan === "free" && (
                  <Link
                    href="/pricing"
                    className="text-xs font-medium text-ox-dark hover:underline"
                  >
                    업그레이드 →
                  </Link>
                )}
              </div>
            }
          />
          {hasActiveSub && (
            <Row
              label="다음 결제일"
              value={
                <div className="flex items-center gap-3">
                  <span>{dateStr(subPeriodEnd)}</span>
                  <CancelSubscriptionButton />
                </div>
              }
            />
          )}
          <Row label="추정 CEFR" value={cefr ?? "온보딩 진단 전"} />
          <Row label="가입일" value={dateStr(joined)} />
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <form action={signOut}>
          <Button type="submit" variant="secondary" size="sm">
            로그아웃
          </Button>
        </form>
      </div>
    </div>
  );
}
