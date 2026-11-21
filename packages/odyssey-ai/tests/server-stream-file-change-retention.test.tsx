import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { controlledAdapter, mount } from "./helpers/server-owner";

afterEach(cleanup);

describe("server stream file-change retention", () => {
  it("preserves the file-change part when text arrives before the resume stream settles", async () => {
    const fixture = controlledAdapter();
    const view = mount(fixture.adapter, {
      headId: null,
      messages: [],
      activeRun: { id: "run-1", status: "streaming" },
    });
    await waitFor(() => expect(fixture.resumes).toHaveLength(1));
    const stream = fixture.resumes[0]!;

    try {
      act(() => {
        stream.onEvent({ type: "TEXT_MESSAGE_START", id: "start-1", runId: "run-1", messageId: "message-1" });
        stream.onEvent({
          type: "FILE_CHANGE",
          id: "file-1",
          runId: "run-1",
          messageId: "message-1",
          path: "src/example.ts",
          change: "modified",
          summary: "Updated example",
        });
      });
      const before = view.current().messages.find((message) => message.id === "message-1");
      expect(before?.parts).toEqual([
        { type: "text", text: "" },
        { type: "data", name: "file-change", value: { path: "src/example.ts", change: "modified", summary: "Updated example" } },
      ]);
      const fileChange = before?.parts[1];

      act(() => {
        stream.onEvent({ type: "TEXT_MESSAGE_CONTENT", id: "text-1", runId: "run-1", messageId: "message-1", delta: "Applied" });
      });

      const after = view.current().messages.find((message) => message.id === "message-1");
      expect(after?.parts).toEqual([
        { type: "text", text: "Applied" },
        { type: "data", name: "file-change", value: { path: "src/example.ts", change: "modified", summary: "Updated example" } },
      ]);
      expect(after?.parts[1]).toBe(fileChange);
      expect(before?.parts[0]).toEqual({ type: "text", text: "" });
      expect(after?.status).toBe("streaming");
      expect(view.current().isLoading).toBe(true);
      expect(view.current().error).toBeUndefined();
      expect(stream.signal.aborted).toBe(false);
      expect(fixture.adapter.load).not.toHaveBeenCalled();
      expect(fixture.adapter.cancel).not.toHaveBeenCalled();
    } finally {
      // Only settle after unmount, so no reload can repair the assertion state.
      view.unmount();
      await act(async () => {
        stream.reply.resolve();
        await stream.reply.promise;
      });
    }
  });
});
