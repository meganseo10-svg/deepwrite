import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "@/components/mypage/ProfileForm";
import { CancelSubscriptionButton } from "@/components/billing/CancelSubscriptionButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isProPlan } from "@/lib/plan";
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

function dateStr(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

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

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      email = user.email ?? null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, plan, estimated_cefr, created_at")
        .eq("id", user.id)
        .maybeSingle();
      displayName = data?.display_name ?? "";
      plan = data?.plan ?? "free";
      cefr = data?.estimated_cefr ?? null;
      joined = data?.created_at ?? null;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("current_period_end")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      subPeriodEnd = sub?.current_period_end ?? null;
    }
  }

  const hasActiveSub = !!subPeriodEnd;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-ink">마이페이지</h1>

      {billing === "success" && (
        <div className="rounded-card border border-ox bg-ox/5 px-4 py-3 text-sm text-ink">
          결제가 완료되었어요. 새 요금제가 적용되었습니다. 🎉
        </div>
      )}

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
          <Row
            label="추정 CEFR"
            value={cefr ?? "온보딩 진단 전"}
          />
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
