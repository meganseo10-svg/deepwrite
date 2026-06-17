import { cn } from "@/lib/utils";

// 의도 일치도 게이지 (06 화면3). 0~100 큰 숫자 + 진행 막대.
// 색: <50 경고(gold), 50~74 중립, 75+ 양호(ox).
export function FidelityGauge({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const tone = v >= 75 ? "ox" : v >= 50 ? "soft" : "gold";
  const barColor =
    tone === "ox" ? "bg-ox" : tone === "gold" ? "bg-gold" : "bg-soft";
  const numColor =
    tone === "ox" ? "text-ox" : tone === "gold" ? "text-gold" : "text-ink";

  return (
    <div>
      <div className="flex items-end gap-2">
        <span className={cn("text-4xl font-bold tabular-nums", numColor)}>
          {v}
        </span>
        <span className="mb-1 text-sm text-faint">/ 100 의도 일치도</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-line2">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
