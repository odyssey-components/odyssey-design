import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  root: "od-EmptyState-root",
  icon: "od-EmptyState-icon",
  title: "od-EmptyState-title",
  description: "od-EmptyState-description",
  actions: "od-EmptyState-actions",
} as const;

export type EmptyStateProps = HTMLAttributes<HTMLDivElement>;
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="empty-state" className={cn(styles.root, className)} {...props} />;
});
function part(slot: string, partClass: string) {
  return forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function EmptyPart({ className, ...props }, ref) {
    return <div ref={ref} data-od-slot={slot} className={cn(partClass, className)} {...props} />;
  });
}
export const EmptyStateIcon = part("empty-state-icon", styles.icon);
export const EmptyStateTitle = part("empty-state-title", styles.title);
export const EmptyStateDescription = part("empty-state-description", styles.description);
export const EmptyStateActions = part("empty-state-actions", styles.actions);
