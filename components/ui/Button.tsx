import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ox/40";

const variants: Record<Variant, string> = {
  // 주요 액션: 브랜드 그라데이션 (청록→파랑)
  primary: "bg-brand text-white hover:opacity-90",
  secondary: "bg-card text-ink border border-line2 hover:bg-paper2",
  ghost: "text-soft hover:text-ink hover:bg-paper2",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-badge",
  md: "h-11 px-5 text-sm rounded-btn",
};

// 버튼 스타일 클래스 조합. 내비게이션 CTA(<Link>/<a>)에 재사용 —
// <a> 안에 <button> 을 중첩(유효하지 않은 HTML)하면 클릭이 버튼에 잡혀
// 앵커 내비게이션이 막히므로, 링크 자체에 이 클래스를 입힌다.
export function buttonClass(opts?: {
  variant?: Variant;
  size?: Size;
  className?: string;
}): string {
  const { variant = "primary", size = "md", className } = opts ?? {};
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}
