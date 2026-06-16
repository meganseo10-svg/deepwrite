import type { Analyze } from "@/lib/schemas/llm";

// 단어 단위 diff 색상: 초록=추가, 빨강 취소선=삭제, 교체=빨강→초록 (06 UI).
export function DiffView({ diff }: { diff: Analyze["diff"] }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-ink">리라이트 Diff</h3>
      <p className="rounded-btn border border-line2 bg-paper2 p-3 text-[15px] leading-relaxed">
        {diff.map((d, i) => {
          const before = d.before ?? "";
          const after = d.after ?? "";
          switch (d.op) {
            case "keep":
              return <span key={i}>{before} </span>;
            case "insert":
              return (
                <span key={i} className="rounded bg-sage/15 text-sage">
                  {after}{" "}
                </span>
              );
            case "delete":
              return (
                <span key={i} className="text-gold line-through opacity-70">
                  {before}{" "}
                </span>
              );
            case "replace":
              return (
                <span key={i}>
                  <span className="text-gold line-through opacity-70">
                    {before}
                  </span>{" "}
                  <span className="rounded bg-sage/15 text-sage">{after}</span>{" "}
                </span>
              );
            default:
              return null;
          }
        })}
      </p>
    </div>
  );
}
