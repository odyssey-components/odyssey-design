import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createOdysseyAIClient } from "../src/client";
import { OdysseyAIProvider, useThreadRuntime } from "../src/react";
import type { ServerThreadAdapter } from "../src/types";

afterEach(cleanup);

describe("server thread runtime", () => {
  it("projects server approvals and resolves them through the adapter", async () => {
    const resolveApproval = vi.fn();
    const adapter: ServerThreadAdapter = {
      load: vi.fn().mockResolvedValue({ headId: null, messages: [], activeRun: null }),
      start: vi.fn(async (_sessionId, _input, onEvent) => {
        onEvent({
          type: "APPROVAL_REQUESTED",
          id: "approval-event",
          approvalId: "approval-1",
          toolCallId: "tool-1",
          toolName: "shell",
          reason: "Run checks",
          affectedPaths: ["/workspace"],
        });
      }),
      resume: vi.fn(),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
      resolveApproval,
    };
    function Probe() {
      const thread = useThreadRuntime();
      return (
        <div>
          <span>{thread.approvals[0]?.reason}</span>
          <button type="button" onClick={() => void thread.send("start")}>
            start
          </button>
          <button type="button" onClick={() => void thread.approve("approval-1")}>
            approve
          </button>
        </div>
      );
    }
    render(
      <OdysseyAIProvider config={{ client: createOdysseyAIClient({ endpoint: "/api/ai" }), productKey: "test", sessionId: "thread", threadAdapter: adapter }}>
        <Probe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(adapter.load).toHaveBeenCalled());
    await act(async () => screen.getByRole("button", { name: "start" }).click());
    expect(screen.getByText("Run checks")).toBeInTheDocument();
    await act(async () => screen.getByRole("button", { name: "approve" }).click());
    expect(resolveApproval).toHaveBeenCalledWith("thread", "approval-1", true);
  });
  it("hydrates synchronously from an initial thread without loading it again", async () => {
    const adapter: ServerThreadAdapter = {
      load: vi.fn(),
      start: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    function Probe() {
      const thread = useThreadRuntime();
      return (
        <div>
          <span>{thread.hydrated ? "hydrated" : "loading"}</span>
          <span>{thread.messages[0]?.parts[0]?.type === "text" ? thread.messages[0].parts[0].text : ""}</span>
        </div>
      );
    }
    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/api/ai" }),
          productKey: "test",
          sessionId: "thread-prefetched",
          threadAdapter: adapter,
          initialThread: {
            headId: "assistant-1",
            messages: [{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "预取的回答" }], status: "complete" }],
            activeRun: null,
          },
        }}
      >
        <Probe />
      </OdysseyAIProvider>,
    );

    expect(screen.getByText("hydrated")).toBeInTheDocument();
    expect(screen.getByText("预取的回答")).toBeInTheDocument();
    expect(adapter.load).not.toHaveBeenCalled();
  });

  it("resumes an active run from an initial thread without an initial reload", async () => {
    const resume = vi.fn(() => new Promise<void>(() => undefined));
    const adapter: ServerThreadAdapter = {
      load: vi.fn(),
      start: vi.fn(),
      resume,
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    render(
      <OdysseyAIProvider
        config={{
          client: createOdysseyAIClient({ endpoint: "/api/ai" }),
          productKey: "test",
          sessionId: "thread-active",
          threadAdapter: adapter,
          initialThread: { headId: null, messages: [], activeRun: { id: "run-active", status: "streaming" } },
        }}
      >
        <div>ready</div>
      </OdysseyAIProvider>,
    );

    await waitFor(() => expect(resume).toHaveBeenCalledWith("thread-active", "run-active", undefined, expect.any(Function), expect.any(AbortSignal)));
    expect(adapter.load).not.toHaveBeenCalled();
  });

  it("keeps newer streamed text when the reloaded message is still empty", async () => {
    const load = vi
      .fn<ServerThreadAdapter["load"]>()
      .mockResolvedValueOnce({ headId: null, messages: [], activeRun: null })
      .mockResolvedValueOnce({
        headId: "assistant-1",
        messages: [
          { id: "user-1", role: "user", parts: [{ type: "text", text: "你好" }], status: "complete" },
          { id: "assistant-1", role: "assistant", parts: [], status: "streaming" },
        ],
        activeRun: null,
      });
    const adapter: ServerThreadAdapter = {
      load,
      start: vi.fn(async (_sessionId, _input, onEvent) => {
        onEvent({ type: "TEXT_MESSAGE_START", messageId: "assistant-1" });
        onEvent({ type: "TEXT_MESSAGE_CONTENT", messageId: "assistant-1", delta: "你好，我在。" });
        onEvent({ type: "TEXT_MESSAGE_END", messageId: "assistant-1", finishReason: "length" });
      }),
      resume: vi.fn(),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    function Probe() {
      const thread = useThreadRuntime();
      return (
        <div>
          <span>{thread.messages.flatMap((message) => message.parts.map((part) => (part.type === "text" ? part.text : ""))).join("|")}</span>
          <span>{thread.messages.find((message) => message.role === "assistant")?.finishReason}</span>
          <button type="button" onClick={() => void thread.send("你好")}>
            发送
          </button>
        </div>
      );
    }

    render(
      <OdysseyAIProvider config={{ client: createOdysseyAIClient({ endpoint: "/api/ai" }), productKey: "test", sessionId: "thread-1", threadAdapter: adapter }}>
        <Probe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(load).toHaveBeenCalledOnce());

    await act(async () => screen.getByRole("button", { name: "发送" }).click());

    expect(await screen.findByText("你好|你好，我在。")).not.toBeNull();
    expect(screen.getByText("length")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("keeps partial text and marks the assistant message when a run fails", async () => {
    const adapter: ServerThreadAdapter = {
      load: vi
        .fn()
        .mockResolvedValueOnce({ headId: null, messages: [], activeRun: null })
        .mockResolvedValue({
          headId: "assistant-1",
          messages: [{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "已经生成的内容" }], status: "error" }],
          activeRun: null,
        }),
      start: vi.fn(async (_sessionId, _input, onEvent) => {
        onEvent({ type: "RUN_STARTED", runId: "run-1" });
        onEvent({ type: "TEXT_MESSAGE_START", messageId: "assistant-1" });
        onEvent({ type: "TEXT_MESSAGE_CONTENT", messageId: "assistant-1", delta: "已经生成的内容" });
        onEvent({ type: "RUN_ERROR", message: "上游失败" });
        throw new Error("上游失败");
      }),
      resume: vi.fn(),
      cancel: vi.fn(),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    function Probe() {
      const thread = useThreadRuntime();
      const assistant = thread.messages.find((message) => message.role === "assistant");
      return (
        <div>
          <span>{assistant?.parts.map((part) => (part.type === "text" ? part.text : "")).join("")}</span>
          <span>{assistant?.status}</span>
          <button type="button" onClick={() => void thread.send("开始")}>
            发送
          </button>
        </div>
      );
    }
    render(
      <OdysseyAIProvider
        config={{ client: createOdysseyAIClient({ endpoint: "/api/ai" }), productKey: "test", sessionId: "thread-error", threadAdapter: adapter }}
      >
        <Probe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(adapter.load).toHaveBeenCalled());
    await act(async () => screen.getByRole("button", { name: "发送" }).click());
    expect(await screen.findByText("已经生成的内容")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("marks an active assistant message as stopped and cancels its run", async () => {
    let release: (() => void) | undefined;
    const adapter: ServerThreadAdapter = {
      load: vi.fn().mockResolvedValue({ headId: null, messages: [], activeRun: null }),
      start: vi.fn(
        (_sessionId, _input, onEvent) =>
          new Promise<void>((resolve) => {
            release = resolve;
            onEvent({ type: "RUN_STARTED", runId: "run-stop" });
            onEvent({ type: "TEXT_MESSAGE_START", messageId: "assistant-stop" });
          }),
      ),
      resume: vi.fn(),
      cancel: vi.fn().mockResolvedValue(undefined),
      switchBranch: vi.fn(),
      deleteSubtree: vi.fn(),
      regenerate: vi.fn(),
    };
    function Probe() {
      const thread = useThreadRuntime();
      return (
        <div>
          <span>{thread.messages.find((message) => message.role === "assistant")?.status}</span>
          <button type="button" onClick={() => void thread.send("开始")}>
            发送
          </button>
          <button type="button" onClick={thread.stop}>
            停止
          </button>
        </div>
      );
    }
    render(
      <OdysseyAIProvider
        config={{ client: createOdysseyAIClient({ endpoint: "/api/ai" }), productKey: "test", sessionId: "thread-stop", threadAdapter: adapter }}
      >
        <Probe />
      </OdysseyAIProvider>,
    );
    await waitFor(() => expect(adapter.load).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "发送" }));
    await screen.findByText("streaming");
    fireEvent.click(screen.getByRole("button", { name: "停止" }));
    expect(await screen.findByText("stopped")).toBeInTheDocument();
    expect(adapter.cancel).toHaveBeenCalledWith("thread-stop", "run-stop");
    release?.();
  });
});
