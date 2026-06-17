import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AdminUserTable,
  type AdminUser,
} from "@/components/admin/AdminUserTable";
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

type Sb = ReturnType<typeof createAdminClient>;

async function countAll(sb: Sb, table: string): Promise<number> {
  const { count } = await sb
    .from(table)
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

async function countSince(
  sb: Sb,
  table: string,
  sinceIso: string,
): Promise<number> {
  const { count } = await sb
    .from(table)
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceIso);
  return count ?? 0;
}

export default async function AdminPage() {
  if (!isSupabaseConfigured) redirect("/dashboard");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) redirect("/dashboard");

  const sb = createAdminClient();
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const todayIso = since.toISOString();

  const [
    users,
    writings,
    backtrans,
    weakness,
    expressions,
    cache,
    todaySignups,
    todayWritings,
    profilesRes,
    authRes,
    recentWritingsRes,
  ] = await Promise.all([
    countAll(sb, "profiles"),
    countAll(sb, "writings"),
    countAll(sb, "backtranslations"),
    countAll(sb, "weakness_events"),
    countAll(sb, "saved_expressions"),
    countAll(sb, "llm_cache"),
    countSince(sb, "profiles", todayIso),
    countSince(sb, "writings", todayIso),
    sb.from("profiles").select("id, display_name, plan, estimated_cefr"),
    sb.auth.admin.listUsers({ page: 1, perPage: 50 }),
    sb
      .from("writings")
      .select("id, source_text, scores, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // 요금제 분포
  const profileRows = (profilesRes.data ?? []) as {
    id: string;
    display_name: string | null;
    plan: string;
    estimated_cefr: string | null;
  }[];
  const planDist: Record<string, number> = {};
  for (const r of profileRows) planDist[r.plan] = (planDist[r.plan] ?? 0) + 1;
  const profileById = new Map(profileRows.map((r) => [r.id, r]));

  // 사용자 목록 (auth 이메일 + 프로필 병합)
  const adminUsers: AdminUser[] = (authRes.data?.users ?? []).map((u) => {
    const p = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      name: p?.display_name ?? null,
      plan: p?.plan ?? "free",
      cefr: p?.estimated_cefr ?? null,
      joined: u.created_at ? fmtDate(u.created_at) : "—",
    };
  });

  const recentWritings = (recentWritingsRes.data ?? []) as {
    id: string;
    source_text: string;
    scores: { lexis: number; collocation: number; structure: number; grammar: number; tone: number } | null;
    created_at: string;
  }[];

  const stats = [
    { label: "사용자", value: users },
    { label: "오늘 가입", value: todaySignups },
    { label: "작문", value: writings },
    { label: "오늘 작문", value: todayWritings },
    { label: "역번역", value: backtrans },
    { label: "약점 이벤트", value: weakness },
    { label: "저장 표현", value: expressions },
    { label: "LLM 캐시", value: cache },
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>최근 작문</CardTitle>
          </CardHeader>
          <CardBody className="divide-y divide-line">
            {recentWritings.length === 0 ? (
              <p className="py-2 text-sm text-faint">데이터 없음</p>
            ) : (
              recentWritings.map((w) => {
                const avg = w.scores
                  ? Math.round(
                      (w.scores.lexis +
                        w.scores.collocation +
                        w.scores.structure +
                        w.scores.grammar +
                        w.scores.tone) /
                        5,
                    )
                  : null;
                return (
                  <div key={w.id} className="flex items-center gap-3 py-2">
                    <span className="w-10 shrink-0 text-xs text-faint">
                      {fmtDate(w.created_at)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-soft">
                      {w.source_text.replace(/\s+/g, " ").slice(0, 80) || "—"}
                    </span>
                    {avg !== null && (
                      <span className="shrink-0 text-sm font-semibold text-ink">
                        {avg}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 ({adminUsers.length})</CardTitle>
        </CardHeader>
        <CardBody>
          <AdminUserTable users={adminUsers} />
          <p className="mt-3 text-xs text-faint">
            요금제 셀렉트를 바꾸면 즉시 반영됩니다(결제 없이 게이트 테스트용).
            최근 50명까지 표시.
          </p>
        </CardBody>
      </Card>

      <p className="text-xs text-faint">
        관리자 권한은 이메일 화이트리스트(env ADMIN_EMAILS)로 관리됩니다.
      </p>
    </div>
  );
}
