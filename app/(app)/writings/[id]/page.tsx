import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScoreBars } from "@/components/editor/ScoreBars";
import { DiffView } from "@/components/editor/DiffView";
import { ExplanationCard } from "@/components/editor/ExplanationCard";
import { SaveExpressionButton } from "@/components/editor/SaveExpressionButton";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Analyze } from "@/lib/schemas/llm";

const GENRE_LABEL: Record<string, string> = {
  email: "이메일",
  report: "리포트",
  essay: "에세이",
  academic: "학술",
  summary: "요약",
  free: "자유",
};

const TONE_ACCENT: Record<Tone, string> = {
  formal: "border-ox/40 bg-ox/5",
  neutral: "border-line2 bg-paper2",
  casual: "border-gold/40 bg-gold/5",
};

type Writing = {
  id: string;
  created_at: string;
  genre: string | null;
  source_text: string;
  rewrite_text: string | null;
  rewrites: Analyze["rewrites"] | null; // 0005: 3톤 (없으면 중립만)
  scores: Analyze["scores"] | null;
  diff: Analyze["diff"] | null;
  explanations: Analyze["explanations"] | null;
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  // select("*") — rewrites 컬럼(0005) 미적용 환경에서도 안전(없는 컬럼명을 지정하면 에러).
  const { data } = await supabase
    .from("writings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // RLS 외 방어적 소유자 확인
    .maybeSingle();

  if (!data) notFound();
  const w = data as Writing;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/writings" className="text-sm text-soft hover:text-ink">
          ← 작문 기록
        </Link>
        <div className="flex items-center gap-2 text-xs text-faint">
          {w.genre && <Badge tone="neutral">{GENRE_LABEL[w.genre] ?? w.genre}</Badge>}
          <span>{fmtDate(w.created_at)}</span>
        </div>
      </div>

      {/* 원문 */}
      <Card>
        <CardBody className="pt-5">
          <div className="mb-1.5 text-xs font-medium text-faint">내가 쓴 글</div>
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
            {w.source_text}
          </p>
        </CardBody>
      </Card>

      {w.scores && <ScoreBars scores={w.scores} />}

      {/* 리라이트: 3톤이 저장돼 있으면 전부, 아니면 중립만 */}
      {w.rewrites ? (
        <Card>
          <CardBody className="pt-5">
            <div className="mb-2 text-xs font-medium text-faint">
              3톤 네이티브 리라이트
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {TONE_OPTIONS.map((t) => (
                <div
                  key={t.value}
                  className={cn("rounded-btn border p-3", TONE_ACCENT[t.value])}
                >
                  <div className="mb-1.5 text-xs font-medium text-soft">
                    {t.label}
                  </div>
                  <p className="text-[13px] leading-relaxed text-ink">
                    {w.rewrites![t.value]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <SaveExpressionButton expression={w.rewrites.neutral} />
            </div>
          </CardBody>
        </Card>
      ) : (
        w.rewrite_text && (
          <Card>
            <CardBody className="pt-5">
              <div className="mb-1.5 text-xs font-medium text-faint">
                다듬은 문장 (중립)
              </div>
              <p className="text-[15px] leading-relaxed text-ink">
                {w.rewrite_text}
              </p>
              <div className="mt-3 border-t border-line pt-3">
                <SaveExpressionButton expression={w.rewrite_text} />
              </div>
            </CardBody>
          </Card>
        )
      )}

      {w.diff && w.diff.length > 0 && <DiffView diff={w.diff} />}

      {w.explanations && w.explanations.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">
            왜 이 표현인가 ({w.explanations.length})
          </h3>
          <div className="space-y-2">
            {w.explanations.map((e, i) => (
              <ExplanationCard key={i} item={e} />
            ))}
          </div>
        </div>
      )}

      {!w.rewrites && (
        <p className="pt-2 text-center text-xs text-faint">
          이 글은 중립 리라이트만 기록돼 있어요. 이후 진단부터는 3톤이 함께 저장됩니다.
        </p>
      )}
    </div>
  );
}
