"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { saveVocab } from "@/app/(app)/write/actions";
import type { Vocab } from "@/lib/schemas/llm";

// 어휘 카드를 어휘장에 저장. 저장 후 비활성(중복 방지).
export function SaveVocabButton({ item }: { item: Vocab }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  function onSave() {
    setStatus("idle");
    startTransition(async () => {
      const res = await saveVocab(item);
      setStatus("ok" in res ? "saved" : "error");
    });
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onSave}
      disabled={pending || status === "saved"}
    >
      {pending
        ? "저장 중…"
        : status === "saved"
          ? "어휘장에 담음 ✓"
          : status === "error"
            ? "실패 — 다시"
            : "＋ 어휘장"}
    </Button>
  );
}
