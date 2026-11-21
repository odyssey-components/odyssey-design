import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantWorkspace } from "../src/assistant";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import { createServerThreadAdapter } from "../src/server-thread";
import type { ThreadState } from "../src/types";
import { deferred, repository } from "./helpers/server-owner";

afterEach(cleanup);

describe("standard Assistant recovery error visibility", () => {
  it("shows the current HTTP resume failure alongside a historical message error", async () => {
    const failureText = "Recovery unavailable for this exact attempt";
    const snapshot = repository("known-answer", "known-run");
    snapshot.messages.unshift({
      id: "historical-error",
      role: "assistant",
      status: "error",
      parts: [{ type: "text", text: "Historical failed answer" }],
    });
    const expectedMessages = structuredClone(snapshot.messages);
    const resume = deferred<Response>();
    // Hold an accidental reload so a regression cannot start an unbounded loop.
    const unexpectedLoad = deferred<Response>();
    const requests: string[] = [];
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const request = `${init?.method ?? "GET"} ${String(input)}`;
      requests.push(request);
      if (request === "GET /api/conversations/thread-known/runs/known-run/stream") return resume.promise;
      if (request === "GET /api/conversations/thread-known/messages") return unexpectedLoad.promise;
      throw new Error(`Unexpected fake request: ${request}`);
    });
    let current: ThreadState | undefined;
    function Probe() {
      current = useThreadRuntime();
      return null;
    }
    function thread() {
      if (!current) throw new Error("Thread runtime was not rendered");
      return current;
    }
    const view = render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/unused" }),
          productKey: "resume-visibility-regression",
          sessionId: "thread-known",
          initialThread: snapshot,
          threadAdapter: createServerThreadAdapter({ fetch: fetcher }),
        }}
      >
        <Probe />
        <AssistantWorkspace options={{ header: false, composer: false }} />
      </OdysseyAIProvider>,
    );

    try {
      await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
      expect(thread().error).toBeUndefined();
      expect(thread().isLoading).toBe(true);
      const historicalAlert = screen.getByRole("alert");
      expect(historicalAlert).toHaveAttribute("data-od-slot", "ai-message-status");
      expect(historicalAlert).not.toHaveTextContent(failureText);
      expect(screen.queryByText(failureText)).not.toBeInTheDocument();

      await act(async () => {
        resume.resolve(new Response(JSON.stringify({ error: failureText }), { status: 404 }));
      });
      await waitFor(() => expect(screen.getByText(failureText)).toHaveAttribute("role", "alert"));
      expect(screen.getAllByRole("alert")).toHaveLength(2);
      expect(screen.getByText("Historical failed answer")).toBeInTheDocument();
      expect(view.container.querySelector('[data-od-slot="ai-message-status"][role="alert"]')).toBeInTheDocument();
      expect(thread().error?.message).toBe(failureText);
      expect(thread().status).toBe("error");
      expect(thread().isLoading).toBe(false);
      expect(thread().headId).toBe("known-answer");
      expect(thread().messages).toEqual(expectedMessages);
      expect(requests).toEqual(["GET /api/conversations/thread-known/runs/known-run/stream"]);
    } finally {
      view.unmount();
    }
  });
});
