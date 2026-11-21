import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import type { OdysseyFeedbackTone } from "../../types";

const badgeVariants = cva(
  "inline-flex min-h-[1.375rem] items-center gap-[var(--od-space-1)] border-[length:var(--od-line-width)] px-[var(--od-space-2)] rounded-[var(--od-badge-radius)] bg-[color-mix(in_oklch,var(--badge-color)_10%,var(--od-background))] text-[var(--badge-color)] text-[length:var(--od-font-size-xs)] font-medium leading-none whitespace-nowrap border-[color-mix(in_oklch,var(--badge-color)_32%,var(--od-border))]",
  {
    variants: {
      tone: {
        neutral: "[--badge-color:var(--od-muted-foreground)]",
        info: "[--badge-color:var(--od-info)]",
        success: "[--badge-color:var(--od-success)]",
        warning: "[--badge-color:var(--od-warning)]",
        danger: "[--badge-color:var(--od-destructive)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: OdysseyFeedbackTone & VariantProps<typeof badgeVariants>["tone"];
}
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge({ className, tone = "neutral", ...props }, ref) {
  return <span ref={ref} data-od-slot="badge" data-tone={tone} className={cn(badgeVariants({ tone }), className)} {...props} />;
});
