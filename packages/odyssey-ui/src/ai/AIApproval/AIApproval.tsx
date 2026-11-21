import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { styles } from "./AIApproval.classes";

const Root = "section";
const Title = "h3";
const Description = "p";
const Actions = "div";

export type AIApprovalState = "pending" | "responding" | "resolved" | "expired" | "unknown";
export interface AIApprovalProps extends HTMLAttributes<HTMLElement> {
  state?: AIApprovalState;
}
export const AIApproval = forwardRef<HTMLElement, AIApprovalProps>(function AIApproval({ className, state = "pending", ...props }, ref) {
  return <Root ref={ref} data-od-slot="ai-approval" data-state={state} className={cn(styles.root, className)} {...props} />;
});
export const AIApprovalTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function AIApprovalTitle({ className, ...props }, ref) {
  return <Title ref={ref} data-od-slot="ai-approval-title" className={cn(styles.title, className)} {...props} />;
});
export const AIApprovalDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(function AIApprovalDescription(
  { className, ...props },
  ref,
) {
  return <Description ref={ref} data-od-slot="ai-approval-description" className={cn(styles.description, className)} {...props} />;
});
export const AIApprovalActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AIApprovalActions({ className, ...props }, ref) {
  return <Actions ref={ref} data-od-slot="ai-approval-actions" className={cn(styles.actions, className)} {...props} />;
});
