import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type OdysseyAILocale, OdysseyAILocaleProvider } from "./locale";
import { OdysseyAIRuntime } from "./localThreadRuntime";
import { createMemoryConversationStorage } from "./memory-storage";
import { appendTextDelta, reconcileServerMessages } from "./messageMapping";
import { type AssistantRuntime, createOdysseyAIRuntime } from "./runtime";
import { OdysseyAIRuntimeProvider } from "./runtimeContext";

export { OdysseyAIRuntimeProvider, useAIState, useAssistant, useComposerState, useThreadRuntime, useThreadState, useToolApproval } from "./runtimeContext";

import { settleServerResume } from "./server-resume";

import { createLocalConversationStorage } from "./storage";
import type { AIMessage, AssistantRuntimeOptions, ServerThreadAdapter, ThreadRunEvent, ThreadState, ToolApprovalRequest } from "./types";

function ServerThreadRuntime({
  children,
  config,
  runtime,
  adapter,
}: {
  children: ReactNode;
  config: AssistantRuntimeOptions;
  runtime: AssistantRuntime;
  adapter: ServerThreadAdapter;
}) {
  const sessionId = config.sessionId;
  const initialThread = config.initialThread;
  const [messages, setMessages] = useState<AIMessage[]>(() => initialThread?.messages ?? []),
    [headId, setHeadId] = useState<string | null>(initialThread?.headId ?? null),
    [input, setInput] = useState(""),
    [error, setError] = useState<Error>(),
    [hydrated, setHydrated] = useState(Boolean(initialThread)),
    [loading, setLoading] = useState(Boolean(initialThread?.activeRun));
  const controller = useRef<AbortController | undefined>(undefined),
    activeRun = useRef<string | undefined>(initialThread?.activeRun?.id),
    cursor = useRef<string | undefined>(undefined),
    appliedEvents = useRef(new Set<string>()),
    [approvals, setApprovals] = useState<ToolApprovalRequest[]>([]);
  const apply = useCallback((event: ThreadRunEvent) => {
    const eventKey = event.id;
    if (eventKey && appliedEvents.current.has(eventKey)) return;
    if (eventKey) appliedEvents.current.add(eventKey);
    if (event.id) cursor.current = event.id;
    if (event.runId) activeRun.current = event.runId;
    if (event.type === "TEXT_MESSAGE_START" && event.messageId) {
      const messageId = event.messageId;
      setMessages((current) =>
        current.some((item) => item.id === messageId)
          ? current
          : [...current, { id: messageId, role: "assistant", parts: [{ type: "text", text: "" }], sequence: event.sequence, status: "streaming" }],
      );
    }
    if (event.type === "TEXT_MESSAGE_CONTENT" && event.messageId) {
      setMessages((current) =>
        current.map((item) =>
          item.id === event.messageId
            ? {
                ...item,
                status: "streaming",
                parts: appendTextDelta(item.parts, event.delta ?? ""),
              }
            : item,
        ),
      );
    }
    if (event.type === "TEXT_MESSAGE_END" && event.messageId) {
      setMessages((current) => current.map((item) => (item.id === event.messageId ? { ...item, status: "complete", finishReason: event.finishReason } : item)));
    }
    if (event.type === "REASONING" && event.messageId) {
      setMessages((current) =>
        current.map((item) => {
          if (item.id !== event.messageId) return item;
          const parts = [...item.parts];
          const index = parts.findIndex((part) => part.type === "reasoning");
          if (index < 0) parts.push({ type: "reasoning", text: event.delta });
          else {
            const part = parts[index];
            if (part?.type === "reasoning") parts[index] = { ...part, text: part.text + event.delta };
          }
          return { ...item, parts, status: "streaming" };
        }),
      );
    }
    if (event.type === "TOOL_ACTIVITY" && event.messageId) {
      setMessages((current) =>
        current.map((item) => {
          if (item.id !== event.messageId) return item;
          const parts = item.parts.filter((part) => !(part.type === "tool-call" && part.id === event.toolCallId));
          parts.push({
            type: "tool-call",
            id: event.toolCallId,
            name: event.name,
            input: event.input,
            state:
              event.status === "complete"
                ? "output-available"
                : event.status === "error"
                  ? "output-error"
                  : event.status === "pending"
                    ? "input-available"
                    : "running",
          });
          if (event.status === "complete") parts.push({ type: "tool-result", toolCallId: event.toolCallId, output: event.output, state: "output-available" });
          if (event.status === "error")
            parts.push({ type: "tool-result", toolCallId: event.toolCallId, output: null, state: "output-error", error: event.error });
          return { ...item, parts };
        }),
      );
    }
    if (event.type === "FILE_CHANGE" && event.messageId) {
      setMessages((current) =>
        current.map((item) =>
          item.id === event.messageId
            ? {
                ...item,
                parts: [...item.parts, { type: "data", name: "file-change", value: { path: event.path, change: event.change, summary: event.summary } }],
              }
            : item,
        ),
      );
    }
    if (event.type === "APPROVAL_REQUESTED") {
      setApprovals((current) =>
        current.some((item) => item.id === event.approvalId)
          ? current
          : [
              ...current,
              {
                id: event.approvalId,
                messageId: event.messageId ?? "",
                toolCallId: event.toolCallId,
                toolName: event.toolName,
                input: event.input,
                reason: event.reason,
                affectedPaths: event.affectedPaths,
              },
            ],
      );
    }
    if (event.type === "APPROVAL_RESOLVED") setApprovals((current) => current.filter((item) => item.id !== event.approvalId));
    if (event.type === "RUN_ERROR") {
      setError(new Error(event.message ?? "AI response failed"));
      setMessages((current) => {
        const target = [...current].reverse().find((item) => item.role === "assistant");
        return target ? current.map((item) => (item.id === target.id ? { ...item, status: "error" } : item)) : current;
      });
      activeRun.current = undefined;
    }
    if (event.type === "RUN_FINISHED") activeRun.current = undefined;
  }, []);
  const begin = useCallback(() => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    // Approvals belong to the request/branch being replaced, not its successor.
    setApprovals([]);
    return abort;
  }, []);
  const owns = useCallback((abort: AbortController) => controller.current === abort && !abort.signal.aborted, []);
  const ownedApply = useCallback(
    (abort: AbortController) => (event: ThreadRunEvent) => {
      if (owns(abort)) apply(event);
    },
    [apply, owns],
  );
  const load = useCallback(
    async (abort = begin()) => {
      if (!owns(abort)) return;
      setLoading(true);
      try {
        const repo = await adapter.load(sessionId, abort.signal);
        if (!owns(abort)) return;
        setMessages((current) => reconcileServerMessages(current, repo.messages));
        setHeadId(repo.headId);
        activeRun.current = repo.activeRun?.id;
        if (repo.activeRun?.id) {
          void settleServerResume(
            adapter.resume(sessionId, repo.activeRun.id, cursor.current, ownedApply(abort), abort.signal),
            abort.signal,
            () => load(abort),
            setError,
            setLoading,
          );
        }
      } catch (value) {
        if (owns(abort)) setError(value instanceof Error ? value : new Error(String(value)));
      } finally {
        if (owns(abort)) {
          setHydrated(true);
          setLoading(false);
        }
      }
    },
    [adapter, begin, ownedApply, owns, sessionId],
  );
  useEffect(() => {
    if (initialThread) {
      const runId = initialThread.activeRun?.id;
      if (!runId) return () => controller.current?.abort();
      const abort = begin();
      void settleServerResume(
        adapter.resume(sessionId, runId, cursor.current, ownedApply(abort), abort.signal),
        abort.signal,
        () => load(abort),
        setError,
        setLoading,
      );
      return () => controller.current?.abort();
    }
    void load();
    return () => controller.current?.abort();
  }, [adapter, begin, initialThread, load, ownedApply, sessionId]);
  const run = useCallback(
    async (kind: "start" | "regenerate", value: string, attachmentIds?: string[]) => {
      const abort = begin();
      // Run-local event cursors and de-duplication cannot leak into the new owner.
      activeRun.current = undefined;
      cursor.current = undefined;
      appliedEvents.current.clear();
      setError(undefined);
      setLoading(true);
      try {
        if (kind === "start") {
          const clientMessageId = crypto.randomUUID();
          setMessages((current) => [
            ...current,
            { id: clientMessageId, role: "user", parts: [{ type: "text", text: value }], parentId: headId, status: "complete" },
          ]);
          await adapter.start(
            sessionId,
            { clientMessageId, parentMessageId: headId, parts: [{ type: "text", text: value }], attachmentIds },
            ownedApply(abort),
            abort.signal,
          );
        } else await adapter.regenerate(sessionId, value, ownedApply(abort), abort.signal);
        await load(abort);
      } catch (reason) {
        if (owns(abort)) setError(reason instanceof Error ? reason : new Error(String(reason)));
      } finally {
        if (owns(abort)) setLoading(false);
      }
    },
    [adapter, begin, headId, load, ownedApply, owns, sessionId],
  );
  const changeThread = useCallback(
    async (change: () => Promise<void>) => {
      const abort = begin();
      // A different branch or deleted subtree cannot inherit the old run cursor.
      activeRun.current = undefined;
      cursor.current = undefined;
      appliedEvents.current.clear();
      setError(undefined);
      setLoading(true);
      try {
        await change();
        await load(abort);
      } catch (reason) {
        if (owns(abort)) setError(reason instanceof Error ? reason : new Error(String(reason)));
      } finally {
        if (owns(abort)) setLoading(false);
      }
    },
    [begin, load, owns],
  );
  // Capture the owner together with the visible approval list. A callback
  // retained by an old surface must not approve a successor's reused ID.
  const resolveApproval = useMemo(() => {
    const owner = controller.current;
    return async (id: string, approved: boolean) => {
      if (!adapter.resolveApproval || !owner || !owns(owner)) return;
      if (!approvals.some((approval) => approval.id === id)) return;
      await adapter.resolveApproval(sessionId, id, approved);
      if (owns(owner)) setApprovals((current) => current.filter((item) => item.id !== id));
    };
  }, [adapter, approvals, owns, sessionId]);
  const state = useMemo<ThreadState>(
    () => ({
      sessionId,
      status: error ? "error" : loading ? "streaming" : "idle",
      hydrated,
      messages,
      input,
      setInput,
      isLoading: loading,
      error,
      approvals,
      headId,
      send: async (content = input, options) => {
        const value = content.trim();
        if (!value && !options?.attachmentIds?.length) return;
        setInput("");
        await run("start", value, options?.attachmentIds);
      },
      stop: () => {
        controller.current?.abort();
        const runId = activeRun.current;
        activeRun.current = undefined;
        // A stopped run cannot retain actionable tool approvals.
        setApprovals([]);
        if (runId) void adapter.cancel(sessionId, runId);
        setMessages((current) => {
          const target = [...current].reverse().find((item) => item.role === "assistant" && (item.status === "pending" || item.status === "streaming"));
          return target ? current.map((item) => (item.id === target.id ? { ...item, status: "stopped" } : item)) : current;
        });
        setLoading(false);
      },
      regenerate: async () => {
        const target = [...messages].reverse().find((item) => item.role === "assistant");
        if (target) await run("regenerate", target.id);
      },
      removeMessage: (id) => changeThread(() => adapter.deleteSubtree(sessionId, id)),
      clear: () => undefined,
      approve: (id) => resolveApproval(id, true),
      reject: (id) => resolveApproval(id, false),
      switchBranch: (id) => changeThread(() => adapter.switchBranch(sessionId, id)),
    }),
    [sessionId, error, hydrated, loading, messages, input, approvals, headId, run, adapter, changeThread, resolveApproval],
  );
  useLayoutEffect(() => runtime.update(state), [runtime, state]);
  return <OdysseyAIRuntimeProvider runtime={runtime}>{children}</OdysseyAIRuntimeProvider>;
}

