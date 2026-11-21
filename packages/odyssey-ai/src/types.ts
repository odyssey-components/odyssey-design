// The AI presentation contracts live with the AI components in
// @odyssey/ui/ai. The runtime contracts below stay here because they describe
// transport, persistence and provider events.
export type {
  AIMessage,
  AttachmentPart,
  ComposerAttachmentStatus,
  DataPart,
  ErrorPart,
  MessageFinishReason,
  MessagePart,
  MessageRole,
  ReasoningPart,
  Suggestion,
  SourcePart,
  TextPart,
  ThreadSummary,
  ToolCallPart,
  ToolExecutionState,
  ToolResultPart,
  UnknownPart,
} from "@odyssey/ui/ai/types";

import type {
  AIMessage,
  MessageFinishReason,
  MessagePart,
  ThreadSummary,
} from "@odyssey/ui/ai/types";

export interface ThreadRepository {
  headId: string | null;
  messages: AIMessage[];
  activeRun?: { id: string; status: string } | null;
}
interface ThreadRunEventBase {
  id?: string;
  runId?: string;
  messageId?: string;
  sequence?: number;
}
export type ThreadRunEvent =
  | (ThreadRunEventBase & { type: "RUN_STARTED" })
  | (ThreadRunEventBase & { type: "TEXT_MESSAGE_START" })
  | (ThreadRunEventBase & { type: "TEXT_MESSAGE_CONTENT"; delta: string })
  | (ThreadRunEventBase & { type: "TEXT_MESSAGE_END"; finishReason?: MessageFinishReason })
  | (ThreadRunEventBase & { type: "REASONING"; delta: string })
  | (ThreadRunEventBase & {
      type: "TOOL_ACTIVITY";
      toolCallId: string;
      name: string;
      input?: unknown;
      status: "pending" | "running" | "complete" | "error";
      output?: unknown;
      error?: string;
    })
  | (ThreadRunEventBase & { type: "FILE_CHANGE"; path: string; change: "created" | "modified" | "deleted"; summary?: string })
  | (ThreadRunEventBase & {
      type: "APPROVAL_REQUESTED";
      approvalId: string;
      toolCallId: string;
      toolName: string;
      input?: unknown;
      reason?: string;
      affectedPaths?: string[];
    })
  | (ThreadRunEventBase & { type: "APPROVAL_RESOLVED"; approvalId: string; approved: boolean })
  | (ThreadRunEventBase & { type: "RUN_ERROR"; message?: string; code?: string })
  | (ThreadRunEventBase & { type: "RUN_FINISHED"; finishReason?: MessageFinishReason });
export interface LegacyThreadRunEvent extends ThreadRunEventBase {
  type: string;
  delta?: string;
  message?: string;
  code?: string;
  finishReason?: MessageFinishReason;
}
export interface ThreadRunInput {
  clientMessageId: string;
  parentMessageId: string | null;
  parts: MessagePart[];
  attachmentIds?: string[];
}
export interface ServerThreadAdapter {
  load(sessionId: string, signal: AbortSignal): Promise<ThreadRepository>;
  start(sessionId: string, input: ThreadRunInput, onEvent: (event: ThreadRunEvent) => void, signal: AbortSignal): Promise<void>;
  resume(sessionId: string, runId: string, cursor: string | undefined, onEvent: (event: ThreadRunEvent) => void, signal: AbortSignal): Promise<void>;
  cancel(sessionId: string, runId: string): Promise<void>;
  switchBranch(sessionId: string, headId: string): Promise<void>;
  deleteSubtree(sessionId: string, messageId: string): Promise<void>;
  regenerate(sessionId: string, messageId: string, onEvent: (event: ThreadRunEvent) => void, signal: AbortSignal): Promise<void>;
  resolveApproval?(sessionId: string, approvalId: string, approved: boolean): Promise<void>;
}
export interface SessionIdentity {
  productKey: string;
  sessionId: string;
  userId?: string;
}
export interface StoredConversation {
  version: 1;
  messages: AIMessage[];
  updatedAt: string;
}
export interface ConversationStorage {
  load(session: SessionIdentity): Promise<StoredConversation | null>;
  save(session: SessionIdentity, conversation: StoredConversation): Promise<void>;
  remove(session: SessionIdentity): Promise<void>;
}
export type ConversationPersistence = "none" | "local" | "custom";
export interface ToolExecutionContext {
  signal: AbortSignal;
  messageId: string;
  toolCallId: string;
}
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  name: string;
  description?: string;
  requiresApproval?: boolean;
  execute(input: TInput, context: ToolExecutionContext): Promise<TOutput> | TOutput;
}
export interface ToolApprovalRequest {
  id: string;
  messageId: string;
  toolCallId: string;
  toolName: string;
  input: unknown;
  reason?: string;
  affectedPaths?: string[];
}
export type HeadersResolver = () => HeadersInit | Promise<HeadersInit>;
export type MetadataResolver = () => Record<string, unknown> | Promise<Record<string, unknown>>;
export interface OdysseyAIClientConfig {
  endpoint: string | (() => string);
  headers?: HeadersInit | HeadersResolver;
  credentials?: RequestCredentials;
  metadata?: Record<string, unknown> | MetadataResolver;
  fetch?: typeof globalThis.fetch;
  mapError?: (error: Error) => Error;
}
export interface OdysseyAIClient {
  readonly config: Readonly<OdysseyAIClientConfig>;
  readonly __brand: "OdysseyAIClient";
}
export interface AssistantRuntimeOptions {
  client: OdysseyAIClient;
  productKey: string;
  sessionId: string;
  userId?: string;
  storage?: ConversationStorage;
  persistence?: ConversationPersistence;
  tools?: readonly ToolDefinition[];
  initialMessages?: AIMessage[];
  initialThread?: ThreadRepository;
  threadAdapter?: ServerThreadAdapter;
}

export interface OdysseyChatState {
  messages: AIMessage[];
  input: string;
  setInput(value: string): void;
  send(content?: string, options?: { attachmentIds?: string[] }): Promise<void>;
  stop(): void;
  regenerate(): Promise<void>;
  removeMessage(id: string): Promise<void>;
  clear(): void;
  isLoading: boolean;
  error?: Error;
  approvals: ToolApprovalRequest[];
  approve(id: string): Promise<void>;
  reject(id: string): Promise<void>;
  headId?: string | null;
  switchBranch(messageId: string): Promise<void>;
}
export interface ThreadState extends OdysseyChatState {
  sessionId: string;
  status: "idle" | "submitting" | "streaming" | "stopping" | "error";
  hydrated: boolean;
}
export interface AssistantState {
  thread: ThreadState;
}
export interface ThreadListAdapter {
  list(signal: AbortSignal): Promise<ThreadSummary[]>;
  create(input: { title?: string; metadata?: Record<string, unknown> }, signal: AbortSignal): Promise<ThreadSummary>;
  update(id: string, input: { title?: string; metadata?: Record<string, unknown> }, signal: AbortSignal): Promise<ThreadSummary>;
  remove(id: string, signal: AbortSignal): Promise<void>;
}
