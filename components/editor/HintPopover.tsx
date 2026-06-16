import { Badge } from "@/components/ui/Badge";
import type { Collocation } from "@/lib/schemas/llm";
import { cn } from "@/lib/utils";

function FreqBar({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" title={`빈도 ${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-1 rounded-sm",
            i <= n ? "bg-ox" : "bg-line2",
          )}
        />
      ))}
    </span>
  );
}

// 작성 중 하단에 떠오르는 콜로케이션 힌트 (06 UI 화면1).
export function HintPopover({
  data,
  loading,
  onClose,
}: {
  data: Collocation;
  loading?: boolean;
  onClose: () => void;
}) {
  return (
    <div className="rounded-btn border border-line2 bg-card p-3 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-faint">콜로케이션 · </span>
          <span className="font-semibold text-ink">{data.headword}</span>
          {loading && <span className="ml-2 text-xs text-faint">…</span>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-badge px-1.5 text-faint hover:text-ink"
          aria-label="힌트 닫기"
        >
          ✕
        </button>
      </div>

      <ul className="space-y-1.5">
        {data.collocations.map((c, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="font-medium text-ink">{c.phrase}</span>
            <Badge tone="neutral" className="shrink-0">
              {c.register}
            </Badge>
            <span className="ml-auto">
              <FreqBar n={c.freq} />
            </span>
          </li>
        ))}
      </ul>

      {data.warnings.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-line pt-2">
          {data.warnings.map((w, i) => (
            <p key={i} className="text-xs text-gold">
              ⚠ <span className="font-medium line-through">{w.wrong}</span> —{" "}
              {w.why}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
