import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadRepository, ThreadRunEvent } from "../src/types";
import { adapterWith, deferred, mount, repository } from "./server-branch-ownership-fixtures";

afterEach(cleanup);

describe("server request owner late continuations", () => {
  it("does not let a late rejected delete overwrite a newer branch transition", async () => {
    const deletion = deferred<void>();
    const latestLoad = deferred<ThreadRepository>();
    const load = vi.fn(() => latestLoad.promise);
    const adapter = adapterWith({
      deleteSubtree: vi.fn(() => deletion.promise),
      load,
    });
    const view = mount(adapter);
    let old!: Promise<void>;
    let latest!: Promise<void>;

    await act(async () => {
      old = view.current().removeMessage("B");
      latest = view.current().switchBranch("C");
    });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    await act(async () => {
      deletion.reject(new Error("outdated delete failed"));
      await old;
    });
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
    await act(async () => {
      latestLoad.resolve(repository("C"));
      await latest;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(false);
  });

  it("does not reload an old run after a newer branch claims ownership", async () => {
    const oldRun = deferred<void>();
    const latestLoad = deferred<ThreadRepository>();
    const load = vi.fn(() => latestLoad.promise);
    const start = vi.fn(() => oldRun.promise);
    const view = mount(adapterWith({ start, load }));
    let run!: Promise<void>;
    let latest!: Promise<void>;

    await act(async () => {
      run = view.current().send("hello");
    });
    expect(start).toHaveBeenCalledTimes(1);
    await act(async () => {
      latest = view.current().switchBranch("C");
    });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    await act(async () => {
      oldRun.resolve();
      await run;
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(true);
    await act(async () => {
      latestLoad.resolve(repository("C"));
      await latest;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().isLoading).toBe(false);
  });

  it("does not cancel an old run after branch-switch ownership was claimed", async () => {
    const switchAck = deferred<void>();
    const resumePending = deferred<void>();
    const cancel = vi.fn(async () => {});
    const adapter = adapterWith({
      switchBranch: vi.fn(() => switchAck.promise),
      resume: vi.fn(() => resumePending.promise),
      cancel,
    });
    const view = mount(adapter, repository("B", { id: "old-run", status: "running" }));
    let switching!: Promise<void>;

    await act(async () => {
      switching = view.current().switchBranch("C");
    });
    await act(async () => {
      view.current().stop();
    });
    expect(cancel).not.toHaveBeenCalled();
    await act(async () => {
      switchAck.resolve();
      await switching;
    });
  });

  it("does cancel only the new branch run after its load is admitted", async () => {
    const resumePending = deferred<void>();
    const cancel = vi.fn(async () => {});
    const adapter = adapterWith({
      load: vi.fn(async () => repository("C", { id: "new-run", status: "running" })),
      resume: vi.fn(() => resumePending.promise),
      cancel,
    });
    const view = mount(adapter);
    await act(async () => {
      await view.current().switchBranch("C");
    });
    expect(view.current().headId).toBe("C");
    await act(async () => {
      view.current().stop();
      view.current().stop();
    });
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith("session", "new-run");
  });

  it("does not cancel the previous run after a new send claims ownership", async () => {
    const startPending = deferred<void>();
    const resumePending = deferred<void>();
    const cancel = vi.fn(async () => {});
    const adapter = adapterWith({
      start: vi.fn(() => startPending.promise),
      resume: vi.fn(() => resumePending.promise),
      cancel,
    });
    const view = mount(adapter, repository("B", { id: "old-run", status: "running" }));
    let pending!: Promise<void>;

    await act(async () => {
      pending = view.current().send("new task");
    });
    await act(async () => {
      view.current().stop();
    });
    expect(cancel).not.toHaveBeenCalled();
    await act(async () => {
      startPending.resolve();
      await pending;
    });
  });

  it("clears an earlier branch error when a new branch claims ownership", async () => {
    const firstAck = deferred<void>();
    const secondAck = deferred<void>();
    const acknowledgements = [firstAck, secondAck];
    const adapter = adapterWith({
      switchBranch: vi.fn(() => acknowledgements.shift()!.promise),
      load: vi.fn(async () => repository("C")),
    });
    const view = mount(adapter);
    let first!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
    });
    await act(async () => {
      firstAck.reject(new Error("branch A refused"));
      await first;
    });
    expect(view.current().error?.message).toBe("branch A refused");

    let second!: Promise<void>;
    await act(async () => {
      second = view.current().switchBranch("C");
    });
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      secondAck.resolve();
      await second;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().error).toBeUndefined();
  });

  it("does not reuse another branch's event cursor or event-id dedupe on resume", async () => {
    const neverFinish = new Promise<void>(() => {});
    const events = new Map<string, (event: ThreadRunEvent) => void>();
    const resume = vi.fn((_session: string, runId: string, _cursor: string | undefined, onEvent: (event: ThreadRunEvent) => void, _signal: AbortSignal) => {
      events.set(runId, onEvent);
      return neverFinish;
    });
    const adapter = adapterWith({
      resume,
      load: vi.fn(async () => repository("C", { id: "new-run", status: "running" })),
    });
    const view = mount(adapter, repository("B", { id: "old-run", status: "running" }));
    await waitFor(() => expect(resume).toHaveBeenCalledTimes(1));

    await act(async () => {
      events.get("old-run")!({ type: "TEXT_MESSAGE_START", id: "shared-event", messageId: "old-msg" });
    });
    let switching!: Promise<void>;
    await act(async () => {
      switching = view.current().switchBranch("C");
      await switching;
    });
    await waitFor(() => expect(resume).toHaveBeenCalledTimes(2));
    expect(resume.mock.calls[1]![1]).toBe("new-run");
    expect(resume.mock.calls[1]![2]).toBeUndefined();

    await act(async () => {
      events.get("new-run")!({ type: "TEXT_MESSAGE_START", id: "shared-event", messageId: "new-msg" });
    });
    expect(view.current().messages.some((message) => message.id === "new-msg")).toBe(true);
    expect(view.current().messages.some((message) => message.id === "old-msg")).toBe(false);
  });

  it("drops old branch approvals as soon as a different branch owns the request", async () => {
    const pendingSwitch = deferred<void>();
    const pendingResume = deferred<void>();
    let onOldEvent: ((event: ThreadRunEvent) => void) | undefined;
    const adapter = adapterWith({
      resume: vi.fn((_session: string, _runId: string, _cursor: string | undefined, onEvent: (event: ThreadRunEvent) => void) => {
        onOldEvent = onEvent;
        return pendingResume.promise;
      }),
      switchBranch: vi.fn(() => pendingSwitch.promise),
      load: vi.fn(async () => repository("C")),
      resolveApproval: vi.fn(async () => {}),
    });
    const view = mount(adapter, repository("B", { id: "old-run", status: "running" }));
    await waitFor(() => expect(onOldEvent).toBeDefined());
    await act(async () => {
      onOldEvent!({
        type: "APPROVAL_REQUESTED",
        id: "evt-old",
        approvalId: "approval-b",
        toolCallId: "tool-b",
        toolName: "shell",
        messageId: "B",
      });
    });
    expect(view.current().approvals.map((item) => item.id)).toEqual(["approval-b"]);
    let switching!: Promise<void>;
    await act(async () => {
      switching = view.current().switchBranch("C");
    });
    expect(view.current().approvals).toEqual([]);
    await act(async () => {
      onOldEvent!({
        type: "APPROVAL_REQUESTED",
        id: "evt-too-late",
        approvalId: "late-b",
        toolCallId: "tool-late",
        toolName: "shell",
        messageId: "B",
      });
    });
    expect(view.current().approvals).toEqual([]);
    await act(async () => {
      pendingSwitch.resolve();
      await switching;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().approvals).toEqual([]);
    expect(adapter.resolveApproval).not.toHaveBeenCalled();
  });

  it("stop discards approvals from the cancelled run", async () => {
    const pending = deferred<void>();
    let sendEvent: ((event: ThreadRunEvent) => void) | undefined;
    const adapter = adapterWith({
      resume: vi.fn((_session: string, _run: string, _cursor: string | undefined, onEvent: (event: ThreadRunEvent) => void) => {
        sendEvent = onEvent;
        return pending.promise;
      }),
      resolveApproval: vi.fn(async () => {}),
    });
    const view = mount(adapter, repository("B", { id: "running-b", status: "running" }));
    await waitFor(() => expect(sendEvent).toBeDefined());
    await act(async () => {
      sendEvent!({ type: "APPROVAL_REQUESTED", id: "approval-event", approvalId: "approval-b", toolCallId: "tool-b", toolName: "shell" });
    });
    expect(view.current().approvals).toHaveLength(1);
    await act(async () => {
      view.current().stop();
    });
    expect(view.current().approvals).toEqual([]);
    await act(async () => {
      sendEvent!({ type: "APPROVAL_REQUESTED", id: "late-approval", approvalId: "too-late", toolCallId: "late-tool", toolName: "shell" });
    });
    expect(view.current().approvals).toEqual([]);
    expect(adapter.resolveApproval).not.toHaveBeenCalled();
  });
});
