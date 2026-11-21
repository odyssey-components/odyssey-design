import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import { createServerThreadAdapter } from "../src/server-thread";
import type { ThreadRepository } from "../src/types";

afterEach(cleanup);

const knownThread: ThreadRepository = {
  headId: "assistant-known",
  messages: [
    {
      id: "assistant-known",
      role: "assistant",
      parts: [{ type: "text", text: "known answer" }],
      status: "streaming",
      branches: [
        { id: "assistant-known", sequence: 2 },
        { id: "assistant-alternative", sequence: 3 },
      ],
    },
  ],
  activeRun: { id: "run-known", status: "streaming" },
};

function ThreadReadProbe() {
  const thread = useThreadRuntime();
  return (
    <div>
      <output data-testid="status">{thread.status}</output>
      <output data-testid="hydrated">{String(thread.hydrated)}</output>
      <output data-testid="loading">{String(thread.isLoading)}</output>
      <output data-testid="head">{thread.headId ?? "none"}</output>
      <output data-testid="messages">
        {thread.messages.flatMap((message) => message.parts.map((part) => (part.type === "text" ? part.text : ""))).join("|")}
      </output>
      <output data-testid="branches">{thread.messages.flatMap((message) => message.branches?.map((branch) => branch.id) ?? []).join("|")}</output>
      <output data-testid="error">{thread.error?.message ?? "none"}</output>
      <button type="button" onClick={() => thread.stop()}>
        stop
      </button>
    </div>
  );
}

describe("server thread read error contract", () => {
  it("keeps known state and cancellation identity after a real adapter load rejects", async () => {
    let resumeController: ReadableStreamDefaultController<Uint8Array> | undefined;
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        resumeController = controller;
      },
    });
    const requests: { path: string; method: string }[] = [];
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const path = String(input);
      const method = init?.method ?? "GET";
      requests.push({ path, method });
      if (path === "/api/conversations/thread-known/runs/run-known/stream" && method === "GET") return new Response(stream);
      if (path === "/api/conversations/thread-known/messages" && method === "GET") {
        return new Response(JSON.stringify({ error: "failed to load active run" }), { status: 500 });
      }
      if (path === "/api/conversations/thread-known/runs/run-known" && method === "DELETE") return new Response(null, { status: 204 });
      throw new Error(`Unexpected fake request: ${method} ${path}`);
    });
    const adapter = createServerThreadAdapter({ fetch: fetcher });
    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/api/ai" }),
          productKey: "test",
          sessionId: "thread-known",
          threadAdapter: adapter,
          initialThread: knownThread,
        }}
      >
        <ThreadReadProbe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(requests).toEqual([{ path: "/api/conversations/thread-known/runs/run-known/stream", method: "GET" }]));
    expect(screen.getByTestId("status")).toHaveTextContent("streaming");
    // Completing the accepted resume triggers the production load() path. It
    // returns HTTP 500, not a fake adapter rejection or an idle snapshot.
    await act(async () => {
      if (!resumeController) throw new Error("resume stream was not opened");
      resumeController.close();
    });
    await waitFor(() => expect(screen.getByTestId("error")).toHaveTextContent("failed to load active run"));
    expect(screen.getByTestId("status")).toHaveTextContent("error");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("messages")).toHaveTextContent("known answer");
    expect(screen.getByTestId("head")).toHaveTextContent("assistant-known");
    expect(screen.getByTestId("branches")).toHaveTextContent("assistant-known|assistant-alternative");
    expect(requests).toEqual([
      { path: "/api/conversations/thread-known/runs/run-known/stream", method: "GET" },
      { path: "/api/conversations/thread-known/messages", method: "GET" },
    ]);
    fireEvent.click(screen.getByRole("button", { name: "stop" }));
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(requests[2]).toEqual({ path: "/api/conversations/thread-known/runs/run-known", method: "DELETE" });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it.each([false, true])("accepts a healthy snapshot with no active run (empty=%s)", async (empty) => {
    const snapshot: ThreadRepository = empty ? { headId: null, messages: [], activeRun: null } : { ...knownThread, activeRun: null };
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      expect(String(input)).toBe("/api/conversations/thread-known/messages");
      return new Response(JSON.stringify(snapshot));
    });
    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/api/ai" }),
          productKey: "test",
          sessionId: "thread-known",
          threadAdapter: createServerThreadAdapter({ fetch: fetcher }),
        }}
      >
        <ThreadReadProbe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("hydrated")).toHaveTextContent("true"));
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
    expect(screen.getByTestId("head")).toHaveTextContent(empty ? "none" : "assistant-known");
    if (empty) {
      expect(screen.getByTestId("messages")).toBeEmptyDOMElement();
      expect(screen.getByTestId("branches")).toBeEmptyDOMElement();
    } else {
      expect(screen.getByTestId("messages")).toHaveTextContent("known answer");
      expect(screen.getByTestId("branches")).toHaveTextContent("assistant-known|assistant-alternative");
    }
    fireEvent.click(screen.getByRole("button", { name: "stop" }));
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
