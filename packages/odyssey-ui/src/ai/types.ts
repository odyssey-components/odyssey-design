export type MessageRole = "system" | "user" | "assistant";
export type ToolExecutionState = "input-streaming" | "input-available" | "approval-required" | "running" | "output-available" | "output-error" | "rejected";

export interface TextPart {
  type: "text";
  id?: string;
  text: string;
}
export interface ReasoningPart {
  type: "reasoning";
  id?: string;
  text: string;
}
export interface SourcePart {
  type: "source";
  id?: string;
  url: string;
  title?: string;
  description?: string;
}
export interface DataPart {
  type: "data";
  id?: string;
  name: string;
  value: unknown;
}
export interface ToolCallPart {
  type: "tool-call";
  id: string;
  name: string;
  input: unknown;
  state: ToolExecutionState;
  approvalId?: string;
}
export interface ToolResultPart {
  type: "tool-result";
  toolCallId: string;
  output: unknown;
  state: "output-available" | "output-error";
  error?: string;
}
export interface AttachmentPart {
  type: "attachment";
  id?: string;
  mediaType: "image" | "audio" | "video" | "document";
  url: string;
  name?: string;
}
export type ComposerAttachmentStatus = "uploading" | "ready" | "failed";
export interface ComposerAttachment {
  id: string;
  name: string;
  mediaType?: string;
  size?: number;
  status?: ComposerAttachmentStatus;
  error?: string;
}
export interface Suggestion {
  id: string;
  title: string;
  description?: string;
  prompt: string;
}
export interface ErrorPart {
  type: "error";
  message: string;
}
export interface UnknownPart {
  type: "unknown";
  originalType: string;
  value: unknown;
}
export type MessagePart = TextPart | ReasoningPart | SourcePart | DataPart | ToolCallPart | ToolResultPart | AttachmentPart | ErrorPart | UnknownPart;
export type MessageStatus = "pending" | "streaming" | "complete" | "error" | "stopped";
export type MessageFinishReason = "stop" | "length" | "tool-calls" | "content-filter" | "error" | "other";

export interface AIMessage {
  id: string;
  role: MessageRole;
  parts: MessagePart[];
  createdAt?: Date;
  metadata?: Record<string, unknown>;
  status?: MessageStatus;
  finishReason?: MessageFinishReason;
  parentId?: string | null;
  sequence?: number;
  branches?: readonly { id: string; sequence: number }[];
}
export interface ThreadSummary {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface AssistantModelOption {
  id: string;
  label: string;
  description?: string;
  capabilities?: readonly string[];
  disabled?: boolean;
  /** Whether the provider offers this model as its default one. */
  isDefault?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AttachmentAdapter {
  upload(file: File, context: { sessionId: string; signal: AbortSignal }): Promise<ComposerAttachment>;
  remove?(attachment: ComposerAttachment, context: { sessionId: string; signal: AbortSignal }): Promise<void>;
}
