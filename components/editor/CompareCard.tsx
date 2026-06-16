import { Badge } from "@/components/ui/Badge";
import type { Compare } from "@/lib/schemas/llm";
import { cn } from "@/lib/utils";

function Intensity({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`강도 ${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i <= n ? "bg-gold" : "bg-line2",
          )}
        />
      ))}
    </span>
  );
}

// 비교 단어 카드 (06 UI): 근의어·격식·강도·뉘앙스·콜로케이션 + 반의어.
export function CompareCard({
  data,
  loading,
  onClose,
}: {
  data: Compare;
  loading?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="rounded-btn border border-line2 bg-card p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-faint">비교 · </span>
          <span className="font-semibold text-ink">{data.word}</span>
          {loading && <span className="ml-2 text-xs text-faint">…</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-badge px-1.5 text-faint hover:text-ink"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-2">
        {data.near_synonyms.map((s, i) => (
          <li key={i} className="border-b border-line pb-2 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-ink">{s.word}</span>
              <Badge tone="neutral" className="shrink-0">
                {s.register}
              </Badge>
              <span className="ml-auto">
                <Intensity n={s.intensity} />
              </span>
            </div>
            <p className="mt-0.5 text-xs text-soft">{s.nuance}</p>
            <p className="mt-0.5 font-mono text-xs text-faint">{s.collocation}</p>
          </li>
        ))}
      </ul>

      {data.antonyms.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line pt-2">
          <span className="text-xs text-faint">반의어</span>
          {data.antonyms.map((a, i) => (
            <span
              key={i}
              className="rounded-badge bg-paper2 px-2 py-0.5 text-xs text-soft"
            >
              {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
