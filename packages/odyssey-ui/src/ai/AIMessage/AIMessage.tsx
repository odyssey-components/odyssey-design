import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw, Square, Trash2 } from "lucide-react";
import { type ComponentType, createContext, type HTMLAttributes, type ReactNode, useContext, useMemo, useState } from "react";
import { cn } from "../../lib/cn";
import { IconButton, type IconButtonProps } from "../../primitives/IconButton";
import { Spinner } from "../../primitives/Spinner";
import { Stack } from "../../primitives/Stack";
import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "../../primitives/Tooltip";
import { AIUnknownPartFallback, useAIRendererRegistry } from "../AIRenderers";
import { AIToolCall, AIToolCallError, AIToolCallResult } from "../AIToolCall";
import { useAILocale } from "../locale";
import type { AIMessage as AIMessageModel, MessagePart } from "../types";
import { styles } from "./AIMessage.classes";

const Bubble = "article";
const Header = "header";
const Body = "div";
const Footer = "footer";
const Avatar = "div";
const Extra = "aside";
const Actions = "div";
const Parts = "div";
const Status = Stack;
const Branches = "fieldset";

const MessageContext = createContext<AIMessageModel | null>(null);

export type AIMessagePlacement = "start" | "end";
export type AIMessageVariant = "filled" | "outlined" | "borderless";

export interface AIMessageProps extends HTMLAttributes<HTMLElement> {
  message: AIMessageModel;
  placement?: AIMessagePlacement;
  variant?: AIMessageVariant;
  isLast?: boolean;
}
export function AIMessage({ message, placement, variant, isLast = false, children, className, ...props }: AIMessageProps) {
  const resolvedPlacement = placement ?? (message.role === "user" ? "end" : "start");
  const resolvedVariant = variant ?? (message.role === "user" ? "filled" : message.status === "error" ? "outlined" : "borderless");
  return (
    <MessageContext.Provider value={message}>
      <Bubble
        data-role={message.role}
        data-message-id={message.id}
        data-placement={resolvedPlacement}
        data-variant={resolvedVariant}
        data-status={message.status ?? "complete"}
        data-last-message={isLast}
        data-od-slot="ai-message-root"
        className={cn(styles.root, className)}
        {...props}
      >
        {children ?? (
          <AIMessageBody>
            <AIMessageParts />
          </AIMessageBody>
        )}
      </Bubble>
    </MessageContext.Provider>
  );
}

export function useAIMessageState<T>(selector: (message: AIMessageModel) => T): T {
  const message = useContext(MessageContext);
  if (!message) throw new Error("useAIMessageState must be used inside AIMessage");
  return selector(message);
}

