"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

// 구독 해지 버튼. 확인 → POST /api/billing/cancel → 새로고침.
export function CancelSubscriptionButton() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error?.message ?? "해지에 실패했습니다.");
    } catch {
      setError("해지 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs text-faint underline hover:text-soft"
      >
        구독 해지
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-soft">해지하면 바로 무료 플랜으로 전환돼요.</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} disabled={loading}>
          유지
        </Button>
        <Button size="sm" onClick={onCancel} disabled={loading}>
          {loading ? "해지 중…" : "해지하기"}
        </Button>
      </div>
      {error && <span className="text-xs text-gold">{error}</span>}
    </div>
  );
}
