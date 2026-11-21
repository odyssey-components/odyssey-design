import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantWorkspace } from "../src/assistant";
import { AIComposerInput, AIComposer } from "@odyssey/ui/ai/composer";
import { OdysseyAIRuntimeProvider } from "../src/react";
import { createOdysseyAIRuntime } from "../src/runtime";

afterEach(cleanup);

function renderAssistant() {
  const thread = {
    ...createOdysseyAIRuntime().getSnapshot().thread,
    sessionId: "ime-test",
    hydrated: true,
    input: "尚未发送的草稿",
    setInput: vi.fn(),
    send: vi.fn(async () => undefined),
  };
  render(
    <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
      <AssistantWorkspace options={{ composer: {} }} />
    </OdysseyAIRuntimeProvider>,
  );
  return { thread, input: screen.getByRole("textbox", { name: "消息" }) };
}

describe("AIComposerInput IME submission", () => {
  it("keeps the draft while confirming a composed word, then sends on the next ordinary Enter", async () => {
    const { thread, input } = renderAssistant();
    fireEvent.compositionStart(input);
    const nativeDefaultAllowed = fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(thread.send).not.toHaveBeenCalled();
    expect(nativeDefaultAllowed).toBe(true);
    expect(thread.setInput).not.toHaveBeenCalled();
    expect(input).toHaveValue("尚未发送的草稿");
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(thread.send).toHaveBeenCalledExactlyOnceWith("尚未发送的草稿", { attachmentIds: [] }));
  });

  it("honors an active composition session even when this key event omits the native flag", () => {
    const { thread, input } = renderAssistant();
    fireEvent.compositionStart(input);
    const nativeDefaultAllowed = fireEvent.keyDown(input, { key: "Enter", isComposing: false });
    expect(thread.send).not.toHaveBeenCalled();
    expect(nativeDefaultAllowed).toBe(true);
    expect(input).toHaveValue("尚未发送的草稿");
  });

  it("honors the native composing flag without a preceding compositionstart", () => {
    const { thread, input } = renderAssistant();
    const nativeDefaultAllowed = fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(thread.send).not.toHaveBeenCalled();
    expect(nativeDefaultAllowed).toBe(true);
  });

  it("keeps Shift+Enter available for a newline", () => {
    const { thread, input } = renderAssistant();
    expect(fireEvent.keyDown(input, { key: "Enter", shiftKey: true })).toBe(true);
    expect(thread.send).not.toHaveBeenCalled();
  });

  it("keeps the caller's preventDefault ahead of automatic submission", () => {
    const submit = vi.fn();
    const keyDown = vi.fn((event: React.KeyboardEvent<HTMLTextAreaElement>) => event.preventDefault());
    render(
      <AIComposer onSubmit={submit}>
        <AIComposerInput defaultValue="draft" onKeyDown={keyDown} />
      </AIComposer>,
    );
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(keyDown).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it("forwards composition callbacks and releases the guard on compositionend", () => {
    const submit = vi.fn();
    const start = vi.fn();
    const end = vi.fn();
    render(
      <AIComposer onSubmit={submit}>
        <AIComposerInput defaultValue="draft" onCompositionStart={start} onCompositionEnd={end} />
      </AIComposer>,
    );
    const input = screen.getByRole("textbox");
    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(submit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(start).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledOnce();
    expect(submit).toHaveBeenCalledOnce();
  });
});
