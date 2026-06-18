"use client";

import { useEffect } from "react";
import { Button, buttonClass } from "@/components/ui/Button";

// 전역 에러 바운더리 (런타임 오류 시). 기본 Next 에러 페이지 대체.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 운영 모니터링 연동 시 여기서 보고 (현재는 콘솔)
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-2xl font-bold text-brand">DEEPWRITE</div>
      <p className="mt-6 text-lg font-semibold text-ink">
        문제가 발생했어요
      </p>
      <p className="mt-2 max-w-sm text-sm text-soft">
        잠시 후 다시 시도해 주세요. 계속되면 새로고침하거나 대시보드로
        돌아가 주세요.
      </p>
      <div className="mt-6 flex gap-2">
        <Button onClick={reset}>다시 시도</Button>
        <a href="/dashboard" className={buttonClass({ variant: "secondary" })}>
          대시보드로
        </a>
      </div>
    </div>
  );
}
