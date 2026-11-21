import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  block?: boolean;
}
export const Code = forwardRef<HTMLElement, CodeProps>(function Code({ block, ...props }, ref) {
  return (
    <code ref={ref} data-od-slot={block ? "code-block" : "inline-code"} data-block={block || undefined} className={cn("od-Code", props.className)} {...props} />
  );
});
export const InlineCode = Code;
