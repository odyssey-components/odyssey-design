import { render } from "@testing-library/react";
import { vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import type { AIMessage, ServerThreadAdapter, ThreadRepository, ThreadState } from "../src/types";

export function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

export function repository(head: string, activeRun: ThreadRepository["activeRun"] = null): ThreadRepository {
  const message: AIMessage = {
    id: head,
    role: "assistant",
    parts: [{ type: "text", text: `branch ${head}` }],
    status: "complete",
  };
  return { headId: head, messages: [message], activeRun };
}

export function adapterWith(overrides: Partial<ServerThreadAdapter>): ServerThreadAdapter {
  return {
    switchBranch: vi.fn(async () => {}),
    load: vi.fn(async () => repository("B")),
    start: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    deleteSubtree: vi.fn(),
    regenerate: vi.fn(),
    ...overrides,
  };
}

export function mount(adapter: ServerThreadAdapter, initialThread: ThreadRepository = repository("B")) {
  let state: ThreadState | undefined;
  function Probe() {
    state = useThreadRuntime();
    return null;
  }
  const mounted = render(
    <OdysseyAIProvider
      config={{
        client: createOdysseyAIClient({ endpoint: "/unused" }),
        productKey: "branch-owner-late-test",
        sessionId: "session",
        threadAdapter: adapter,
        initialThread,
      }}
    >
      <Probe />
    </OdysseyAIProvider>,
  );
  return {
    current() {
      if (!state) throw new Error("thread state unavailable");
      return state;
    },
    unmount: mounted.unmount,
  };
}
