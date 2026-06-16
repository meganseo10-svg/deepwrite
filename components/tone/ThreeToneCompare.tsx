import { Button } from "@/components/ui/Button";
import { PlanLock } from "@/components/ui/PlanLock";
import { TONE_OPTIONS, type Tone } from "@/lib/constants";
import type { Consistency, ToneResult } from "@/lib/schemas/llm";
import { cn } from "@/lib/utils";

// 톤별 컬럼 색 강조(격식=청록 ox / 중립=중성 / 구어=골드)
const TONE_ACCENT: Record<Tone, string> = {
  formal: "border-ox/40 bg-ox/5",
  neutral: "border-line2 bg-paper2",
  casual: "border-gold/40 bg-gold/5",
};

// 3톤 비교 (06 화면2): 3컬럼 버전 + 드라이버 표 + consistency_tip 배너 + (Pro)일관성 검사.
export function ThreeToneCompare({
  data,
  onClose,
  isPro,
  consistency,
  consistencyLoading,
  onCheckConsistency,
}: {
  data: ToneResult;
  onClose: () => void;
  isPro: boolean;
  consistency: Consistency | null;
  consistencyLoading: boolean;
  onCheckConsistency: () => void;
}) {
  return (
    <div className="rounded-btn border border-line2 bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">3톤 비교</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-badge px-1.5 text-faint hover:text-ink"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* 3컬럼 버전 */}
      <div className="grid gap-2 sm:grid-cols-3">
        {TONE_OPTIONS.map((t) => (
          <div
            key={t.value}
            className={cn("rounded-btn border p-3", TONE_ACCENT[t.value])}
          >
            <div className="mb-1.5 text-xs font-medium text-soft">{t.label}</div>
            <p className="text-[13px] leading-relaxed text-ink">
              {data.versions[t.value]}
            </p>
          </div>
        ))}
      </div>

      {/* 드라이버 표 — 무엇이 톤을 결정하는가 */}
      {data.drivers.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-medium text-faint">
            무엇이 톤을 만드는가
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-xs text-faint">
                  <th className="border-b border-line py-1.5 pr-3 font-medium">
                    관점
                  </th>
                  {TONE_OPTIONS.map((t) => (
                    <th
                      key={t.value}
                      className="border-b border-line py-1.5 pr-3 font-medium"
                    >
                      {t.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.drivers.map((d, i) => (
                  <tr key={i} className="align-top">
                    <td className="border-b border-line py-2 pr-3">
                      <div className="font-medium text-ink">{d.aspect}</div>
                      {d.note && (
                        <div className="mt-0.5 text-xs text-faint">{d.note}</div>
                      )}
                    </td>
                    <td className="border-b border-line py-2 pr-3 text-soft">
                      {d.formal}
                    </td>
                    <td className="border-b border-line py-2 pr-3 text-soft">
                      {d.neutral}
                    </td>
                    <td className="border-b border-line py-2 pr-3 text-soft">
                      {d.casual}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* consistency_tip 안내 배너 */}
      {data.consistency_tip && (
        <div className="mt-4 rounded-btn border border-ox/30 bg-ox/5 p-3 text-[13px] text-ink">
          <span className="font-medium text-ox">팁 · </span>
          {data.consistency_tip}
        </div>
      )}

      {/* 톤 일관성 검사 (글 전체, Pro 전용) */}
      <div className="mt-4 border-t border-line pt-3">
        {!isPro ? (
          <PlanLock feature="톤 일관성 검사" />
        ) : consistency ? (
          <div>
            <div className="text-xs text-faint">
              주 톤 ·{" "}
              <span className="font-medium text-ink">
                {TONE_OPTIONS.find((t) => t.value === consistency.main_tone)
                  ?.label ?? consistency.main_tone}
              </span>
            </div>
            {consistency.outliers.length === 0 ? (
              <p className="mt-1 text-[13px] text-soft">
                톤이 일관됩니다 — 벗어난 문장이 없습니다. ✓
              </p>
            ) : (
              <ul className="mt-1.5 space-y-2">
                {consistency.outliers.map((o, i) => (
                  <li
                    key={i}
                    className="rounded-btn border border-gold/40 bg-gold/5 p-2.5 text-[13px]"
                  >
                    <div className="text-soft">“{o.sentence}”</div>
                    <div className="mt-1 text-xs text-gold">
                      감지된 톤: {o.detected}
                    </div>
                    <div className="mt-1 text-ink">↳ {o.fix}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-soft">
              글 전체에서 톤이 흔들리는 문장을 찾아 드립니다.
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={onCheckConsistency}
              disabled={consistencyLoading}
            >
              {consistencyLoading ? "검사 중…" : "톤 일관성 검사"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
