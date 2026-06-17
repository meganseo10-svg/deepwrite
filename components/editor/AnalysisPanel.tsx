import { ScoreBars } from "./ScoreBars";
import { DiffView } from "./DiffView";
import { ExplanationCard } from "./ExplanationCard";
import { SaveExpressionButton } from "./SaveExpressionButton";
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

      {/* 후속 액션: 네이티브 리라이트를 표현장에 저장 (3톤 비교는 좌측 패널 버튼) */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <SaveExpressionButton expression={result.rewrite} />
        <span className="text-xs text-faint">
          네이티브 리라이트를 표현장에 저장해 두고 다시 써보세요.
        </span>
      </div>
    </div>
  );
}
