import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { controlledAdapter, deferred, mount, repository } from "./helpers/server-owner";

afterEach(cleanup);

describe("current server request ownership settlement", () => {
  it("does not let stale load error/finally settle the newer pending load", async () => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter);
    let first!: Promise<void>, second!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
    });
    await act(async () => {
      second = view.current().switchBranch("C");
    });
    expect(fake.loads).toHaveLength(2);
    expect(fake.loads[0]!.signal.aborted).toBe(true);

    await act(async () => {
      fake.loads[0]!.reply.reject(new Error("old load"));
      await first;
    });
    expect(view.current().headId).toBe("B");
    expect(view.current().hydrated).toBe(true);
    expect(view.current().isLoading).toBe(true);
    expect(view.current().error).toBeUndefined();

    const currentError = new Error("current load");
    await act(async () => {
      fake.loads[1]!.reply.reject(currentError);
      await second;
    });
    expect(view.current().headId).toBe("B");
    expect(view.current().error).toBe(currentError);
    expect(view.current().isLoading).toBe(false);
  });

  it.each(["success", "error"] as const)("preserves the current load failure after stale %s", async (outcome) => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter);
    let first!: Promise<void>, second!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
    });
    await act(async () => {
      second = view.current().switchBranch("C");
    });
    const currentError = new Error("C failed");
    await act(async () => {
      fake.loads[1]!.reply.reject(currentError);
      await second;
    });
    await act(async () => {
      if (outcome === "success") fake.loads[0]!.reply.resolve(repository("A", "run-A"));
      else fake.loads[0]!.reply.reject(new Error("A failed later"));
      await first;
    });
    expect(view.current().headId).toBe("B");
    expect(view.current().messages.map((message) => message.id)).toEqual(["B"]);
    expect(view.current().error).toBe(currentError);
    expect(view.current().isLoading).toBe(false);
    expect(fake.resumes).toHaveLength(0);
  });

  it("cancels only the newest branch run after a stale activeRun load and event", async () => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter, repository("B", "run-B"));
    expect(fake.resumes).toHaveLength(1);
    let first!: Promise<void>, second!: Promise<void>;
    await act(async () => {
      first = view.current().switchBranch("A");
    });
    await act(async () => {
      second = view.current().switchBranch("C");
    });
    await act(async () => {
      fake.loads[1]!.reply.resolve(repository("C", "run-C"));
      await second;
    });
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("A", "run-A"));
      fake.resumes[0]!.onEvent({ type: "RUN_ERROR", runId: "run-B", message: "old run" });
      await first;
    });
    expect(fake.resumes.map((resume) => resume.runId)).toEqual(["run-B", "run-C"]);
    expect(view.current().headId).toBe("C");
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      view.current().stop();
    });
    expect(fake.adapter.cancel).toHaveBeenCalledTimes(1);
    expect(fake.adapter.cancel).toHaveBeenCalledWith("session", "run-C");
    expect(fake.resumes.every((resume) => resume.signal.aborted)).toBe(true);
  });

  it.each(["success", "error"] as const)("ignores late initial-resume %s while the new load is pending", async (outcome) => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter, repository("B", "run-B"));
    let current!: Promise<void>;
    await act(async () => {
      current = view.current().switchBranch("C");
    });
    await act(async () => {
      if (outcome === "success") fake.resumes[0]!.reply.resolve();
      else fake.resumes[0]!.reply.reject(new Error("stale resume"));
    });
    expect(fake.resumes[0]!.signal.aborted).toBe(true);
    expect(fake.loads).toHaveLength(1);
    expect(view.current().headId).toBe("B");
    expect(view.current().isLoading).toBe(true);
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("C"));
      await current;
    });
    expect(view.current().headId).toBe("C");
  });

  it.each([
    ["start", "success"],
    ["start", "error"],
    ["regenerate", "success"],
    ["regenerate", "error"],
  ] as const)("ignores late %s %s and its events after a new branch intent", async (kind, outcome) => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter);
    let old!: Promise<void>, current!: Promise<void>;
    await act(async () => {
      old = kind === "start" ? view.current().send("hello") : view.current().regenerate();
    });
    const stream = (kind === "start" ? fake.starts : fake.regenerations)[0]!;
    await act(async () => {
      current = view.current().switchBranch("C");
    });
    await act(async () => {
      stream.onEvent({ type: "RUN_ERROR", runId: "obsolete-run", message: "obsolete event" });
      if (outcome === "success") stream.reply.resolve();
      else stream.reply.reject(new Error("obsolete continuation"));
      await old;
    });
    expect(stream.signal.aborted).toBe(true);
    expect(fake.loads).toHaveLength(1);
    expect(view.current().headId).toBe("B");
    expect(view.current().isLoading).toBe(true);
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("C"));
      await current;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().isLoading).toBe(false);
  });

  it("does not let a late delete acknowledgement start a load or settle a newer load", async () => {
    const fake = controlledAdapter(),
      ack = deferred<void>(),
      view = mount(fake.adapter);
    fake.adapter.deleteSubtree.mockImplementation(() => ack.promise);
    let old!: Promise<void>, current!: Promise<void>;
    await act(async () => {
      old = view.current().removeMessage("B");
    });
    await act(async () => {
      current = view.current().switchBranch("C");
    });
    await act(async () => {
      ack.resolve();
      await old;
    });
    expect(fake.loads).toHaveLength(1);
    expect(view.current().isLoading).toBe(true);
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("C"));
      await current;
    });
    expect(view.current().headId).toBe("C");
  });

  it("does not resume a run returned by a load after unmount", async () => {
    const fake = controlledAdapter(),
      view = mount(fake.adapter, null);
    await waitFor(() => expect(fake.loads).toHaveLength(1));
    view.unmount();
    expect(fake.loads[0]!.signal.aborted).toBe(true);
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("A", "run-after-unmount"));
    });
    expect(fake.adapter.resume).not.toHaveBeenCalled();
    expect(fake.adapter.load).toHaveBeenCalledTimes(1);
  });

  it.each(["switch", "delete"] as const)("settles the current %s acknowledgement rejection", async (kind) => {
    const fake = controlledAdapter(),
      ack = deferred<void>(),
      view = mount(fake.adapter);
    if (kind === "switch") fake.adapter.switchBranch.mockImplementation(() => ack.promise);
    else fake.adapter.deleteSubtree.mockImplementation(() => ack.promise);
    let operation!: Promise<void>;
    await act(async () => {
      operation = kind === "switch" ? view.current().switchBranch("A") : view.current().removeMessage("B");
    });
    expect(view.current().isLoading).toBe(true);
    const failure = new Error("current acknowledgement refused");
    await act(async () => {
      ack.reject(failure);
      await operation;
    });
    expect(view.current().headId).toBe("B");
    expect(view.current().error).toBe(failure);
    expect(view.current().status).toBe("error");
    expect(view.current().isLoading).toBe(false);
    expect(fake.loads).toHaveLength(0);
  });

  it.each(["switch", "delete"] as const)("isolates a stale %s acknowledgement rejection", async (kind) => {
    const fake = controlledAdapter(),
      ack = deferred<void>(),
      view = mount(fake.adapter);
    if (kind === "switch") {
      fake.adapter.switchBranch.mockImplementation((_session, head) => (head === "A" ? ack.promise : Promise.resolve()));
    } else fake.adapter.deleteSubtree.mockImplementation(() => ack.promise);
    let old!: Promise<void>, current!: Promise<void>;
    await act(async () => {
      old = kind === "switch" ? view.current().switchBranch("A") : view.current().removeMessage("B");
    });
    await act(async () => {
      current = view.current().switchBranch("C");
    });
    await act(async () => {
      ack.reject(new Error("obsolete acknowledgement"));
      await old;
    });
    expect(fake.loads).toHaveLength(1);
    expect(view.current().headId).toBe("B");
    expect(view.current().isLoading).toBe(true);
    expect(view.current().error).toBeUndefined();
    await act(async () => {
      fake.loads[0]!.reply.resolve(repository("C"));
      await current;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().isLoading).toBe(false);
  });
});
