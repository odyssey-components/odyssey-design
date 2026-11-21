import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AssistantWorkspace } from "../src/assistant";
import { OdysseyAIRuntimeProvider } from "../src/react";
import { createOdysseyAIRuntime } from "../src/runtime";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function createThread(overrides: Record<string, unknown> = {}) {
  const base = createOdysseyAIRuntime().getSnapshot().thread;
  return {
    ...base,
    sessionId: "conversation-1",
    hydrated: true,
    input: "请总结",
    setInput: vi.fn(),
    send: vi.fn(async () => undefined),
    removeMessage: vi.fn(async () => undefined),
    regenerate: vi.fn(async () => undefined),
    switchBranch: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe("AssistantWorkspace", () => {
  it("shows hydration progress instead of the welcome state", () => {
    const thread = createThread({ hydrated: false, messages: [] });
    const runtime = createOdysseyAIRuntime(thread);
    render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AssistantWorkspace options={{ welcome: { title: "欢迎页面" } }} />
      </OdysseyAIRuntimeProvider>,
    );

    expect(screen.getByText("正在加载消息…")).toBeInTheDocument();
    expect(screen.queryByText("欢迎页面")).not.toBeInTheDocument();
    act(() => runtime.update({ ...thread, hydrated: true }));
    expect(screen.getByText("欢迎页面")).toBeInTheDocument();
  });

  it("composes model selection, attachment upload and sending", async () => {
    const user = userEvent.setup();
    const thread = createThread();
    const runtime = createOdysseyAIRuntime(thread);
    const onModelChange = vi.fn();
    const upload = vi.fn(async (file: File) => ({ id: "attachment-1", name: file.name, status: "ready" as const }));
    render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AssistantWorkspace
          options={{
            composer: {
              attachments: { adapter: { upload } },
              modelSelector: {
                options: [
                  { id: "local", label: "Local Qwen" },
                  { id: "cloud", label: "Cloud model" },
                ],
                value: "local",
                onChange: onModelChange,
              },
            },
          }}
        />
      </OdysseyAIRuntimeProvider>,
    );

    await user.click(screen.getByRole("combobox", { name: "模型" }));
    await user.click(await screen.findByRole("option", { name: "Cloud model" }));
    expect(onModelChange).toHaveBeenCalledWith("cloud");

    const file = new File(["hello"], "brief.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("添加附件"), { target: { files: [file] } });
    await waitFor(() => expect(upload).toHaveBeenCalled());
    expect(await screen.findByText("brief.txt")).toBeInTheDocument();
    expect(upload).toHaveBeenCalledWith(file, expect.objectContaining({ sessionId: "conversation-1" }));
    fireEvent.click(screen.getByRole("button", { name: "发送" }));
    await waitFor(() => expect(thread.send).toHaveBeenCalledWith("请总结", { attachmentIds: ["attachment-1"] }));
  });

  it("keeps message actions and delete confirmation inside the precomposed workspace", async () => {
    const thread = createThread({
      input: "",
      messages: [{ id: "assistant-1", role: "assistant", parts: [{ type: "text", text: "回答" }], status: "complete" }],
    });
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    expect(screen.getByRole("button", { name: "复制消息" })).toHaveAttribute("data-variant", "ghost");
    fireEvent.click(screen.getByRole("button", { name: "删除消息" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("删除这条消息？");
    fireEvent.click(within(dialog).getByRole("button", { name: "删除消息" }));
    await waitFor(() => expect(thread.removeMessage).toHaveBeenCalledWith("assistant-1"));
  });

  it("keeps the assistant action rail mounted while generation completes", () => {
    const pending = createThread({
      isLoading: true,
      messages: [{ id: "assistant-pending", role: "assistant", parts: [{ type: "text", text: "正在回答" }], status: "streaming" }],
    });
    const runtime = createOdysseyAIRuntime(pending);
    render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    const rail = document.querySelector('[data-od-slot="ai-message-actions"]');
    const regenerate = document.querySelector<HTMLButtonElement>('[data-action="regenerate"]');
    expect(regenerate).not.toBeNull();
    expect(regenerate).toBeDisabled();
    expect(regenerate).toHaveAttribute("data-unavailable", "true");

    act(() =>
      runtime.update({
        ...pending,
        isLoading: false,
        messages: [{ id: "assistant-pending", role: "assistant", parts: [{ type: "text", text: "回答完成" }], status: "complete" }],
      }),
    );
    expect(document.querySelector('[data-od-slot="ai-message-actions"]')).toBe(rail);
    expect(screen.getByRole("button", { name: "重新生成" })).toBeEnabled();
  });

  it("renders GFM markdown with syntax highlighting in the default workspace without rendering raw HTML", async () => {
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const thread = createThread({
      input: "",
      messages: [
        {
          id: "assistant-markdown",
          role: "assistant",
          status: "complete",
          parts: [
            {
              type: "text",
              text: "# 标题\n\n- [x] 已完成\n- **重点**\n\n> 引用\n\n[Odyssey](https://example.com/very/long/path)\n\n| 名称 | 值 |\n| --- | --- |\n| Odyssey | AI |\n\n`inline`\n\n```ts\nconst answer = 42;\n```\n\n```markdown\n# 围栏标题\n```\n\n<script>unsafe()</script>\n\n**流式未闭合",
            },
          ],
        },
      ],
    });
    const { container } = render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    expect(screen.getByRole("heading", { name: "标题" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "" })).toBeChecked();
    expect(screen.getByText("重点").tagName).toBe("STRONG");
    expect(screen.getByText("引用").closest("blockquote")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Odyssey" })).toHaveAttribute("href", "https://example.com/very/long/path");
    expect(screen.getByRole("table")).toHaveTextContent("Odyssey");
    expect(screen.getByText("inline").tagName).toBe("CODE");
    expect(screen.getByText("const answer = 42;").closest("pre")).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector('[data-od-slot="ai-code-block"] [data-highlighted="true"]')).toBeInTheDocument());
    const highlightedToken = container.querySelector<HTMLElement>('[data-od-slot="ai-code-block"] .shiki-token');
    expect(highlightedToken?.style.getPropertyValue("--shiki-light")).toMatch(/^#/);
    expect(highlightedToken?.style.getPropertyValue("--shiki-dark")).toMatch(/^#/);
    const fencedHeading = screen.getByRole("heading", { name: "围栏标题" });
    expect(fencedHeading.closest('[data-od-slot="ai-code-block"]')).toBeInTheDocument();
    expect(fencedHeading.closest('[data-od-slot="ai-code-block-preview"]')).toBeInTheDocument();
    const copyButtons = screen.getAllByRole("button", { name: "复制代码" });
    fireEvent.click(copyButtons[0]);
    expect(writeText).toHaveBeenCalledWith("const answer = 42;");
    expect(screen.getByText(/流式未闭合/)).toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(container.querySelector('[data-od-slot="ai-markdown-content"]')).toBeInTheDocument();
  });

  it("skips highlighting while streaming and highlights all recognized terminal code blocks", async () => {
    const thread = createThread({
      messages: [
        {
          id: "assistant-streaming-markdown",
          role: "assistant",
          status: "streaming",
          parts: [{ type: "text", text: "```js\nconst closed = true;\n```\n\n```ts\nconst stillStreaming =" }],
        },
      ],
    });
    const runtime = createOdysseyAIRuntime(thread);
    const { container } = render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    const blocks = container.querySelectorAll('[data-od-slot="ai-code-block"]');
    expect(blocks).toHaveLength(2);
    expect(blocks[0].querySelector('[data-highlighted="true"]')).not.toBeInTheDocument();
    expect(blocks[1].querySelector('[data-highlighted="true"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "折叠代码" })).not.toBeInTheDocument();
    expect(blocks[1]).toHaveTextContent("const stillStreaming =");
    act(() => runtime.update({ ...thread, messages: [{ ...thread.messages[0], status: "complete" }] }));
    await waitFor(() => expect(container.querySelectorAll('[data-highlighted="true"]')).toHaveLength(2));
  });

  it("offers an in-block collapse control only for long terminal code", async () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.getAttribute("data-od-slot") === "ai-code-block-body" ? 520 : 0;
    });
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (this: HTMLElement) {
      return this.getAttribute("aria-hidden") === "true" ? 384 : 0;
    });
    const thread = createThread({
      messages: [
        {
          id: "assistant-long-code",
          role: "assistant",
          status: "complete",
          parts: [{ type: "text", text: `\`\`\`java\n${"System.out.println(1);\n".repeat(30)}\`\`\`` }],
        },
      ],
    });
    const { container } = render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    const collapse = await screen.findByRole("button", { name: "折叠代码" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(collapse.closest('[data-od-slot="ai-code-block-affix"]')).toBeInTheDocument();
    fireEvent.click(collapse);
    expect(screen.getByRole("button", { name: "展开代码" })).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector('[data-od-slot="ai-code-block-body"]')).toHaveAttribute("data-collapsed", "true");
    expect(screen.getByRole("button", { name: "复制代码" })).toBeInTheDocument();
  });

  it("keeps unknown and unlabeled code fences as escaped plain text", () => {
    const thread = createThread({
      messages: [
        {
          id: "assistant-plain-code",
          role: "assistant",
          status: "complete",
          parts: [{ type: "text", text: "```future-lang\n<script>unsafe()</script>\n```\n\n```\nplain code\n```" }],
        },
      ],
    });
    const { container } = render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    expect(container.querySelectorAll('[data-od-slot="ai-code-block"]')).toHaveLength(2);
    expect(container.querySelector('[data-highlighted="true"]')).not.toBeInTheDocument();
    expect(container.querySelector("script")).not.toBeInTheDocument();
    expect(screen.getByText("<script>unsafe()</script>")).toBeInTheDocument();
    expect(screen.getByText("plain code")).toBeInTheDocument();
  });

  it("collapses only overflowing user messages and restores clipped controls when expanded", async () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(320);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(120);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function mockBounds(this: HTMLElement) {
      const bottom = this.tagName === "A" ? 240 : 120;
      return { bottom, height: bottom, left: 0, right: 480, top: 0, width: 480, x: 0, y: 0, toJSON: () => ({}) };
    });
    const thread = createThread({
      messages: [
        {
          id: "user-long",
          role: "user",
          status: "complete",
          parts: [{ type: "text", text: `${"很长的用户消息。".repeat(80)}\n\n[隐藏链接](https://example.com)` }],
        },
        { id: "assistant-long", role: "assistant", status: "complete", parts: [{ type: "text", text: "完整显示的 AI 回复。".repeat(80) }] },
      ],
    });
    render(
      <OdysseyAIRuntimeProvider runtime={createOdysseyAIRuntime(thread)}>
        <AssistantWorkspace />
      </OdysseyAIRuntimeProvider>,
    );

    const toggle = await screen.findByRole("button", { name: "展开消息" });
    const userContent = toggle.closest('[data-od-slot="ai-collapsible-user-message"]');
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(userContent).toHaveAttribute("data-od-slot", "ai-collapsible-user-message");
    expect(screen.getByRole("link", { name: "隐藏链接", hidden: true })).toHaveAttribute("tabindex", "-1");
    expect(screen.getAllByText(/完整显示的 AI 回复/)).toHaveLength(1);

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "收起消息" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "隐藏链接" })).not.toHaveAttribute("tabindex");
  });
});
