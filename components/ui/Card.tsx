import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** deepread 룩의 기본 패널: 흰 카드 + 옅은 테두리 + 부드러운 그림자 (08 §4). */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-line2 rounded-card shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("px-5 pt-5 pb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn("px-5 pb-5", className)} {...props} />;
}
