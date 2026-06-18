import { ScoreBars } from "./ScoreBars";
import { DiffView } from "./DiffView";
import { ExplanationCard } from "./ExplanationCard";
import { SaveExpressionButton } from "./SaveExpressionButton";
import { SaveVocabButton } from "./SaveVocabButton";
import { VocabCard } from "./VocabCard";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Analyze } from "@/lib/schemas/llm";

export type AnalysisResult = Pick<
  Analyze,
  "scores" | "rewrites" | "diff" | "explanations" | "vocab"
> & { writingId: string };

const TONE_ACCENT: Record<Tone, string> = {
  formal: "border-ox/40 bg-ox/5",
  neutral: "border-line2 bg-paper2",
  casual: "border-gold/40 bg-gold/5",
};

export function AnalysisPanel({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      <ScoreBars scores={result.scores} />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">
          3톤 네이티브 리라이트
        </h3>
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
                {result.rewrites[t.value]}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-faint">
          아래 변경 비교·설명은 <span className="text-soft">중립</span> 기준입니다.
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

      {result.vocab && result.vocab.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">
            어휘 카드 ({result.vocab.length}) · 하나씩 어휘장에 담아 복습하세요
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {result.vocab.map((v, i) => (
              <VocabCard key={i} item={v} action={<SaveVocabButton item={v} />} />
            ))}
          </div>
        </div>
      )}

      {/* 후속 액션: 네이티브 리라이트를 표현장에 저장 (3톤 비교는 좌측 패널 버튼) */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <SaveExpressionButton expression={result.rewrites.neutral} />
        <span className="text-xs text-faint">
          중립 리라이트를 어휘장에 저장해 두고 다시 써보세요.
        </span>
      </div>
    </div>
  );
}
