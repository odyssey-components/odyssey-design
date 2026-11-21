import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ThreadRepository } from "../src/types";
import { adapterWith, deferred, mount, repository } from "./server-branch-ownership-fixtures";

afterEach(cleanup);

describe("server request owner late completions", () => {
  it("ignores stale load rejection and finally while the newer branch is still loading", async () => {
    const loads: Array<{ signal: AbortSignal; reply: ReturnType<typeof deferred<ThreadRepository>> }> = [];
    const adapter = adapterWith({
      load: vi.fn((_session, signal) => {
        const reply = deferred<ThreadRepository>();
        loads.push({ signal, reply });
        return reply.promise; // deliberately ignores AbortSignal
      }),
    });
    const view = mount(adapter);
    let old!: Promise<void>;
    let latest!: Promise<void>;

    await act(async () => {
      old = view.current().switchBranch("A");
    });
    await waitFor(() => expect(loads).toHaveLength(1));
    await act(async () => {
      latest = view.current().switchBranch("C");
    });
    await waitFor(() => expect(loads).toHaveLength(2));
    expect(loads[0]!.signal.aborted).toBe(true);
    expect(view.current().isLoading).toBe(true);

    await act(async () => {
      loads[0]!.reply.reject(new Error("obsolete load failed"));
      await old;
    });
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(true);
    expect(view.current().headId).toBe("B");

    await act(async () => {
      loads[1]!.reply.resolve(repository("C"));
      await latest;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().messages[0]?.id).toBe("C");
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(false);
  });

  it("ignores a stale switch rejection while the newer acknowledged branch is loading", async () => {
    const acknowledgements: Array<ReturnType<typeof deferred<void>>> = [];
    const load = deferred<ThreadRepository>();
    const loader = vi.fn(() => load.promise);
    const adapter = adapterWith({
      switchBranch: vi.fn(() => {
        const reply = deferred<void>();
        acknowledgements.push(reply);
        return reply.promise;
      }),
      load: loader,
    });
    const view = mount(adapter);
    let old!: Promise<void>;
    let latest!: Promise<void>;

    await act(async () => {
      old = view.current().switchBranch("A");
      latest = view.current().switchBranch("C");
    });
    expect(acknowledgements).toHaveLength(2);
    await act(async () => {
      acknowledgements[1]!.resolve();
    });
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(1));
    expect(view.current().isLoading).toBe(true);

    await act(async () => {
      acknowledgements[0]!.reject(new Error("older switch refused"));
      await old;
    });
    expect(loader).toHaveBeenCalledTimes(1);
    expect(view.current().error).toBeUndefined();
    expect(view.current().isLoading).toBe(true);

    await act(async () => {
      load.resolve(repository("C"));
      await latest;
    });
    expect(view.current().headId).toBe("C");
    expect(view.current().isLoading).toBe(false);
  });

  it("settles the current rejected switch without launching a load", async () => {
    const rejected = deferred<void>();
    const loader = vi.fn(async () => repository("A"));
    const adapter = adapterWith({
      switchBranch: vi.fn(() => rejected.promise),
      load: loader,
    });
    const view = mount(adapter);
    let pending!: Promise<void>;
    await act(async () => {
      pending = view.current().switchBranch("A");
    });
    expect(view.current().isLoading).toBe(true);
    await act(async () => {
      rejected.reject(new Error("current switch refused"));
      await pending;
    });
    expect(loader).not.toHaveBeenCalled();
    expect(view.current().error?.message).toBe("current switch refused");
    expect(view.current().isLoading).toBe(false);
    expect(view.current().headId).toBe("B");
  });

  it("does not resume a run from a load resolved after unmount", async () => {
    const delayed = deferred<ThreadRepository>();
    const resume = vi.fn(async () => {});
    const adapter = adapterWith({
      load: vi.fn(() => delayed.promise),
      resume,
    });
    const view = mount(adapter);
    let pending!: Promise<void>;
    await act(async () => {
      pending = view.current().switchBranch("A");
    });
    await act(async () => {
      view.unmount();
    });
    await act(async () => {
      delayed.resolve(repository("A", { id: "old-run", status: "running" }));
      await pending;
    });
    expect(resume).not.toHaveBeenCalled();
  });
});
