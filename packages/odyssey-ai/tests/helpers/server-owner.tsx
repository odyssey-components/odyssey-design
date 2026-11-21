import { render } from "@testing-library/react";
import { vi } from "vitest";
import { createOdysseyAIClient } from "../../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../../src/react";
import type { ServerThreadAdapter, ThreadRepository, ThreadRunEvent, ThreadState } from "../../src/types";

export function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

export function repository(head: string, runId?: string): ThreadRepository {
  return {
    headId: head,
    messages: [{ id: head, role: "assistant", status: "complete", parts: [{ type: "text", text: head }] }],
    activeRun: runId ? { id: runId, status: "streaming" } : null,
  };
}

type Stream = {
  signal: AbortSignal;
  onEvent: (event: ThreadRunEvent) => void;
  reply: ReturnType<typeof deferred<void>>;
  runId?: string;
};

export function controlledAdapter() {
  const loads: Array<{ signal: AbortSignal; reply: ReturnType<typeof deferred<ThreadRepository>> }> = [];
  const starts: Stream[] = [],
    regenerations: Stream[] = [],
    resumes: Stream[] = [];
  function stream(queue: Stream[], onEvent: Stream["onEvent"], signal: AbortSignal, runId?: string) {
    const reply = deferred<void>();
    queue.push({ signal, onEvent, reply, runId });
    return reply.promise; // Deliberately ignores AbortSignal.
  }
  const adapter = {
    load: vi.fn<ServerThreadAdapter["load"]>((_session, signal) => {
      const reply = deferred<ThreadRepository>();
      loads.push({ signal, reply });
      return reply.promise; // Deliberately ignores AbortSignal.
    }),
    switchBranch: vi.fn<ServerThreadAdapter["switchBranch"]>(async () => undefined),
    deleteSubtree: vi.fn<ServerThreadAdapter["deleteSubtree"]>(async () => undefined),
    start: vi.fn<ServerThreadAdapter["start"]>((_session, _input, onEvent, signal) => stream(starts, onEvent, signal)),
    regenerate: vi.fn<ServerThreadAdapter["regenerate"]>((_session, _message, onEvent, signal) => stream(regenerations, onEvent, signal)),
    resume: vi.fn<ServerThreadAdapter["resume"]>((_session, runId, _cursor, onEvent, signal) => stream(resumes, onEvent, signal, runId)),
    cancel: vi.fn<ServerThreadAdapter["cancel"]>(async () => undefined),
  } satisfies ServerThreadAdapter;
  return { adapter, loads, starts, regenerations, resumes };
}

export function mount(adapter: ServerThreadAdapter, initial: ThreadRepository | null = repository("B")) {
  let state: ThreadState | undefined;
  function Probe() {
    state = useThreadRuntime();
    return null;
  }
  const view = render(
    <OdysseyAIProvider
      config={{
        client: createOdysseyAIClient({ endpoint: "/unused" }),
        productKey: "request-owner-regression",
        sessionId: "session",
        threadAdapter: adapter,
        initialThread: initial ?? undefined,
      }}
    >
      <Probe />
    </OdysseyAIProvider>,
  );
  return {
    unmount: view.unmount,
    current() {
      if (!state) throw new Error("thread state unavailable");
      return state;
    },
  };
}
