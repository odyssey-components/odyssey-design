import { type ElementType, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  root: "od-AppShell-root",
  sidebar: "od-AppShell-sidebar",
  main: "od-AppShell-main",
  header: "od-AppShell-header",
  content: "od-AppShell-content",
} as const;

export type AppShellProps = HTMLAttributes<HTMLDivElement>;
export type AppShellPartProps = HTMLAttributes<HTMLElement>;

function part(slot: string, className: string, Element: ElementType) {
  return forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function AppShellPart({ className: custom, ...props }, ref) {
    return <Element ref={ref as never} data-od-slot={slot} className={cn(className, custom)} {...props} />;
  });
}
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="app-shell" className={cn(styles.root, className)} {...props} />;
});
export const AppShellSidebar = part("app-shell-sidebar", styles.sidebar, "aside");
export const AppShellMain = part("app-shell-main", styles.main, "main");
export const AppShellHeader = part("app-shell-header", styles.header, "header");
export const AppShellContent = part("app-shell-content", styles.content, "div");
