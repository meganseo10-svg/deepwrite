import { cn } from "@/lib/utils";

type Tone = "neutral" | "ox" | "gold" | "sage" | "slate";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

const tones: Record<Tone, string> = {
  neutral: "bg-paper2 text-soft border-line2",
  ox: "bg-ox/10 text-ox-dark border-ox/20",
  gold: "bg-gold/10 text-gold border-gold/20",
  sage: "bg-sage/10 text-sage border-sage/20",
  slate: "bg-slate/10 text-slate border-slate/20",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-badge border px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
