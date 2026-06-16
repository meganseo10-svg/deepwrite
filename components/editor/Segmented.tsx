"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

/** deepread 룩의 세그먼트 컨트롤 (톤·힌트모드 공용). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
}: {
  options: readonly Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 text-xs font-medium text-soft">{label}</div>
      )}
      <div className="inline-flex rounded-btn bg-paper2 p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={value === opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-badge font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              value === opt.value
                ? "bg-card text-ink shadow-sm"
                : "text-soft hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
