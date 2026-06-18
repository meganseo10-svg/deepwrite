"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

type Status = "confirming" | "error";

// /billing/success 진입 시 토스가 붙여준 customerKey·authKey 로 서버 결제 확인을 호출.
export function BillingConfirm({
  plan,
  customerKey,
  authKey,
}: {
  plan: string;
  customerKey: string;
  authKey: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("confirming");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      try {
        const res = await fetch("/api/billing/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, customerKey, authKey }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          router.replace("/mypage?billing=success");
          return;
        }
        setMessage(data?.error?.message ?? "결제 확인에 실패했습니다.");
        setStatus("error");
      } catch {
        setMessage("결제 확인 중 오류가 발생했습니다.");
        setStatus("error");
      }
    })();
  }, [plan, customerKey, authKey, router]);

  if (status === "confirming") {
    return (
      <div className="text-center">
        <p className="text-lg font-medium text-ink">결제를 확인하고 있어요…</p>
        <p className="mt-2 text-sm text-soft">잠시만 기다려 주세요.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-lg font-medium text-ink">결제를 완료하지 못했어요</p>
      <p className="mt-2 text-sm text-gold">{message}</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link
          href="/pricing"
          className={buttonClass({ variant: "secondary", size: "sm" })}
        >
          요금제로 돌아가기
        </Link>
        <Link href="/mypage" className={buttonClass({ size: "sm" })}>
          마이페이지
        </Link>
      </div>
    </div>
  );
}
