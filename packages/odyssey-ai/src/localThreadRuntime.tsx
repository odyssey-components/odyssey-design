import { fetchServerSentEvents } from "@tanstack/ai-client";
import { useChat } from "@tanstack/ai-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createStoredConversation } from "./memory-storage";
import { mapMessage, resolveValue, toNative } from "./messageMapping";
import { OdysseyAIRuntimeProvider } from "./runtimeContext";
import type { RuntimeProps } from "./runtimeProps";
import type { ThreadState, ToolApprovalRequest, ToolCallPart, ToolDefinition } from "./types";

// Local-mode runtime is independent from the server-owned request lifecycle.
// Keep it separate so the server-branch admission code stays reviewable.

export function OdysseyAIRuntime({ children, config, hydratedMessages, storage, runtime }: RuntimeProps) {
  const { client, sessionId, tools = [], initialMessages = [] } = config;
  const identity = useMemo(
    () => ({ productKey: config.productKey, sessionId: config.sessionId, userId: config.userId }),
    [config.productKey, config.sessionId, config.userId],
  );
  const connection = useMemo(
    () =>
      fetchServerSentEvents(client.config.endpoint, async () => ({
        headers: new Headers(await resolveValue(client.config.headers, {})),
        credentials: client.config.credentials,
        body: await resolveValue(client.config.metadata, {}),
        fetchClient: client.config.fetch,
      })),
    [client],
  );
  const native = useChat({
    connection,
    threadId: sessionId,
    persistence: false,
    initialMessages: toNative(hydratedMessages.length ? hydratedMessages : initialMessages),
    onError: (error) => client.config.mapError?.(error) ?? error,
  });
  const [input, setInput] = useState("");
  const running = useRef(new Map<string, AbortController>());
  const handled = useRef(new Set<string>());
  const toolMap = useMemo(() => new Map(tools.map((tool) => [tool.name, tool])), [tools]);
  const messages = useMemo(() => native.messages.map(mapMessage), [native.messages]);
  const lastSaved = useRef("");
  const approvals = useMemo<ToolApprovalRequest[]>(
    () =>
      messages.flatMap((message) =>
        message.parts.flatMap((part) =>
          part.type === "tool-call" && part.approvalId
            ? [{ id: part.approvalId, messageId: message.id, toolCallId: part.id, toolName: part.name, input: part.input }]
            : [],
        ),
      ),
    [messages],
  );
  const execute = useCallback(
    async (messageId: string, part: ToolCallPart, tool: ToolDefinition) => {
      if (handled.current.has(part.id)) return;
      handled.current.add(part.id);
      const controller = new AbortController();
      running.current.set(part.id, controller);
      try {
        const output = await tool.execute(part.input, { signal: controller.signal, messageId, toolCallId: part.id });
        await native.addToolResult({ toolCallId: part.id, tool: part.name, output });
      } catch (error) {
        if (!controller.signal.aborted)
          await native.addToolResult({
            toolCallId: part.id,
            tool: part.name,
            output: null,
            state: "output-error",
            errorText: error instanceof Error ? error.message : String(error),
          });
      } finally {
        running.current.delete(part.id);
      }
    },
    [native.addToolResult],
  );
  useEffect(() => {
    for (const message of messages)
      for (const part of message.parts)
        if (part.type === "tool-call" && !part.approvalId) {
          const tool = toolMap.get(part.name);
          if (tool && !tool.requiresApproval && (part.state === "input-available" || part.state === "running")) void execute(message.id, part, tool);
        }
  }, [messages, toolMap, execute]);
  useEffect(
    () => () => {
      for (const controller of running.current.values()) controller.abort();
      native.stop();
    },
    [native.stop],
  );
  useEffect(() => {
    if (native.isLoading) return;
    const signature = JSON.stringify(messages);
    if (signature === lastSaved.current) return;
    lastSaved.current = signature;
    if (messages.length) void storage.save(identity, createStoredConversation(messages));
  }, [identity, messages, native.isLoading, storage]);
  const resolveApproval = useCallback(
    async (id: string, approved: boolean) => {
      const approval = approvals.find((item) => item.id === id);
      if (!approval) return;
      native.addToolApprovalResponse({ id, approved });
      if (approved) {
        const tool = toolMap.get(approval.toolName);
        if (tool)
          await execute(
            approval.messageId,
            { type: "tool-call", id: approval.toolCallId, name: approval.toolName, input: approval.input, state: "running" },
            tool,
          );
      }
    },
    [approvals, execute, native.addToolApprovalResponse, toolMap],
  );
  const state = useMemo<ThreadState>(
    () => ({
      sessionId,
      status: native.error ? "error" : native.isLoading ? "streaming" : "idle",
      hydrated: true,
      messages,
      input,
      setInput,
      isLoading: native.isLoading,
      error: native.error,
      approvals,
      send: async (content = input) => {
        const value = content.trim();
        if (!value) return;
        setInput("");
        await native.sendMessage(value);
      },
      stop: native.stop,
      regenerate: native.reload,
      removeMessage: async (id) => {
        const next = messages.filter((message) => message.id !== id);
        native.setMessages(toNative(next));
        lastSaved.current = JSON.stringify(next);
        if (next.length) await storage.save(identity, createStoredConversation(next));
        else await storage.remove(identity);
      },
      clear: () => {
        native.clear();
        lastSaved.current = "";
        void storage.remove(identity);
      },
      approve: (id) => resolveApproval(id, true),
      reject: (id) => resolveApproval(id, false),
      switchBranch: async () => undefined,
    }),
    [
      messages,
      input,
      native.isLoading,
      native.error,
      native.sendMessage,
      native.stop,
      native.reload,
      native.clear,
      sessionId,
      native.setMessages,
      approvals,
      resolveApproval,
      identity,
      storage,
    ],
  );
  useLayoutEffect(() => runtime.update(state), [runtime, state]);
  return <OdysseyAIRuntimeProvider runtime={runtime}>{children}</OdysseyAIRuntimeProvider>;
}
