import { type DetailsHTMLAttributes, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  root: "od-Collapsible-root",
  trigger: "od-Collapsible-trigger",
  content: "od-Collapsible-content",
} as const;
export interface CollapsibleProps extends DetailsHTMLAttributes<HTMLDetailsElement> {}
export const Collapsible = forwardRef<HTMLDetailsElement, CollapsibleProps>(function Collapsible({ className, ...props }, ref) {
  return <details ref={ref} data-od-slot="collapsible" className={cn(styles.root, className)} {...props} />;
});
export interface CollapsibleTriggerProps extends HTMLAttributes<HTMLElement> {}
export const CollapsibleTrigger = forwardRef<HTMLElement, CollapsibleTriggerProps>(function CollapsibleTrigger({ className, ...props }, ref) {
  return <summary ref={ref} data-od-slot="collapsible-trigger" className={cn(styles.trigger, className)} {...props} />;
});
export interface CollapsibleContentProps extends HTMLAttributes<HTMLDivElement> {}
export const CollapsibleContent = forwardRef<HTMLDivElement, CollapsibleContentProps>(function CollapsibleContent({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="collapsible-content" className={cn(styles.content, className)} {...props} />;
});
