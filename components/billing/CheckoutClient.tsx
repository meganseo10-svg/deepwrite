"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { Button } from "@/components/ui/Button";

// 토스 빌링(자동결제) 카드 등록창을 띄운다. 성공 시 successUrl 로 이동하며
// 토스가 customerKey·authKey 쿼리를 덧붙여 보낸다 → /billing/success 에서 빌링키 발급+결제.
export function CheckoutClient({
  clientKey,
  customerKey,
  plan,
  email,
  name,
}: {
  clientKey: string | null;
  customerKey: string;
  plan: string;
  email: string | null;
  name: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!clientKey) {
    return (
      <div className="rounded-card border border-line2 bg-card p-4 text-sm text-soft">
        결제가 아직 준비 중입니다. 잠시만 기다려 주세요.
      </div>
    );
  }

  async function onPay() {
    setError(null);
    setLoading(true);
    try {
      const toss = await loadTossPayments(clientKey!);
      const payment = toss.payment({ customerKey });
      await payment.requestBillingAuth({
        method: "CARD",
        successUrl: `${window.location.origin}/billing/success?plan=${encodeURIComponent(plan)}`,
        failUrl: `${window.location.origin}/billing/fail`,
        customerEmail: email ?? undefined,
        customerName: name || undefined,
      });
      // requestBillingAuth 는 페이지를 이동시키므로 여기 이후는 실행되지 않음.
    } catch (e: unknown) {
      // 사용자가 창을 닫은 경우 등.
      const msg = e instanceof Error ? e.message : "결제 창을 여는 데 실패했습니다.";
      setError(msg);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={onPay} disabled={loading}>
        {loading ? "결제 창 여는 중…" : "카드 등록하고 구독 시작"}
      </Button>
      {error && <p className="text-sm text-gold">{error}</p>}
      <p className="text-xs text-faint">
        토스페이먼츠 안전 결제. 카드가 등록되고 첫 달 이용료가 결제됩니다.
        언제든 마이페이지에서 해지할 수 있어요.
      </p>
    </div>
  );
}
