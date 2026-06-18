"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { saveExpression } from "@/app/(app)/write/actions";

// 네이티브 리라이트를 표현장에 저장. 저장 후 상태 피드백.
export function SaveExpressionButton({ expression }: { expression: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function onSave() {
    setStatus("idle");
    startTransition(async () => {
      const res = await saveExpression(expression);
      setStatus("ok" in res ? "saved" : "error");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onSave}
        disabled={pending || status === "saved" || !expression.trim()}
      >
        {pending
          ? "저장 중…"
          : status === "saved"
            ? "어휘장에 저장됨 ✓"
            : "표현 저장"}
      </Button>
      {status === "error" && (
        <span className="text-xs text-gold">저장 실패 — 다시 시도해 주세요.</span>
      )}
    </div>
  );
}