function LocalOdysseyAIProvider({ children, config, runtime }: { children: ReactNode; config: AssistantRuntimeOptions; runtime: AssistantRuntime }) {
  const fallbackStorage = useMemo(() => {
    if (config.persistence === "custom" && !config.storage) throw new Error("Custom conversation persistence requires a storage adapter");
    if (config.storage) return config.storage;
    return config.persistence === "local" ? createLocalConversationStorage() : createMemoryConversationStorage();
  }, [config.persistence, config.storage]);
  const identity = useMemo(
    () => ({ productKey: config.productKey, sessionId: config.sessionId, userId: config.userId }),
    [config.productKey, config.sessionId, config.userId],
  );
  const [hydrated, setHydrated] = useState<AIMessage[] | null>(null);
  useEffect(() => {
    let active = true;
    setHydrated(null);
    void fallbackStorage
      .load(identity)
      .then((conversation) => {
        if (active) setHydrated(conversation?.messages ?? config.initialMessages ?? []);
      })
      .catch(() => {
        if (active) setHydrated(config.initialMessages ?? []);
      });
    return () => {
      active = false;
    };
  }, [fallbackStorage, identity, config.initialMessages]);
  if (hydrated === null) return null;
  return (
    <OdysseyAIRuntime config={config} hydratedMessages={hydrated} storage={fallbackStorage} runtime={runtime}>
      {children}
    </OdysseyAIRuntime>
  );
}
export function OdysseyAIProvider({ children, config, locale }: { children: ReactNode; config: AssistantRuntimeOptions; locale?: OdysseyAILocale }) {
  const runtime = useMemo(() => createOdysseyAIRuntime(), []);
  const content = config.threadAdapter ? (
    <ServerThreadRuntime config={config} runtime={runtime} adapter={config.threadAdapter}>
      {children}
    </ServerThreadRuntime>
  ) : (
    <LocalOdysseyAIProvider config={config} runtime={runtime}>
      {children}
    </LocalOdysseyAIProvider>
  );
  return <OdysseyAILocaleProvider locale={locale}>{content}</OdysseyAILocaleProvider>;
}