export function AIMessageHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Header data-od-slot="ai-message-header" className={cn(styles.header, className)} {...props} />;
}
export function AIMessageBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Body data-od-slot="ai-message-body" className={cn(styles.body, className)} {...props} />;
}
export function AIMessageFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Footer data-od-slot="ai-message-footer" className={cn(styles.footer, className)} {...props} />;
}
export function AIMessageAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Avatar data-od-slot="ai-message-avatar" className={cn(styles.avatar, className)} {...props} />;
}
export function AIMessageExtra({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <Extra data-od-slot="ai-message-extra" className={cn(styles.extra, className)} {...props} />;
}

export interface AIMessagePartsProps {
  showStatus?: boolean;
  onApprove?(approvalId: string): void;
  onReject?(approvalId: string): void;
}
export function AIMessageParts({ showStatus = true, onApprove, onReject }: AIMessagePartsProps = {}) {
  const message = useContext(MessageContext);
  if (!message) throw new Error("AIMessageParts must be used inside AIMessage");
  return (
    <Parts data-od-slot="ai-message-parts" className={styles.parts}>
      {message.parts.map((part, index) => (
        <AIMessagePart key={("id" in part && part.id) || `${part.type}-${index}`} part={part} onApprove={onApprove} onReject={onReject} />
      ))}
      {showStatus ? <AIMessageStatus /> : null}
    </Parts>
  );
}

export interface AIMessagePartProps {
  part: MessagePart;
  onApprove?(approvalId: string): void;
  onReject?(approvalId: string): void;
}
export function AIMessagePart({ part, onApprove, onReject }: AIMessagePartProps) {
  const locale = useAILocale();
  const registry = useAIRendererRegistry();
  const message = useContext(MessageContext) ?? undefined;
  const registered =
    part.type === "tool-call"
      ? registry.tool(part.name)
      : part.type === "tool-result"
        ? undefined
        : part.type === "data"
          ? registry.data(part.name)
          : registry.part(part.type);
  if (registered) {
    const Renderer = registered as ComponentType<{ part: MessagePart; message?: AIMessageModel }>;
    return <Renderer part={part} message={message} />;
  }
  if (part.type === "text") return part.text ? <p>{part.text}</p> : null;
  if (part.type === "reasoning")
    return (
      <details>
        <summary>{locale.message.reasoning}</summary>
        <p>{part.text}</p>
      </details>
    );
  if (part.type === "source")
    return (
      <a href={part.url} target="_blank" rel="noreferrer">
        {part.title ?? part.url}
      </a>
    );
  if (part.type === "attachment")
    return part.mediaType === "image" ? <img src={part.url} alt={part.name ?? "AI attachment"} /> : <a href={part.url}>{part.name ?? part.mediaType}</a>;
  if (part.type === "tool-call") return <AIToolCall part={part} onApprove={onApprove} onReject={onReject} />;
  if (part.type === "tool-result")
    return part.state === "output-error" ? <AIToolCallError>{part.error ?? locale.message.toolFailed}</AIToolCallError> : <AIToolCallResult part={part} />;
  if (part.type === "error") return <AIToolCallError>{part.message}</AIToolCallError>;
  if (part.type === "data") return <pre>{JSON.stringify(part.value, null, 2)}</pre>;
  if (part.type === "unknown") return <span data-unknown-part={part.originalType}>{locale.message.unsupported(part.originalType)}</span>;
  return <AIUnknownPartFallback part={part} />;
}

export function AIMessageStatus() {
  const locale = useAILocale();
  const message = useAIMessageState((value) => value);
  if (message.role !== "assistant" || !message.status) return null;
  if (message.status === "complete" && message.finishReason !== "length" && message.finishReason !== "content-filter") return null;
  const text =
    message.finishReason === "length"
      ? locale.message.truncated
      : message.finishReason === "content-filter"
        ? locale.message.contentFiltered
        : message.status === "error"
          ? (locale.message.failed ?? "Generation failed")
          : message.status === "stopped"
            ? (locale.message.stopped ?? "Generation stopped")
            : (locale.message.generating ?? "Generating…");
  const role = message.status === "error" ? "alert" : "status";
  return (
    <Status direction="row" gap={2} align="center" data-od-slot="ai-message-status" className={styles.status} role={role}>
      {message.status === "pending" || message.status === "streaming" ? <Spinner size="sm" /> : null}
      <span>{text}</span>
    </Status>
  );
}

export interface AIMessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  autohide?: "always" | "not-last" | "never";
  hideWhenRunning?: boolean;
}
export function AIMessageActions({ autohide = "never", hideWhenRunning = false, children, className, ...props }: AIMessageActionsProps) {
  return (
    <TooltipProvider>
      <Actions
        data-od-slot="ai-message-actions"
        data-autohide={autohide}
        data-hide-when-running={hideWhenRunning}
        className={cn(styles.actions, className)}
        {...props}
      >
        {children}
      </Actions>
    </TooltipProvider>
  );
}

export interface AIMessageActionProps extends Omit<IconButtonProps, "aria-label"> {
  label: string;
  action?: "copy" | "delete" | "regenerate" | "stop";
}
export function AIMessageAction({ label, action, children, ...props }: AIMessageActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <IconButton size="sm" shape="circular" variant="ghost" aria-label={label} data-action={action} {...props}>
            {children}
          </IconButton>
        }
      />
      <TooltipPortal>
        <TooltipPositioner side="bottom">
          <TooltipContent>{label}</TooltipContent>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

type SpecializedActionProps = Omit<AIMessageActionProps, "label" | "action" | "children">;

