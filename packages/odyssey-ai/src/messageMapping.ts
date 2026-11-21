import type { AIMessage, MessagePart, ToolCallPart } from "./types";

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
export function mapPart(value: unknown): MessagePart {
  const part = asRecord(value);
  const type = String(part.type ?? "unknown");
  if (type === "text") return { type: "text", text: String(part.content ?? part.text ?? "") };
  if (type === "reasoning") return { type: "reasoning", id: part.id ? String(part.id) : undefined, text: String(part.content ?? part.text ?? "") };
  if (type === "source")
    return {
      type: "source",
      id: part.id ? String(part.id) : undefined,
      url: String(part.url ?? ""),
      title: part.title ? String(part.title) : undefined,
      description: part.description ? String(part.description) : undefined,
    };
  if (type === "data")
    return { type: "data", id: part.id ? String(part.id) : undefined, name: String(part.name ?? "unknown"), value: part.value ?? part.content };
  if (type === "tool-call") {
    const approval = asRecord(part.approval);
    return {
      type: "tool-call",
      id: String(part.id ?? ""),
      name: String(part.name ?? "unknown"),
      input: part.input ?? part.arguments,
      state: approval.id ? "approval-required" : (String(part.state ?? "input-available") as ToolCallPart["state"]),
      approvalId: approval.id ? String(approval.id) : undefined,
    };
  }
  if (type === "tool-result")
    return {
      type: "tool-result",
      toolCallId: String(part.toolCallId ?? ""),
      output: part.content,
      state: part.state === "output-error" ? "output-error" : "output-available",
      error: part.error ? String(part.error) : undefined,
    };
  if (["image", "audio", "video", "document"].includes(type))
    return {
      type: "attachment",
      mediaType: type as "image" | "audio" | "video" | "document",
      url: String(part.url ?? part.data ?? ""),
      name: part.name ? String(part.name) : undefined,
    };
  if (type === "error") return { type: "error", message: String(part.message ?? part.error ?? "Unknown error") };
  return { type: "unknown", originalType: type, value };
}
export function mapMessage(value: unknown): AIMessage {
  const message = asRecord(value);
  return {
    id: String(message.id ?? ""),
    role: message.role === "system" || message.role === "user" ? message.role : "assistant",
    parts: Array.isArray(message.parts) ? message.parts.map(mapPart) : [],
    createdAt:
      message.createdAt instanceof Date
        ? message.createdAt
        : typeof message.createdAt === "string" || typeof message.createdAt === "number"
          ? new Date(message.createdAt)
          : undefined,
    status:
      message.status === "pending" || message.status === "streaming" || message.status === "error" || message.status === "stopped"
        ? message.status
        : "complete",
    finishReason:
      message.finishReason === "stop" ||
      message.finishReason === "length" ||
      message.finishReason === "tool-calls" ||
      message.finishReason === "content-filter" ||
      message.finishReason === "error" ||
      message.finishReason === "other"
        ? message.finishReason
        : undefined,
    metadata: asRecord(message.metadata),
    parentId: typeof message.parentId === "string" ? message.parentId : null,
    sequence: typeof message.sequence === "number" ? message.sequence : undefined,
    branches: Array.isArray(message.branches)
      ? message.branches.map((branch) => {
          const value = asRecord(branch);
          return { id: String(value.id ?? ""), sequence: Number(value.sequence ?? 0) };
        })
      : undefined,
  };
}
export function toNative(messages: AIMessage[]) {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: message.parts.flatMap((part) => (part.type === "text" ? [{ type: "text" as const, content: part.text }] : [])),
    createdAt: message.createdAt,
    metadata: message.metadata,
  }));
}
export async function resolveValue<T>(value: T | (() => T | Promise<T>) | undefined, fallback: T): Promise<T> {
  return typeof value === "function" ? (value as () => T | Promise<T>)() : (value ?? fallback);
}

export function reconcileServerMessages(current: AIMessage[], incoming: AIMessage[]): AIMessage[] {
  const currentById = new Map(current.map((message) => [message.id, message]));
  return incoming.map((message) => {
    const optimistic = currentById.get(message.id);
    if (!optimistic) return message;
    const incomingText = message.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("");
    const optimisticText = optimistic.parts.flatMap((part) => (part.type === "text" ? [part.text] : [])).join("");
    if (optimisticText.length > incomingText.length && optimisticText.startsWith(incomingText)) {
      const optimisticIsTerminal = optimistic.status === "complete" || optimistic.status === "error" || optimistic.status === "stopped";
      return {
        ...message,
        parts: optimistic.parts,
        status: optimisticIsTerminal ? optimistic.status : message.status,
        finishReason: message.finishReason ?? optimistic.finishReason,
      };
    }
    return message;
  });
}

export function appendTextDelta(parts: readonly MessagePart[], delta: string): MessagePart[] {
  const next = [...parts];
  for (let index = next.length - 1; index >= 0; index--) {
    const part = next[index];
    if (part?.type === "text") {
      next[index] = { ...part, text: part.text + delta };
      return next;
    }
  }
  next.push({ type: "text", text: delta });
  return next;
}
