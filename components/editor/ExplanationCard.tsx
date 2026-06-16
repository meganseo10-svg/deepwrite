import { Badge } from "@/components/ui/Badge";
import type { Analyze } from "@/lib/schemas/llm";

const DIM_LABEL: Record<string, string> = {
  lexis: "어휘",
  collocation: "콜로케이션",
  structure: "문장 구조",
  cohesion: "응집",
  tone: "톤",
};

// "왜 이 표현인가" 카드: before→after + 이유 + 규칙 + 빈도 배지 (06 UI).
export function ExplanationCard({ item }: { item: Analyze["explanations"][number] }) {
  return (
    <div className="rounded-btn border border-line2 bg-card p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gold line-through opacity-70">{item.before}</span>
        <span className="text-faint">→</span>
        <span className="font-medium text-ink">{item.after}</span>
        <Badge tone="ox" className="ml-auto">
          {DIM_LABEL[item.dimension] ?? item.dimension}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-soft">{item.reason}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-badge bg-paper2 px-2 py-0.5 text-soft">
          규칙: {item.rule}
        </span>
        <Badge tone="gold">{item.frequency}</Badge>
      </div>
    </div>
  );
}
