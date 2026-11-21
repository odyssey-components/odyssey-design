import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  animation?: "wave" | "pulse" | "none";
  shape?: "text" | "rectangular" | "circular";
}
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton({ animation = "wave", className, shape = "rectangular", ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      data-od-slot="skeleton"
      data-animation={animation}
      data-shape={shape}
      aria-hidden="true"
      className={cn("od-Skeleton", className)}
    />
  );
});