export function AIMessageCopy({ text, ...props }: { text?: string } & SpecializedActionProps) {
  const locale = useAILocale();
  const message = useAIMessageState((value) => value);
  const [copied, setCopied] = useState(false);
  const copyText = text ?? message.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("\n");
  if (!copyText || (message.role !== "user" && message.role !== "assistant")) return null;
  return (
    <AIMessageAction
      type="button"
      label={copied ? locale.message.copied : locale.message.copy}
      action="copy"
      {...props}
      onClick={async (event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
    </AIMessageAction>
  );
}

export function AIMessageDelete({ onDelete, ...props }: { onDelete(): void } & SpecializedActionProps) {
  const locale = useAILocale();
  const message = useAIMessageState((value) => value);
  const unavailable = message.status === "pending" || message.status === "streaming";
  return (
    <AIMessageAction
      type="button"
      label={locale.message.delete}
      action="delete"
      {...props}
      data-unavailable={unavailable || undefined}
      disabled={unavailable || props.disabled}
      onClick={onDelete}
    >
      <Trash2 size={15} />
    </AIMessageAction>
  );
}

export function AIMessageRegenerate({
  onRegenerate,
  available = true,
  running = false,
  ...props
}: { onRegenerate(): void; available?: boolean; running?: boolean } & SpecializedActionProps) {
  const locale = useAILocale();
  const message = useContext(MessageContext);
  if (message) {
    if (message.role !== "assistant" || !available) return null;
    const unavailable = message.status === "pending" || message.status === "streaming";
    return (
      <AIMessageAction
        type="button"
        label={locale.message.regenerate}
        action="regenerate"
        {...props}
        data-unavailable={unavailable || undefined}
        disabled={unavailable || running || props.disabled}
        onClick={onRegenerate}
      >
        <RefreshCw size={15} />
      </AIMessageAction>
    );
  }
  return (
    <AIMessageAction type="button" label={locale.message.regenerate} action="regenerate" {...props} disabled={running} onClick={onRegenerate}>
      <RefreshCw size={15} />
    </AIMessageAction>
  );
}

export function AIMessageStop({ onStop, available = true, ...props }: { onStop(): void; available?: boolean } & SpecializedActionProps) {
  const locale = useAILocale();
  const message = useAIMessageState((value) => value);
  if (message.role !== "assistant" || !available || (message.status !== "pending" && message.status !== "streaming")) return null;
  return (
    <AIMessageAction type="button" label={locale.message.stop} action="stop" {...props} onClick={onStop}>
      <Square size={14} />
    </AIMessageAction>
  );
}

interface BranchPickerState {
  branches: NonNullable<AIMessageModel["branches"]>;
  index: number;
  switchTo(index: number): void;
}
const BranchPickerContext = createContext<BranchPickerState | null>(null);
function useBranchPicker() {
  const value = useContext(BranchPickerContext);
  if (!value) throw new Error("AIMessageBranchPicker primitives must be used inside AIMessageBranchPickerRoot");
  return value;
}

export interface AIMessageBranchPickerRootProps {
  message: AIMessageModel;
  children: ReactNode;
  onSwitch(id: string): void;
}
export function AIMessageBranchPickerRoot({ message, children, onSwitch }: AIMessageBranchPickerRootProps) {
  const locale = useAILocale();
  const branches = message.branches ?? [];
  const index = Math.max(
    0,
    branches.findIndex((item) => item.id === message.id),
  );
  const state = useMemo<BranchPickerState>(() => ({ branches, index, switchTo: (next) => onSwitch(branches[next].id) }), [branches, index, onSwitch]);
  if (branches.length < 2) return null;
  return (
    <BranchPickerContext.Provider value={state}>
      <Branches aria-label={locale.message.branchGroup ?? "Message versions"} data-od-slot="ai-message-branch-picker" className={styles.branches}>
        {children}
      </Branches>
    </BranchPickerContext.Provider>
  );
}

export function AIMessageBranchPickerPrevious() {
  const { index, switchTo } = useBranchPicker();
  const locale = useAILocale();
  return (
    <IconButton
      type="button"
      size="sm"
      shape="circular"
      variant="ghost"
      aria-label={locale.message.previousBranch ?? "Previous version"}
      disabled={index === 0}
      onClick={() => switchTo(index - 1)}
    >
      <ChevronLeft size={14} />
    </IconButton>
  );
}

export function AIMessageBranchPickerNext() {
  const { branches, index, switchTo } = useBranchPicker();
  const locale = useAILocale();
  return (
    <IconButton
      type="button"
      size="sm"
      shape="circular"
      variant="ghost"
      aria-label={locale.message.nextBranch ?? "Next version"}
      disabled={index === branches.length - 1}
      onClick={() => switchTo(index + 1)}
    >
      <ChevronRight size={14} />
    </IconButton>
  );
}

export function AIMessageBranchPickerCount() {
  const { branches, index } = useBranchPicker();
  return (
    <span>
      {index + 1} / {branches.length}
    </span>
  );
}

export function AIMessageBranchPicker({ message, onSwitch }: { message: AIMessageModel; onSwitch(id: string): void }) {
  return (
    <AIMessageBranchPickerRoot message={message} onSwitch={onSwitch}>
      <AIMessageBranchPickerPrevious />
      <AIMessageBranchPickerCount />
      <AIMessageBranchPickerNext />
    </AIMessageBranchPickerRoot>
  );
}
