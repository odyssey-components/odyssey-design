import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import type { AIMessage, ServerThreadAdapter, ThreadRepository, ThreadState } from "../src/types";

afterEach(cleanup);

const canonicalMessage: AIMessage = {
  id: "assistant-1",
  role: "assistant",
  status: "complete",
  parts: [
    {
      type: "tool-result",
      toolCallId: "tool-1",
      output: { preserved: true },
      state: "output-available",
    },
    {
      type: "attachment",
      id: "attachment-1",
      mediaType: "document",
      url: "/report.txt",
      name: "report.txt",
    },
  ],
};

function adapterWith(repo: ThreadRepository): ServerThreadAdapter {
  return {
    load: vi.fn().mockResolvedValue(repo),
    start: vi.fn(),
    resume: vi.fn(),
    cancel: vi.fn(),
    switchBranch: vi.fn(),
    deleteSubtree: vi.fn(),
    regenerate: vi.fn(),
  };
}

function Probe({ capture }: { capture: (state: ThreadState) => void }) {
  capture(useThreadRuntime());
  return null;
}

function provider(adapter: ServerThreadAdapter, capture: (state: ThreadState) => void, initialThread?: ThreadRepository) {
  return (
    <OdysseyAIProvider
      config={{
        client: createOdysseyAIClient({ endpoint: "/unused" }),
        productKey: "canonical-hydration-test",
        sessionId: "session",
        threadAdapter: adapter,
        initialThread,
      }}
    >
      <Probe capture={capture} />
    </OdysseyAIProvider>
  );
}

describe("server thread canonical hydration", () => {
  it("preserves canonical tool-result output and attachment parts from initialThread", () => {
    const repo: ThreadRepository = { headId: "assistant-1", messages: [canonicalMessage], activeRun: null };
    let state: ThreadState | undefined;
    render(provider(adapterWith(repo), (value) => (state = value), repo));

    expect(state?.messages[0]?.parts).toEqual(canonicalMessage.parts);
  });

  it("preserves canonical parts returned by adapter.load", async () => {
    const repo: ThreadRepository = { headId: "assistant-1", messages: [canonicalMessage], activeRun: null };
    const adapter = adapterWith(repo);
    let state: ThreadState | undefined;
    render(provider(adapter, (value) => (state = value)));

    await waitFor(() => expect(state?.hydrated).toBe(true));
    expect(state?.messages[0]?.parts).toEqual(canonicalMessage.parts);
    expect(adapter.load).toHaveBeenCalledTimes(1);
  });
});
