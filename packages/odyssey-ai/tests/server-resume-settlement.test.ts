import { describe, expect, it, vi } from "vitest";
import { settleServerResume } from "../src/server-resume";

describe("server resume settlement", () => {
  it("reports a failed resume without reloading the same active run", async () => {
    const reload = vi.fn(async () => undefined);
    const setError = vi.fn();
    const setLoading = vi.fn();
    const controller = new AbortController();

    await settleServerResume(Promise.reject(new Error("resume unavailable")), controller.signal, reload, setError, setLoading);

    expect(reload).not.toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith(expect.objectContaining({ message: "resume unavailable" }));
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("reloads once after a successful resume", async () => {
    const reload = vi.fn(async () => undefined);
    const setError = vi.fn();
    const setLoading = vi.fn();

    await settleServerResume(Promise.resolve(), new AbortController().signal, reload, setError, setLoading);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(setError).not.toHaveBeenCalled();
  });

  it("ignores completion after cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    const reload = vi.fn(async () => undefined);
    const setError = vi.fn();
    const setLoading = vi.fn();

    await settleServerResume(Promise.reject(new Error("late")), controller.signal, reload, setError, setLoading);

    expect(reload).not.toHaveBeenCalled();
    expect(setError).not.toHaveBeenCalled();
    expect(setLoading).not.toHaveBeenCalled();
  });
});
