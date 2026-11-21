import { ArrowDown } from "lucide-react";
import { forwardRef, type HTMLAttributes, type ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/Button";
import { EmptyState } from "../../primitives/EmptyState";
import { IconButton } from "../../primitives/IconButton";
import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "../../primitives/Tooltip";
import { useAILocale } from "../locale";
import type { AIMessage as AIMessageModel } from "../types";
import { styles } from "./AIThread.classes";

const Root = "section";
const Viewport = "div";
const Jump = IconButton;

function scrollViewport(node: HTMLDivElement | null, options: ScrollToOptions) {
  if (!node) return;
  if (typeof node.scrollTo === "function") node.scrollTo(options);
  else node.scrollTop = options.top ?? node.scrollHeight;
}

function defaultScrollBehavior(): ScrollBehavior {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function AIThread({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Root data-od-slot="ai-thread-root" className={cn(styles.root, className)} {...props} />;
}

export interface AIThreadViewportHandle {
  scrollToBottom(options?: ScrollToOptions): void;
  scrollToMessage(id: string, options?: ScrollIntoViewOptions): void;
}
export interface AIThreadViewportProps extends HTMLAttributes<HTMLDivElement> {
  autoScroll?: boolean;
  messages?: readonly AIMessageModel[];
}
export const AIThreadViewport = forwardRef<AIThreadViewportHandle, AIThreadViewportProps>(function AIThreadViewport(
  { autoScroll = true, messages = [], children, onScroll, className, ...props },
  forwardedRef,
) {
  const locale = useAILocale();
  const ref = useRef<HTMLDivElement>(null);
  const follows = useRef(true);
  const previousMessages = useRef(messages);
  const [showJump, setShowJump] = useState(false);
  useImperativeHandle(
    forwardedRef,
    () => ({
      scrollToBottom: (options) => scrollViewport(ref.current, { top: ref.current?.scrollHeight, behavior: defaultScrollBehavior(), ...options }),
      scrollToMessage: (id, options) =>
        ref.current?.querySelector(`[data-message-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: defaultScrollBehavior(), block: "center", ...options }),
    }),
    [],
  );
  useEffect(() => {
    const messagesChanged = previousMessages.current !== messages;
    previousMessages.current = messages;
    if (messagesChanged && autoScroll && follows.current) scrollViewport(ref.current, { top: ref.current?.scrollHeight });
  }, [autoScroll, messages]);
  return (
    <Viewport
      ref={ref}
      role="log"
      aria-live="polite"
      data-od-slot="ai-thread-viewport"
      className={cn(styles.viewport, className)}
      onScroll={(event) => {
        onScroll?.(event);
        const node = event.currentTarget;
        follows.current = node.scrollHeight - node.scrollTop - node.clientHeight < 80;
        setShowJump(!follows.current);
      }}
      {...props}
    >
      {children}
      {autoScroll && showJump ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Jump
                  type="button"
                  size="sm"
                  variant="soft"
                  shape="circular"
                  aria-label={locale.thread.scrollToBottom}
                  onClick={() => {
                    follows.current = true;
                    scrollViewport(ref.current, { top: ref.current?.scrollHeight, behavior: defaultScrollBehavior() });
                  }}
                >
                  <ArrowDown size={15} />
                </Jump>
              }
            />
            <TooltipPortal>
              <TooltipPositioner side="top">
                <TooltipContent>{locale.thread.scrollToBottom}</TooltipContent>
              </TooltipPositioner>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </Viewport>
  );
});

export function AIThreadMessages({ children }: { children: ReactNode }) {
  return children;
}
export function AIThreadEmpty({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <EmptyState data-od-slot="ai-thread-empty" className={cn(styles.empty, className)} {...props} />;
}
export interface AIThreadIfProps {
  when: "empty" | "running" | "error";
  state: { messageCount: number; running: boolean; error?: unknown };
  children: ReactNode;
}
export function AIThreadIf({ when, state, children }: AIThreadIfProps) {
  const visible = when === "empty" ? state.messageCount === 0 : when === "running" ? state.running : Boolean(state.error);
  return visible ? children : null;
}
export function AIThreadScrollToBottom({ className, ...props }: React.ComponentProps<typeof Button>) {
  const locale = useAILocale();
  return (
    <Button type="button" className={cn(styles.scrollToBottom, className)} {...props}>
      {props.children ?? locale.thread.scrollToBottom}
    </Button>
  );
}
