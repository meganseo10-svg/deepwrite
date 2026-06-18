import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { WeaknessBar } from "@/components/weakness/WeaknessBar";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { computeWeaknessReport, type WeaknessReport } from "@/lib/weakness";
import { weaknessLabel } from "@/lib/constants";

// 약점 리포트 (T11). 서버에서 집계를 직접 호출(읽기 전용).
export default async function WeaknessPage() {
  let report: WeaknessReport = { ranking: [], drillSuggestion: null };

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) report = await computeWeaknessReport(supabase, user.id);
  }

  const max = report.ranking[0]?.cnt ?? 0;
  const hasData = report.ranking.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink">약점 리포트</h1>

      {!hasData ? (
        <Card>
          <CardBody className="flex min-h-48 flex-col items-center justify-center px-4 py-10 text-center">
            <div className="text-sm font-medium text-soft">
              아직 누적된 약점이 없어요
            </div>
            <p className="mt-2 max-w-sm text-sm text-faint">
              작문을 진단받으면 오류가 유형별로 쌓이고, 여기에서 랭킹·추이와
              맞춤 드릴을 볼 수 있어요.
            </p>
            <Link href="/write" className={buttonClass({ size: "sm", className: "mt-4" })}>
              작문 진단받기
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 오류 유형 랭킹 */}
          <Card>
            <CardHeader>
              <CardTitle>오류 유형 랭킹</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {report.ranking.map((r) => (
                <WeaknessBar
                  key={r.category}
                  category={r.category}
                  cnt={r.cnt}
                  trendPct={r.trendPct}
                  max={max}
                />
              ))}
              <p className="pt-1 text-xs text-faint">
                추이 배지는 지난주 대비입니다 (▼ 감소=개선, ▲ 증가).
              </p>
            </CardBody>
          </Card>

          {/* 오늘의 맞춤 드릴 */}
          <Card>
            <CardHeader>
              <CardTitle>오늘의 맞춤 드릴</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {report.drillSuggestion && (
                <>
                  <p className="text-sm text-soft">
                    가장 잦은 약점은{" "}
                    <span className="font-semibold text-ink">
                      {weaknessLabel(report.drillSuggestion.category)}
                    </span>
                    입니다. 최근 실수를 복습하고 집중 연습해 보세요.
                  </p>

                  {report.drillSuggestion.items.length > 0 && (
                    <ul className="space-y-2">
                      {report.drillSuggestion.items.map((it, i) => (
                        <li
                          key={i}
                          className="rounded-btn border border-line2 bg-paper2 p-3 text-[13px]"
                        >
                          {it.example && (
                            <div className="text-ink">“{it.example}”</div>
                          )}
                          {it.detail && (
                            <div className="mt-0.5 text-soft">{it.detail}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Link
                      href="/backtranslate"
                      className={buttonClass({ size: "sm" })}
                    >
                      역번역으로 연습
                    </Link>
                    <Link
                      href="/write"
                      className={buttonClass({ size: "sm", variant: "secondary" })}
                    >
                      작문하기
                    </Link>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
