import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal", className, ...props }: DividerProps) {
  return <hr data-od-slot="divider" aria-orientation={orientation} className={cn("od-Divider", className)} {...props} />;
}
