import { Button } from "@/components/ui/Button";
import { ScoreBars } from "./ScoreBars";
import { DiffView } from "./DiffView";
import { ExplanationCard } from "./ExplanationCard";
import type { Analyze } from "@/lib/schemas/llm";

export type AnalysisResult = Pick<
  Analyze,
  "scores" | "rewrite" | "diff" | "explanations"
> & { writingId: string };

export function AnalysisPanel({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      <ScoreBars scores={result.scores} />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">네이티브 리라이트</h3>
        <p className="rounded-btn border border-line2 bg-card p-3 text-[15px] leading-relaxed text-ink">
          {result.rewrite}
        </p>
      </div>

      <DiffView diff={result.diff} />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">
          왜 이 표현인가 ({result.explanations.length})
        </h3>
        <div className="space-y-2">
          {result.explanations.map((e, i) => (
            <ExplanationCard key={i} item={e} />
          ))}
        </div>
      </div>

      {/* 후속 액션 (T08 표현저장 / T09 3톤) — 자리만 */}
      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <Button variant="secondary" size="sm" disabled title="T09에서 연결">
          3톤으로 비교
        </Button>
        <Button variant="secondary" size="sm" disabled title="추후 연결">
          표현 저장
        </Button>
      </div>
    </div>
  );
}
