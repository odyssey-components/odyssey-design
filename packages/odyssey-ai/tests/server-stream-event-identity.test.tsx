import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import type { ServerThreadAdapter, ThreadRunEvent, ThreadState } from "../src/types";

afterEach(cleanup);

describe("server stream event identity", () => {
  it("applies every no-id text delta even when the message sequence is unchanged", async () => {
    let receive: ((event: ThreadRunEvent) => void) | undefined;
    let state: ThreadState | undefined;

    const adapter: ServerThreadAdapter = {
      load: vi.fn(),
      start: vi.fn(),
      resume: vi.fn(
        (_session, _run, _cursor, onEvent, signal) =>
          new Promise<void>((_resolve, reject) => {
            receive = onEvent;
            signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
          }),
      ),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };

    function Probe() {
      state = useThreadRuntime();
      return null;
    }

    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/unused" }),
          productKey: "event-identity-test",
          sessionId: "session",
          threadAdapter: adapter,
          initialThread: { headId: null, messages: [], activeRun: { id: "run-1", status: "streaming" } },
        }}
      >
        <Probe />
      </OdysseyAIProvider>,
    );

    await waitFor(() => expect(receive).toBeTypeOf("function"));

    act(() => {
      receive?.({ type: "TEXT_MESSAGE_START", runId: "run-1", messageId: "m1", sequence: 7 });
      receive?.({ type: "TEXT_MESSAGE_CONTENT", runId: "run-1", messageId: "m1", sequence: 7, delta: "A" });
      receive?.({ type: "TEXT_MESSAGE_CONTENT", runId: "run-1", messageId: "m1", sequence: 7, delta: "B" });
    });

    expect(state?.messages.find((message) => message.id === "m1")?.parts).toEqual([{ type: "text", text: "AB" }]);
  });

  it("still ignores a repeated explicit event id", async () => {
    let receive: ((event: ThreadRunEvent) => void) | undefined;
    let state: ThreadState | undefined;
    const adapter: ServerThreadAdapter = {
      load: vi.fn(),
      start: vi.fn(),
      resume: vi.fn(
        (_session, _run, _cursor, onEvent, signal) =>
          new Promise<void>((_resolve, reject) => {
            receive = onEvent;
            signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
          }),
      ),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    function Probe() {
      state = useThreadRuntime();
      return null;
    }
    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/unused" }),
          productKey: "event-id-dedup-test",
          sessionId: "session",
          threadAdapter: adapter,
          initialThread: { headId: null, messages: [], activeRun: { id: "run-1", status: "streaming" } },
        }}
      >
        <Probe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(receive).toBeTypeOf("function"));
    act(() => {
      receive?.({ type: "TEXT_MESSAGE_START", id: "start", runId: "run-1", messageId: "m1", sequence: 7 });
      const event: ThreadRunEvent = {
        type: "TEXT_MESSAGE_CONTENT",
        id: "delta-1",
        runId: "run-1",
        messageId: "m1",
        sequence: 7,
        delta: "A",
      };
      receive?.(event);
      receive?.(event);
    });
    expect(state?.messages.find((message) => message.id === "m1")?.parts).toEqual([{ type: "text", text: "A" }]);
  });
});
