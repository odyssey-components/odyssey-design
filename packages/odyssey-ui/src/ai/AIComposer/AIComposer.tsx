import { ArrowUp, FileText, Paperclip, Square, X } from "lucide-react";
import {
  type ClipboardEvent,
  type ComponentProps,
  type DragEvent,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../lib/cn";
import { FileInput } from "../../primitives/FileInput";
import { IconButton } from "../../primitives/IconButton";
import { Spinner } from "../../primitives/Spinner";
import { Stack } from "../../primitives/Stack";
import { Textarea } from "../../primitives/Textarea";
import { useAILocale } from "../locale";
import type { AttachmentAdapter, ComposerAttachment } from "../types";
import { styles } from "./AIComposer.classes";

const Root = "form";
const Input = Textarea;
const Attachment = "div";
const AttachmentDetails = "span";
const HiddenFileInput = FileInput;

export interface AIComposerProps extends ComponentProps<typeof Root> {
  onFiles?(files: File[]): void;
}
export function AIComposer({ onSubmit, onFiles, onDragEnter, onDragLeave, onDragOver, onDrop, className, ...props }: AIComposerProps) {
  const [dropActive, setDropActive] = useState(false);
  const dragDepth = useRef(0);
  return (
    <Root
      data-od-slot="ai-composer-root"
      data-drop-active={dropActive}
      className={cn(styles.root, className)}
      {...props}
      onDragEnter={(event) => {
        onDragEnter?.(event);
        if (event.defaultPrevented || !onFiles || !hasFiles(event)) return;
        event.preventDefault();
        dragDepth.current += 1;
        setDropActive(true);
      }}
      onDragOver={(event) => {
        onDragOver?.(event);
        if (!event.defaultPrevented && onFiles && hasFiles(event)) event.preventDefault();
      }}
      onDragLeave={(event) => {
        onDragLeave?.(event);
        if (!onFiles || !hasFiles(event)) return;
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (dragDepth.current === 0) setDropActive(false);
      }}
      onDrop={(event) => {
        onDrop?.(event);
        if (event.defaultPrevented || !onFiles || !hasFiles(event)) return;
        event.preventDefault();
        dragDepth.current = 0;
        setDropActive(false);
        const files = Array.from(event.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    />
  );
}

export interface AIComposerInputProps extends ComponentProps<typeof Textarea> {
  minRows?: number;
  maxRows?: number;
  onFiles?(files: File[]): void;
}
export function AIComposerInput({ minRows = 1, maxRows = 6, onFiles, onPaste, ref: forwardedRef, className, ...props }: AIComposerInputProps) {
  const locale = useAILocale();
  const input = typeof props.value === "string" ? props.value : typeof props.defaultValue === "string" ? props.defaultValue : "";
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const composing = useRef(false);
  useLayoutEffect(() => {
    void input;
    const node = ref.current;
    if (!node) return;
    const style = getComputedStyle(node);
    const lineHeight = Number.parseFloat(style.lineHeight) || 20;
    const chrome = numeric(style.paddingTop) + numeric(style.paddingBottom) + numeric(style.borderTopWidth) + numeric(style.borderBottomWidth);
    node.style.height = "auto";
    node.style.height = `${Math.min(Math.max(node.scrollHeight, lineHeight * minRows + chrome), lineHeight * maxRows + chrome)}px`;
    node.style.overflowY = node.scrollHeight > lineHeight * maxRows + chrome ? "auto" : "hidden";
  }, [input, minRows, maxRows]);
  return (
    <Input
      ref={(node) => {
        ref.current = node;
        assignRef(forwardedRef, node);
      }}
      data-od-slot="ai-composer-input"
      aria-label={props["aria-label"] ?? locale.composer.message}
      className={cn(styles.input, className)}
      value={input}
      {...props}
      rows={props.rows ?? minRows}
      onPaste={(event: ClipboardEvent<HTMLTextAreaElement>) => {
        onPaste?.(event);
        if (event.defaultPrevented || !onFiles) return;
        const files = Array.from(event.clipboardData.files);
        if (files.length) onFiles(files);
      }}
      onChange={(event) => {
        props.onChange?.(event);
      }}
      onCompositionStart={(event) => {
        composing.current = true;
        props.onCompositionStart?.(event);
      }}
      onCompositionEnd={(event) => {
        composing.current = false;
        props.onCompositionEnd?.(event);
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!event.defaultPrevented && !composing.current && !event.nativeEvent.isComposing && !event.repeat && event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}

export function AIComposerToolbar(props: HTMLAttributes<HTMLDivElement>) {
  return <Stack direction="row" gap={2} align="center" justify="between" wrap data-od-slot="ai-composer-toolbar" {...props} />;
}
export function AIComposerPrefix(props: HTMLAttributes<HTMLDivElement>) {
  return <Stack direction="row" gap={2} align="center" data-od-slot="ai-composer-prefix" {...props} />;
}
export function AIComposerSuffix(props: HTMLAttributes<HTMLDivElement>) {
  return <Stack direction="row" gap={2} align="center" data-od-slot="ai-composer-suffix" {...props} />;
}
export function AIComposerFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <Stack direction="row" gap={2} align="center" data-od-slot="ai-composer-footer" {...props} />;
}
export function AIComposerAttachments(props: HTMLAttributes<HTMLDivElement>) {
  return <Stack direction="row" gap={2} wrap data-od-slot="ai-composer-attachments" {...props} />;
}

export interface AIComposerAttachmentProps {
  attachment: ComposerAttachment;
  onRemove?(): void;
}
export function AIComposerAttachment({ attachment, onRemove }: AIComposerAttachmentProps) {
  const locale = useAILocale();
  return (
    <Attachment data-od-slot="ai-composer-attachment" data-status={attachment.status ?? "ready"} title={attachment.error} className={styles.attachment}>
      <FileText size={18} aria-hidden="true" />
      <AttachmentDetails className={styles.attachmentDetails}>
        <span>{attachment.name}</span>
        <small>
          {attachment.status === "failed"
            ? (attachment.error ?? locale.composer.attachmentFailed ?? "Attachment failed")
            : attachment.size
              ? formatSize(attachment.size)
              : attachment.mediaType}
        </small>
      </AttachmentDetails>
      {attachment.status === "uploading" ? <Spinner size="sm" /> : null}
      {onRemove ? (
        <IconButton type="button" size="sm" shape="circular" variant="ghost" aria-label={locale.composer.removeAttachment(attachment.name)} onClick={onRemove}>
          <X size={14} />
        </IconButton>
      ) : null}
    </Attachment>
  );
}

export interface AIComposerSendProps extends Omit<ComponentProps<typeof IconButton>, "aria-label" | "children"> {
  label?: string;
  children?: ReactNode;
  loading?: boolean;
  canSubmit?: boolean;
}
export function AIComposerSend({ label, children, disabled, loading = false, canSubmit = true, variant, ...props }: AIComposerSendProps) {
  const locale = useAILocale();
  const accessibleLabel = label ?? locale.composer.send;
  return (
    <IconButton
      type="submit"
      size="sm"
      shape="circular"
      variant={variant ?? "solid"}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      disabled={disabled ?? (loading || !canSubmit)}
      {...props}
    >
      {children ?? <ArrowUp size={17} />}
    </IconButton>
  );
}

export interface AIComposerCancelProps extends Omit<ComponentProps<typeof IconButton>, "aria-label" | "children"> {
  label?: string;
  children?: ReactNode;
}
export function AIComposerCancel({ label, children, variant, ...props }: AIComposerCancelProps) {
  const locale = useAILocale();
  const accessibleLabel = label ?? locale.composer.stop;
  return (
    <IconButton
      type="button"
      size="sm"
      shape="circular"
      variant={variant ?? "solid"}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      {...props}
      onClick={props.onClick}
    >
      {children ?? <Square size={14} />}
    </IconButton>
  );
}

export function AIComposerAddAttachment(props: ComponentProps<typeof FileInput>) {
  return <FileInput data-od-slot="ai-composer-add-attachment" {...props} />;
}

export interface AIComposerAttachmentTriggerProps extends Omit<ComponentProps<typeof FileInput>, "onChange"> {
  onFiles(files: File[]): void;
  label?: string;
  inputLabel?: string;
}
export function AIComposerAttachmentTrigger({ onFiles, label, inputLabel, ...props }: AIComposerAttachmentTriggerProps) {
  const locale = useAILocale();
  const input = useRef<HTMLInputElement>(null);
  const accessibleLabel = label ?? locale.composer.attach ?? "Attach files";
  return (
    <>
      <IconButton
        type="button"
        size="sm"
        shape="circular"
        variant="ghost"
        aria-label={accessibleLabel}
        title={accessibleLabel}
        onClick={() => input.current?.click()}
      >
        <Paperclip size={17} />
      </IconButton>
      <HiddenFileInput
        className={styles.hiddenInput}
        ref={input}
        data-od-slot="ai-composer-add-attachment"
        aria-label={inputLabel ?? accessibleLabel}
        {...props}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          event.target.value = "";
        }}
      />
    </>
  );
}

export interface AIComposerAttachmentsOptions {
  sessionId: string;
  adapter?: AttachmentAdapter;
  validate?: (file: File) => string | undefined;
}
export interface AIComposerAttachmentsController {
  attachments: ComposerAttachment[];
  error?: string;
  uploading: boolean;
  readyIds: string[];
  addFiles(files: File[]): void;
  remove(id: string): void;
  clear(): void;
}
export function useAIComposerAttachments({ sessionId, adapter, validate }: AIComposerAttachmentsOptions): AIComposerAttachmentsController {
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [error, setError] = useState<string>();
  const controllers = useRef(new Map<string, AbortController>());
  useEffect(
    () => () => {
      for (const controller of controllers.current.values()) controller.abort();
    },
    [],
  );
  function addFiles(files: File[]) {
    const accepted: File[] = [];
    const errors: string[] = [];
    for (const file of files) {
      const reason = validate?.(file);
      if (reason) errors.push(reason);
      else accepted.push(file);
    }
    setError(errors[0]);
    for (const file of accepted) {
      if (!adapter) continue;
      const temporary: ComposerAttachment = {
        id: `upload-${crypto.randomUUID()}`,
        name: file.name,
        mediaType: file.type,
        size: file.size,
        status: "uploading",
      };
      const controller = new AbortController();
      controllers.current.set(temporary.id, controller);
      setAttachments((current) => [...current, temporary]);
      void adapter
        .upload(file, { sessionId, signal: controller.signal })
        .then((uploaded) => setAttachments((current) => current.map((item) => (item.id === temporary.id ? { ...uploaded, status: "ready" } : item))))
        .catch((reason) => {
          if (controller.signal.aborted) return;
          setAttachments((current) =>
            current.map((item) =>
              item.id === temporary.id ? { ...item, status: "failed", error: reason instanceof Error ? reason.message : String(reason) } : item,
            ),
          );
        })
        .finally(() => controllers.current.delete(temporary.id));
    }
  }
  function remove(id: string) {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    const attachment = attachments.find((item) => item.id === id);
    setAttachments((current) => current.filter((item) => item.id !== id));
    if (attachment && adapter?.remove) void adapter.remove(attachment, { sessionId, signal: new AbortController().signal });
  }
  return {
    attachments,
    error,
    uploading: attachments.some((item) => item.status === "uploading"),
    readyIds: attachments.filter((item) => item.status === "ready").map((item) => item.id),
    addFiles,
    remove,
    clear: () => {
      setAttachments([]);
      setError(undefined);
    },
  };
}

function hasFiles(event: DragEvent<HTMLElement>) {
  return Array.from(event.dataTransfer.types).includes("Files");
}
function numeric(value: string) {
  return Number.parseFloat(value) || 0;
}
function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
