import { createContext, type HTMLAttributes, type ReactNode, useContext, useMemo } from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../../primitives/Button";
import { useAILocale } from "../locale";
import type { ThreadSummary } from "../types";
import { styles } from "./AIThreadList.classes";

const Root = "nav";
const List = "ul";

interface State {
  items: readonly ThreadSummary[];
  activeId?: string;
  loading: boolean;
  error?: Error;
  select(id: string): void;
  create(): void;
}

const Context = createContext<State | null>(null);

export interface AIThreadListProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  items: readonly ThreadSummary[];
  activeId?: string;
  loading?: boolean;
  error?: Error;
  onSelect?(id: string): void;
  onCreate?(): void;
}

export function AIThreadList({ items, activeId, loading = false, error, onSelect, onCreate, children, className, ...props }: AIThreadListProps) {
  const state = useMemo<State>(
    () => ({ items, activeId, loading, error, select: (id) => onSelect?.(id), create: () => onCreate?.() }),
    [items, activeId, loading, error, onSelect, onCreate],
  );
  return (
    <Context.Provider value={state}>
      <Root data-od-slot="ai-thread-list-root" className={cn(styles.root, className)} {...props}>
        {children}
      </Root>
    </Context.Provider>
  );
}

export function useAIThreadList() {
  const value = useContext(Context);
  if (!value) throw new Error("useAIThreadList must be used inside AIThreadList");
  return value;
}

export function AIThreadListItems({ children }: { children?: (item: ThreadSummary) => ReactNode }) {
  const { items } = useAIThreadList();
  return (
    <List data-od-slot="ai-thread-list-items">
      {items.map((item) => (
        <li key={item.id}>{children ? children(item) : <AIThreadListItem item={item} />}</li>
      ))}
    </List>
  );
}

export interface AIThreadListItemProps extends Omit<ButtonProps, "onClick"> {
  item: ThreadSummary;
}

export function AIThreadListItem({ item, className, ...props }: AIThreadListItemProps) {
  const { activeId, select } = useAIThreadList();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      fullWidth
      data-od-slot="ai-thread-list-item"
      aria-current={activeId === item.id ? "page" : undefined}
      className={cn(styles.item, className)}
      onClick={() => select(item.id)}
      {...props}
    >
      {item.title}
    </Button>
  );
}

export function AIThreadListNew({ className, ...props }: React.ComponentProps<typeof Button>) {
  const locale = useAILocale();
  const { create, loading } = useAIThreadList();
  return (
    <Button
      type="button"
      disabled={loading}
      data-od-slot="ai-thread-list-new"
      className={cn(styles.new, className)}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) create();
      }}
    >
      {props.children ?? locale.thread.newThread}
    </Button>
  );
}
