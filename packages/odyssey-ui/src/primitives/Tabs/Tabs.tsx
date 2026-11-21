import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";
import { WritingDirectionOverride } from "../../internal/writing-direction";
import { cn } from "../../lib/cn";

const styles = {
  root: "od-Tabs-root",
  list: "od-Tabs-list",
  tab: "od-Tabs-tab",
  indicator: "od-Tabs-indicator",
  panel: "od-Tabs-panel",
} as const;

export type TabsProps = ComponentPropsWithoutRef<typeof BaseTabs.Root>;
export function Tabs({ className, dir, ...props }: TabsProps) {
  return (
    <WritingDirectionOverride dir={dir}>
      <BaseTabs.Root data-od-slot="tabs" dir={dir} className={cn(styles.root, className)} {...props} />
    </WritingDirectionOverride>
  );
}
export interface TabsListProps extends ComponentPropsWithoutRef<typeof BaseTabs.List> {
  /** Scroll a horizontal tab list and keep the selected tab visible. */
  scrollable?: boolean;
  /** Tabs always use an underline indicator; retained for existing callers. */
  variant?: "underline";
}
export function TabsList({ children, className, scrollable = false, variant = "underline", ...props }: TabsListProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const list = ref.current;
    if (!scrollable || !list) return;
    const revealSelection = () => {
      if (list.getAttribute("aria-orientation") === "vertical") return;
      const selected = list.querySelector('[role="tab"][aria-selected="true"]');
      if (!selected) return;
      const viewport = list.getBoundingClientRect();
      const tab = selected.getBoundingClientRect();
      const left = tab.left < viewport.left ? tab.left - viewport.left : Math.max(0, tab.right - viewport.right);
      if (left) list.scrollBy?.({ left });
    };
    const observer = new MutationObserver(revealSelection);
    observer.observe(list, { attributeFilter: ["aria-selected"], childList: true, subtree: true });
    const resize = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(revealSelection);
    resize?.observe(list);
    revealSelection();
    return () => {
      observer.disconnect();
      resize?.disconnect();
    };
  }, [scrollable]);
  return (
    <BaseTabs.List ref={ref} data-od-slot="tabs-list" data-scrollable={scrollable || undefined} data-variant={variant} className={cn(styles.list, className)} {...props}>
      {children}
      <TabsIndicator />
    </BaseTabs.List>
  );
}
export type TabsTabProps = ComponentPropsWithoutRef<typeof BaseTabs.Tab>;
export function TabsTab({ className, ...props }: TabsTabProps) {
  return <BaseTabs.Tab data-od-slot="tabs-tab" className={cn(styles.tab, className)} {...props} />;
}
export type TabsIndicatorProps = ComponentPropsWithoutRef<typeof BaseTabs.Indicator>;
export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  return <BaseTabs.Indicator data-od-slot="tabs-indicator" className={cn(styles.indicator, className)} {...props} />;
}
export type TabsPanelProps = ComponentPropsWithoutRef<typeof BaseTabs.Panel>;
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <BaseTabs.Panel data-od-slot="tabs-panel" className={cn(styles.panel, className)} {...props} />;
}
