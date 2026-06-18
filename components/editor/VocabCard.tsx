import type { ReactNode } from "react";
import type { Vocab } from "@/lib/schemas/llm";

// 어휘 카드 (deepread 단어장형). 진단 패널·어휘장에서 공용.
// action: 우상단에 둘 버튼(저장/삭제 등) — 선택.
export function VocabCard({ item, action }: { item: Vocab; action?: ReactNode }) {
  return (
    <div className="rounded-btn border border-line2 bg-card p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="text-[15px] font-semibold text-ink">
            {item.headword}
          </span>
          {item.pos && (
            <span className="ml-2 text-xs text-faint">{item.pos}</span>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {item.meaning_ko && (
        <p className="mt-1 text-[13px] leading-relaxed text-soft">
          {item.meaning_ko}
        </p>
      )}

      {item.example && (
        <p className="mt-1.5 text-[13px] italic leading-relaxed text-ink/80">
          “{item.example}”
        </p>
      )}

      {item.collocations.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.collocations.map((c, i) => (
            <span
              key={i}
              className="rounded-badge bg-paper2 px-2 py-0.5 text-xs text-soft"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {item.synonyms.length > 0 && (
        <div className="mt-2 space-y-0.5">
          <div className="text-xs font-medium text-faint">유의어</div>
          {item.synonyms.map((s, i) => (
            <div key={i} className="text-[13px] text-ink">
              <span className="font-medium">{s.word}</span>
              {s.nuance && <span className="text-soft"> — {s.nuance}</span>}
            </div>
          ))}
        </div>
      )}

      {item.antonyms.length > 0 && (
        <div className="mt-2 text-[13px]">
          <span className="text-xs font-medium text-faint">반의어 </span>
          <span className="text-soft">{item.antonyms.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
