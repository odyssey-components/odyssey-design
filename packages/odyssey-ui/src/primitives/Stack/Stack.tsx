import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  wrap?: boolean;
}
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  { align, className, direction = "column", gap = 4, justify, style, wrap = false, ...props },
  ref,
) {
  const justifyContent = justify === "between" ? "space-between" : justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify;
  const alignItems = align === "start" ? "flex-start" : align === "end" ? "flex-end" : align;
  return (
    <div
      ref={ref}
      data-od-slot="stack"
      className={cn("od-Stack", className)}
      data-direction={direction}
      data-gap={gap}
      data-wrap={wrap || undefined}
      style={{ alignItems, justifyContent, ...style }}
      {...props}
    />
  );
});
