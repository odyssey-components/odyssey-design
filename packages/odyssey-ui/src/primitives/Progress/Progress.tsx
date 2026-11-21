import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
}
export function Progress({ value, max = 100, label, showValue = true, style, className, ...props }: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div data-od-slot="progress" className={cn("od-Progress-root grid gap-[var(--od-space-2)]", className)} {...props}>
      {(label || showValue) && (
        <div className="od-Progress-labels flex justify-between text-[length:var(--od-font-size-sm)] text-[var(--od-muted-foreground)]">
          <span>{label}</span>
          {showValue && <span>{Math.round(percent)}%</span>}
        </div>
      )}
      <div
        className="od-Progress-track h-2 overflow-hidden rounded-full bg-[var(--od-muted)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className="od-Progress-indicator h-full rounded-[inherit] bg-[var(--od-primary)] transition-[width] duration-[var(--od-duration-normal)] [transition-timing-function:var(--od-ease-standard)] motion-reduce:transition-none"
          style={{ ...style, width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
