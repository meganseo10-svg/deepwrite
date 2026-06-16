import { Button } from "@/components/ui/Button";

// 게이트용 자물쇠 오버레이 (06 공통 컴포넌트). 결제는 T14.
export function PlanLock({
  feature,
  onClose,
}: {
  feature: string;
  onClose?: () => void;
}) {
  return (
    <div className="relative rounded-btn border border-line2 bg-paper2 p-4 text-center">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-badge px-1.5 text-faint hover:text-ink"
          aria-label="닫기"
        >
          ✕
        </button>
      )}
      <div className="text-lg">🔒</div>
      <p className="mt-1 text-sm font-medium text-ink">
        {feature}는 Pro 전용입니다
      </p>
      <p className="mt-0.5 text-xs text-soft">
        Pro로 업그레이드하면 사용할 수 있어요.
      </p>
      <Button
        size="sm"
        variant="secondary"
        className="mt-2"
        disabled
        title="결제는 T14에서 연결"
      >
        Pro로 업그레이드
      </Button>
    </div>
  );
}
