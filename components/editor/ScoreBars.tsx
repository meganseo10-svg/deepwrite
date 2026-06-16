import type { Analyze } from "@/lib/schemas/llm";

const DIMS: { key: keyof Analyze["scores"]; label: string }[] = [
  { key: "lexis", label: "어휘" },
  { key: "collocation", label: "콜로케이션" },
  { key: "structure", label: "문장 구조" },
  { key: "cohesion", label: "응집" },
  { key: "tone", label: "톤 일치" },
];

export function ScoreBars({ scores }: { scores: Analyze["scores"] }) {
  const avg = Math.round(
    DIMS.reduce((s, d) => s + scores[d.key], 0) / DIMS.length,
  );
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">5차원 점수</h3>
        <span className="text-sm text-soft">
          평균 <span className="font-semibold text-ink">{avg}</span>/100
        </span>
      </div>
      <div className="space-y-2">
        {DIMS.map((d) => {
          const v = scores[d.key];
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-soft">{d.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <div
                  className="bg-brand h-full rounded-full"
                  style={{ width: `${v}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium text-ink">
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
