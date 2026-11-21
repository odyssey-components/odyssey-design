import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = { root: "od-Stat-root", label: "od-Stat-label", value: "od-Stat-value", description: "od-Stat-description" } as const;

export type StatProps = HTMLAttributes<HTMLDivElement>;

function part(slot: string, className: string) {
  return forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function StatPart({ className: custom, ...props }, ref) {
    return <div ref={ref} data-od-slot={slot} className={cn(className, custom)} {...props} />;
  });
}
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="stat" className={cn(styles.root, className)} {...props} />;
});
export const StatLabel = part("stat-label", styles.label);
export const StatValue = part("stat-value", styles.value);
export const StatDescription = part("stat-description", styles.description);
