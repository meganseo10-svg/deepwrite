import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

const PLAN_LABEL: Record<string, string> = {
  free: "무료",
  basic: "베이식",
  pro: "프로",
  master: "마스터",
  business: "비즈니스",
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

async function count(
  sb: ReturnType<typeof createAdminClient>,
  table: string,
): Promise<number> {
  const { count } = await sb
    .from(table)
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export default async function AdminPage() {
  if (!isSupabaseConfigured) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // 미인증은 미들웨어가 차단. 비관리자는 대시보드로.
  if (!user || !isAdminEmail(user.email)) redirect("/dashboard");

  const sb = createAdminClient();
  const [users, writings, backtrans, weakness, recent] = await Promise.all([
    count(sb, "profiles"),
    count(sb, "writings"),
    count(sb, "backtranslations"),
    count(sb, "weakness_events"),
    sb
      .from("profiles")
      .select("display_name, plan, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const recentUsers = (recent.data ?? []) as {
    display_name: string | null;
    plan: string;
    created_at: string;
  }[];

  // 플랜 분포 (최근 가입 표본이 아니라 전체) — 별도 집계
  const { data: planRows } = await sb.from("profiles").select("plan");
  const planDist: Record<string, number> = {};
  for (const r of (planRows ?? []) as { plan: string }[]) {
    planDist[r.plan] = (planDist[r.plan] ?? 0) + 1;
  }

  const stats = [
    { label: "사용자", value: users },
    { label: "작문", value: writings },
    { label: "역번역", value: backtrans },
    { label: "약점 이벤트", value: weakness },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-ink">관리자</h1>
        <Badge tone="gold">admin</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="py-4 text-center">
              <div className="text-2xl font-bold text-brand">{s.value}</div>
              <div className="mt-1 text-xs text-soft">{s.label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>요금제 분포</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-line">
            {Object.keys(planDist).length === 0 ? (
              <p className="py-2 text-sm text-faint">데이터 없음</p>
            ) : (
              Object.entries(planDist)
                .sort((a, b) => b[1] - a[1])
                .map(([plan, n]) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="text-soft">
                      {PLAN_LABEL[plan] ?? plan}
                    </span>
                    <span className="font-medium text-ink">{n}명</span>
                  </div>
                ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 가입</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-line">
            {recentUsers.length === 0 ? (
              <p className="py-2 text-sm text-faint">데이터 없음</p>
            ) : (
              recentUsers.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {u.display_name ?? "—"}
                  </span>
                  <Badge tone="neutral">{PLAN_LABEL[u.plan] ?? u.plan}</Badge>
                  <span className="shrink-0 text-xs text-faint">
                    {fmtDate(u.created_at)}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <p className="text-xs text-faint">
        관리자 권한은 이메일 화이트리스트(env ADMIN_EMAILS)로 관리됩니다.
      </p>
    </div>
  );
}
