import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useOdysseyLocale } from "../../locale";
import type { OdysseySize } from "../../types";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: OdysseySize;
  label?: string;
}
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({ className, label, size = "md", ...props }, ref) {
  const locale = useOdysseyLocale();
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label ?? locale.spinner.loading}
      data-od-slot="spinner"
      data-size={size}
      className={cn("od-Spinner", className)}
      {...props}
    />
  );
});
