import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import type { AIMessage, ServerThreadAdapter, ThreadRepository, ThreadState } from "../src/types";

afterEach(cleanup);

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

type Head = "A" | "B" | "C";

function repository(head: Head): ThreadRepository {
  const message: AIMessage = {
    id: head,
    role: "assistant",
    parts: [{ type: "text", text: `branch ${head}` }],
    status: "complete",
  };
  return { headId: head, messages: [message], activeRun: null };
}

function mount(adapter: ServerThreadAdapter) {
  let state: ThreadState | undefined;
  function Probe() {
    state = useThreadRuntime();
    return null;
  }
  render(
    <OdysseyAIProvider
      config={{
        client: createOdysseyAIClient({ endpoint: "/unused" }),
        productKey: "branch-owner-test",
        sessionId: "session",
        threadAdapter: adapter,
        initialThread: repository("B"),
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
  };
}

describe("server branch request ownership", () => {
  it("keeps the newest branch when an older load ignores cancellation and resolves last", async () => {
    let appliedHead: Head = "B";
    const loads: Array<{ head: Head; signal: AbortSignal; reply: ReturnType<typeof deferred<ThreadRepository>> }> = [];
    const adapter: ServerThreadAdapter = {
      switchBranch: vi.fn(async (_session, id) => {
        appliedHead = id as Head;
      }),
      load: vi.fn((_session, signal) => {
        const reply = deferred<ThreadRepository>();
        loads.push({ head: appliedHead, signal, reply });
        return reply.promise; // intentionally ignores cancellation
      }),
      start: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    const view = mount(adapter);

    let first!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
    });
    await waitFor(() => expect(loads).toHaveLength(1));
    expect(loads[0]?.head).toBe("A");

    let second!: Promise<void>;
    await act(async () => {
      second = view.current().switchBranch("C");
    });
    await waitFor(() => expect(loads).toHaveLength(2));
    expect(loads[0]?.signal.aborted).toBe(true);
    expect(loads[1]?.head).toBe("C");

    await act(async () => {
      loads[1]!.reply.resolve(repository("C"));
      await second;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().messages[0]?.id).toBe("C");

    await act(async () => {
      loads[0]!.reply.resolve(repository("A"));
      await first;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().messages[0]?.id).toBe("C");
  });

  it("does not let an older delayed switch acknowledgement start a load after a newer switch wins", async () => {
    let appliedHead: Head = "B";
    const acknowledgements: Array<{ head: Head; reply: ReturnType<typeof deferred<void>> }> = [];
    const loads: Array<{ head: Head; reply: ReturnType<typeof deferred<ThreadRepository>> }> = [];
    const adapter: ServerThreadAdapter = {
      switchBranch: vi.fn((_session, id) => {
        appliedHead = id as Head;
        const reply = deferred<void>();
        acknowledgements.push({ head: appliedHead, reply });
        return reply.promise;
      }),
      load: vi.fn(() => {
        const reply = deferred<ThreadRepository>();
        loads.push({ head: appliedHead, reply });
        return reply.promise;
      }),
      start: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    const view = mount(adapter);

    let first!: Promise<void>;
    let second!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
      second = view.current().switchBranch("C");
    });
    expect(acknowledgements.map((item) => item.head)).toEqual(["A", "C"]);

    await act(async () => {
      acknowledgements[1]!.reply.resolve();
    });
    await waitFor(() => expect(loads).toHaveLength(1));
    expect(loads[0]?.head).toBe("C");

    await act(async () => {
      loads[0]!.reply.resolve(repository("C"));
      await second;
    });
    expect(view.current().headId).toBe("C");

    await act(async () => {
      acknowledgements[0]!.reply.resolve();
      await first;
    });
    expect(loads).toHaveLength(1);
    expect(view.current().headId).toBe("C");
    expect(view.current().messages[0]?.id).toBe("C");
  });
});
