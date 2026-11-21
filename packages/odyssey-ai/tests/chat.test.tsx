import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AIComposerAttachment, AIComposerAttachments, AIComposerInput, AIComposer, AIComposerSend } from "@odyssey/ui/ai/composer";
import { AIMessageAction, AIMessageActions, AIMessageBranchPicker, AIMessagePart, AIMessage } from "@odyssey/ui/ai/message";
import { OdysseyAIRuntimeProvider } from "../src/react";
import { createOdysseyAIRuntime } from "../src/runtime";
import { AIThread, AIThreadViewport } from "@odyssey/ui/ai/thread";

afterEach(cleanup);

describe("chat anatomy", () => {
  it("renders stable text messages", () => {
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime()}>
        <AIThread>
          <AIMessage message={{ id: "one", role: "assistant", parts: [{ type: "text", text: "Hello Odyssey" }] }} />
        </AIThread>
      </OdysseyAIRuntimeProvider>,
    );
    expect(screen.getByText("Hello Odyssey")).toBeInTheDocument();
    expect(screen.getByText("Hello Odyssey").parentElement).toHaveAttribute("data-od-slot", "ai-message-parts");
  });

  it("exposes message progress and terminal states", () => {
    const runtime = createOdysseyAIRuntime();
    const { rerender } = render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AIMessage message={{ id: "run", role: "assistant", parts: [{ type: "text", text: "" }], status: "streaming" }} />
      </OdysseyAIRuntimeProvider>,
    );
    expect(within(screen.getByText("正在生成…").parentElement as HTMLElement).getByText("正在生成…")).toBeInTheDocument();
    rerender(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AIMessage message={{ id: "run", role: "assistant", parts: [{ type: "text", text: "部分回复" }], status: "error" }} />
      </OdysseyAIRuntimeProvider>,
    );
    expect(screen.getByText("部分回复")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("生成失败");
    rerender(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AIMessage message={{ id: "run", role: "assistant", parts: [{ type: "text", text: "截断回复" }], status: "complete", finishReason: "length" }} />
      </OdysseyAIRuntimeProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("回复达到输出上限，内容可能不完整");
  });

  it("accepts dropped and pasted files through one composer contract", () => {
    const onFiles = vi.fn();
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime()}>
        <AIComposer onFiles={onFiles}>
          <AIComposerInput onFiles={onFiles} />
        </AIComposer>
      </OdysseyAIRuntimeProvider>,
    );
    const file = new File(["hello"], "brief.txt", { type: "text/plain" });
    const textbox = screen.getByRole("textbox");
    const form = textbox.closest("form") as HTMLFormElement;
    expect(textbox.style.height).not.toBe("");
    fireEvent.dragEnter(form, { dataTransfer: { types: ["Files"], files: [file] } });
    expect(form).toHaveAttribute("data-drop-active", "true");
    fireEvent.drop(form, { dataTransfer: { types: ["Files"], files: [file] } });
    fireEvent.paste(textbox, { clipboardData: { files: [file] } });
    expect(onFiles).toHaveBeenCalledTimes(2);
    expect(onFiles).toHaveBeenLastCalledWith([file]);
  });

  it("starts at one row and caps visual growth without truncating input", () => {
    const { rerender } = render(
      <AIComposer>
        <AIComposerInput maxRows={2} value="" onChange={() => undefined} />
      </AIComposer>,
    );
    const textbox = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textbox).toHaveAttribute("rows", "1");
    Object.defineProperty(textbox, "scrollHeight", { configurable: true, value: 200 });
    rerender(
      <AIComposer>
        <AIComposerInput maxRows={2} value={"第一行\n第二行\n第三行"} onChange={() => undefined} />
      </AIComposer>,
    );
    expect(textbox).toHaveValue("第一行\n第二行\n第三行");
    expect(textbox.style.height).toBe("40px");
    expect(textbox.style.overflowY).toBe("auto");
  });

  it("uses an accessible icon send action and allows callers to enable attachment-only sending", () => {
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime()}>
        <AIComposer>
          <AIComposerSend disabled={false} />
        </AIComposer>
      </OdysseyAIRuntimeProvider>,
    );
    const send = screen.getByRole("button", { name: "发送" });
    expect(send).toBeEnabled();
    expect(send).toHaveAttribute("data-variant", "solid");
    expect(send).toHaveTextContent("");
    expect(send.querySelector("svg")).toBeInTheDocument();
  });

  it("allows an explicit send variant to override the primary default", () => {
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime()}>
        <AIComposerSend disabled={false} variant="ghost" />
      </OdysseyAIRuntimeProvider>,
    );
    expect(screen.getByRole("button", { name: "发送" })).toHaveAttribute("data-variant", "ghost");
  });

  it("degrades unknown parts without executing them", () => {
    render(<AIMessagePart part={{ type: "unknown", originalType: "future-widget", value: { unsafe: true } }} />);
    expect(screen.getByText("暂不支持的内容：future-widget")).toHaveAttribute("data-unknown-part", "future-widget");
  });

  it("renders composable message actions and attachment states", () => {
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime()}>
        <AIThread>
          <AIMessage message={{ id: "one", role: "user", parts: [{ type: "text", text: "hello" }] }}>
            <AIMessageActions>
              <span>actions</span>
              <AIMessageAction label="Default action">default</AIMessageAction>
              <AIMessageAction label="Emphasized action" variant="soft">
                emphasized
              </AIMessageAction>
            </AIMessageActions>
          </AIMessage>
          <AIComposer>
            <AIComposerAttachments>
              <AIComposerAttachment attachment={{ id: "file", name: "brief.pdf", status: "uploading" }} />
            </AIComposerAttachments>
          </AIComposer>
        </AIThread>
      </OdysseyAIRuntimeProvider>,
    );
    expect(screen.getByText("actions").closest('[data-od-slot="ai-message-actions"]')).toHaveAttribute("data-od-slot", "ai-message-actions");
    expect(screen.getByRole("button", { name: "Default action" })).toHaveAttribute("data-variant", "ghost");
    expect(screen.getByRole("button", { name: "Emphasized action" })).toHaveAttribute("data-variant", "soft");
    expect(screen.getByText("brief.pdf").closest('[data-od-slot="ai-composer-attachments"]')).toHaveAttribute("data-od-slot", "ai-composer-attachments");
    expect(screen.getByText("brief.pdf").closest('[data-od-slot="ai-composer-attachment"]')).toHaveAttribute("data-status", "uploading");
  });

  it("switches between message branches through accessible controls", () => {
    const message = {
      id: "version-1",
      role: "assistant" as const,
      parts: [{ type: "text" as const, text: "first" }],
      branches: [
        { id: "version-1", sequence: 1 },
        { id: "version-2", sequence: 2 },
      ],
    };
    const switchBranch = vi.fn(async () => undefined);
    render(<AIMessageBranchPicker message={message} onSwitch={switchBranch} />);
    expect(screen.getByRole("group", { name: "消息版本" })).toHaveTextContent("1 / 2");
    fireEvent.click(screen.getByRole("button", { name: "下一个版本" }));
    expect(switchBranch).toHaveBeenCalledWith("version-2");
  });

  it("reports tool approval decisions through controlled callbacks", () => {
    const approve = vi.fn();
    const reject = vi.fn();
    render(
      <AIMessagePart
        part={{ type: "tool-call", id: "tool-1", name: "write_file", input: { path: "README.md" }, state: "approval-required", approvalId: "approval-1" }}
        onApprove={approve}
        onReject={reject}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "允许" }));
    fireEvent.click(screen.getByRole("button", { name: "拒绝" }));
    expect(approve).toHaveBeenCalledWith("approval-1");
    expect(reject).toHaveBeenCalledWith("approval-1");
  });

  it("smoothly returns to the bottom without hiding the control before scrolling", () => {
    const runtime = createOdysseyAIRuntime({ ...createOdysseyAIRuntime().getSnapshot().thread, messages: [] });
    const { container } = render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AIThreadViewport>messages</AIThreadViewport>
      </OdysseyAIRuntimeProvider>,
    );
    const viewport = container.querySelector('[data-od-slot="ai-thread-viewport"]') as HTMLDivElement;
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 300 },
      scrollTop: { configurable: true, writable: true, value: 0 },
    });
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;
    fireEvent.scroll(viewport);
    const jumpButton = screen.getByRole("button", { name: "回到底部" });
    expect(jumpButton).not.toHaveTextContent("回到底部");
    fireEvent.click(jumpButton);

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1000, behavior: "smooth" }));
    expect(screen.getByRole("button", { name: "回到底部" })).toBeInTheDocument();
    viewport.scrollTop = 700;
    fireEvent.scroll(viewport);
    expect(screen.queryByRole("button", { name: "回到底部" })).not.toBeInTheDocument();
  });
});
