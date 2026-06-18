import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

// 토스 빌링 인증 실패/취소 콜백. 토스가 code·message 를 쿼리로 붙여 보낸다.
export default async function BillingFailPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; code?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-lg font-medium text-ink">결제가 진행되지 않았어요</p>
        <p className="mt-2 text-sm text-soft">
          {message || "결제 창이 닫혔거나 카드 등록이 취소되었습니다."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/pricing" className={buttonClass({ size: "sm" })}>
            다시 시도
          </Link>
          <Link
            href="/mypage"
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            마이페이지
          </Link>
        </div>
      </div>
    </div>
  );
}
