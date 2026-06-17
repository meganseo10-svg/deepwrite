import { weaknessLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

// 추이 배지: 오류가 줄면 개선(ox), 늘면 악화(gold).
function TrendBadge({ pct }: { pct: number }) {
  if (pct === 0)
    return <span className="text-xs text-faint">— 변화 없음</span>;
  const improved = pct < 0;
  return (
    <span
      className={cn(
        "rounded-badge px-1.5 py-0.5 text-xs font-medium",
        improved ? "bg-ox/10 text-ox-dark" : "bg-gold/10 text-gold",
      )}
      title="지난주 대비"
    >
      {improved ? "▼" : "▲"} {Math.abs(pct)}%
    </span>
  );
}

// 약점 랭킹 막대 한 줄 (06 화면4). 횟수는 최댓값 대비 너비로 시각화.
export function WeaknessBar({
  category,
  cnt,
  trendPct,
  max,
}: {
  category: string;
  cnt: number;
  trendPct: number;
  max: number;
}) {
  const width = max > 0 ? Math.max(6, Math.round((cnt / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">
          {weaknessLabel(category)}
        </span>
        <div className="flex items-center gap-2">
          <TrendBadge pct={trendPct} />
          <span className="text-sm tabular-nums text-soft">{cnt}회</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-line2">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
