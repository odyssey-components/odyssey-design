import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { styles } from "./AITimeline.classes";

const Root = "div";
const Item = "div";

export type AITimelineProps = HTMLAttributes<HTMLDivElement>;
export const AITimeline = forwardRef<HTMLDivElement, AITimelineProps>(function AITimeline({ className, ...props }, ref) {
  return <Root ref={ref} role="list" data-od-slot="ai-timeline" className={cn(styles.root, className)} {...props} />;
});
export const AITimelineItem = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AITimelineItem({ className, ...props }, ref) {
  return <Item ref={ref} role="listitem" data-od-slot="ai-timeline-item" className={cn(styles.item, className)} {...props} />;
});
