import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ProseProps = HTMLAttributes<HTMLDivElement>;

export const Prose = forwardRef<HTMLDivElement, ProseProps>(function Prose({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="prose" className={cn("od-Prose", className)} {...props} />;
});
