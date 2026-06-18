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
import type { Analyze } from "@/lib/schemas/llm";

const GENRE_LABEL: Record<string, string> = {
  email: "이메일",
  report: "리포트",
  essay: "에세이",
  academic: "학술",
  summary: "요약",
  free: "자유",
};

type Writing = {
  id: string;
  created_at: string;
  genre: string | null;
  source_text: string;
  rewrite_text: string | null;
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

  const { data } = await supabase
    .from("writings")
    .select("id, created_at, genre, source_text, rewrite_text, scores, diff, explanations")
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

      {/* 중립 리라이트 (저장 시점엔 중립 1종만 저장됨) */}
      {w.rewrite_text && (
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

      <p className="pt-2 text-center text-xs text-faint">
        저장 시점엔 중립 리라이트만 기록돼요. 3톤 비교는 작문에서 다시 받을 수 있어요.
      </p>
    </div>
  );
}
