import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadRunEvent } from "../src/types";
import { adapterWith, deferred, mount, repository } from "./server-branch-ownership-fixtures";

afterEach(cleanup);

function fixture(resolveApproval: (session: string, id: string, approved: boolean) => Promise<void>) {
  const events = new Map<string, (event: ThreadRunEvent) => void>();
  const adapter = adapterWith({
    load: vi.fn(async () => repository("C", { id: "run-c", status: "running" })),
    resume: vi.fn((_session: string, run: string, _cursor: string | undefined, onEvent: (event: ThreadRunEvent) => void) => {
      events.set(run, onEvent);
      return new Promise<void>(() => {});
    }),
    resolveApproval,
  });
  const view = mount(adapter, repository("B", { id: "run-b", status: "running" }));
  const request = async (run: string) => {
    await waitFor(() => expect(events.has(run)).toBe(true));
    await act(async () => {
      events.get(run)!({
        type: "APPROVAL_REQUESTED",
        id: "event-" + run,
        approvalId: "same-id",
        toolCallId: "tool-" + run,
        toolName: "shell",
      });
    });
  };
  return { view, request };
}

describe("approval actions keep request ownership", () => {
  it("rejects retained actions after a branch switch and after Stop", async () => {
    const resolve = vi.fn(async () => {});
    const { view, request } = fixture(resolve);
    await request("run-b");
    const approveOld = view.current().approve;
    const rejectOld = view.current().reject;
    await act(async () => {
      await view.current().switchBranch("C");
    });
    await request("run-c");
    await act(async () => {
      await approveOld("same-id");
      await rejectOld("same-id");
    });
    expect(resolve).not.toHaveBeenCalled();
    expect(view.current().approvals[0]?.toolCallId).toBe("tool-run-c");

    const approveCurrent = view.current().approve;
    await act(async () => {
      await approveCurrent("unknown-id");
    });
    expect(resolve).not.toHaveBeenCalled();
    await act(async () => {
      await approveCurrent("same-id");
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith("session", "same-id", true);

    await request("run-c");
    await act(async () => {
      view.current().stop();
      await approveCurrent("same-id");
    });
    expect(resolve).toHaveBeenCalledTimes(1);
  });

  it("a late approval acknowledgement cannot remove a successor approval", async () => {
    const acknowledgement = deferred<void>();
    const resolve = vi.fn(() => acknowledgement.promise);
    const { view, request } = fixture(resolve);
    await request("run-b");
    let old!: Promise<void>;
    await act(async () => {
      old = view.current().approve("same-id");
    });
    expect(resolve).toHaveBeenCalledTimes(1);
    await act(async () => {
      await view.current().switchBranch("C");
    });
    await request("run-c");
    await act(async () => {
      acknowledgement.resolve();
      await old;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().approvals).toHaveLength(1);
    expect(view.current().approvals[0]?.toolCallId).toBe("tool-run-c");
  });
});
