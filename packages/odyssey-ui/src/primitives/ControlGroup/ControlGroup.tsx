import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type ControlGroupProps = HTMLAttributes<HTMLDivElement>;

/** Joins direct Button and Input children along the inline axis. */
export const ControlGroup = forwardRef<HTMLDivElement, ControlGroupProps>(function ControlGroup({ className, ...props }, ref) {
  // biome-ignore lint/a11y/useSemanticElements: This inline control group does not own a form legend.
  return <div ref={ref} role="group" data-od-slot="control-group" className={cn("od-ControlGroup", className)} {...props} />;
});
