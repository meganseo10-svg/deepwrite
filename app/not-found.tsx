import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

// 브랜드 404 (08 룩). 기본 Next 페이지 대체.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-2xl font-bold text-brand">DEEPWRITE</div>
      <p className="mt-6 text-5xl font-bold text-ink">404</p>
      <p className="mt-2 text-sm text-soft">
        찾으시는 페이지가 없어요. 주소가 바뀌었거나 삭제됐을 수 있습니다.
      </p>
      <Link href="/dashboard" className={buttonClass({ className: "mt-6" })}>
        대시보드로 가기
      </Link>
    </div>
  );
}
