import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import type { OdysseyFeedbackTone } from "../../types";

const alertVariants = cva(
  "@container/od-alert relative grid grid-cols-[minmax(0,1fr)_auto] gap-[var(--od-space-1)] border-[length:var(--od-line-width)] border-[color-mix(in_oklch,var(--alert-color)_42%,var(--od-border))] bg-[var(--od-card)] px-[var(--od-space-4)] py-[var(--od-space-3)] text-[length:var(--od-font-size-sm)] leading-[var(--od-line-height-normal)] text-[var(--od-foreground)] rounded-[var(--od-alert-radius)] [&>[data-od-slot=alert-title]]:col-start-1 [&>[data-od-slot=alert-title]]:min-w-0 [&>[data-od-slot=alert-description]]:col-start-1 [&>[data-od-slot=alert-description]]:min-w-0",
  {
    variants: {
      tone: {
        neutral: "[--alert-color:var(--od-muted-foreground)]",
        info: "[--alert-color:var(--od-info)]",
        success: "[--alert-color:var(--od-success)]",
        warning: "[--alert-color:var(--od-warning)]",
        danger: "[--alert-color:var(--od-destructive)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

const titleClass = "font-[var(--od-font-weight-semibold)]";
const descriptionClass = "text-[var(--od-muted-foreground)]";
const actionClass =
  "col-start-2 row-span-2 inline-flex gap-[var(--od-space-2)] self-start justify-self-end @max-[24rem]/od-alert:col-start-1 @max-[24rem]/od-alert:row-auto @max-[24rem]/od-alert:justify-self-start";

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  tone?: OdysseyFeedbackTone & VariantProps<typeof alertVariants>["tone"];
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert({ className, tone = "neutral", ...props }, ref) {
  return <div ref={ref} role="alert" data-od-slot="alert" data-tone={tone} className={cn(alertVariants({ tone }), className)} {...props} />;
});

function part(slot: string, partClass: string) {
  return forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AlertPart({ className, ...props }, ref) {
    return <div ref={ref} data-od-slot={slot} className={cn(partClass, className)} {...props} />;
  });
}

export const AlertTitle = part("alert-title", titleClass);
export const AlertDescription = part("alert-description", descriptionClass);
export const AlertAction = part("alert-action", actionClass);
