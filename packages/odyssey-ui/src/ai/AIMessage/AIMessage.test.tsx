import { fireEvent, render, screen } from "@testing-library/react";
import { AILocaleProvider, aiLocales } from "../locale";
import type { AIMessage as AIMessageModel } from "../types";
import { AIMessage, AIMessageAction, AIMessageActions, AIMessageBranchPicker, AIMessagePart } from "./AIMessage";

const assistantMessage: AIMessageModel = {
  id: "one",
  role: "assistant",
  parts: [{ type: "text", text: "Hello Odyssey" }],
};

describe("AIMessage", () => {
  it("renders stable text messages inside the parts anatomy", () => {
    const { container } = render(<AIMessage message={assistantMessage} />);
    expect(screen.getByText("Hello Odyssey")).toBeInTheDocument();
    expect(screen.getByText("Hello Odyssey").parentElement).toHaveAttribute("data-od-slot", "ai-message-parts");
    expect(container.querySelector('[data-od-slot="ai-message-root"]')).toHaveAttribute("data-role", "assistant");
  });

  it("exposes message progress and terminal states", () => {
    const { rerender } = render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessage message={{ ...assistantMessage, parts: [{ type: "text", text: "" }], status: "streaming" }} />
      </AILocaleProvider>,
    );
    expect(screen.getByText("Generating…").parentElement).toHaveAttribute("data-od-slot", "ai-message-status");
    rerender(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessage message={{ ...assistantMessage, status: "error" }} />
      </AILocaleProvider>,
    );
    expect(screen.getByText("Generation failed").parentElement).toHaveAttribute("role", "alert");
    rerender(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessage message={{ ...assistantMessage, status: "complete", finishReason: "length" }} />
      </AILocaleProvider>,
    );
    expect(screen.getByText("The response reached its output limit and may be incomplete").parentElement).toHaveAttribute("role", "status");
  });

  it("renders composable message actions", () => {
    render(
      <AIMessage message={{ ...assistantMessage, role: "user" }}>
        <AIMessageActions>
          <span>actions</span>
          <AIMessageAction label="Default action">default</AIMessageAction>
          <AIMessageAction label="Emphasized action" variant="soft">
            emphasized
          </AIMessageAction>
        </AIMessageActions>
      </AIMessage>,
    );
    expect(screen.getByText("actions").closest('[data-od-slot="ai-message-actions"]')).toHaveAttribute("data-od-slot", "ai-message-actions");
    expect(screen.getByRole("button", { name: "Default action" })).toHaveAttribute("data-variant", "ghost");
    expect(screen.getByRole("button", { name: "Emphasized action" })).toHaveAttribute("data-variant", "soft");
  });

  it("switches between message branches through accessible controls", () => {
    const message: AIMessageModel = {
      id: "version-1",
      role: "assistant",
      parts: [{ type: "text", text: "first" }],
      branches: [
        { id: "version-1", sequence: 1 },
        { id: "version-2", sequence: 2 },
      ],
    };
    const onSwitch = vi.fn();
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessageBranchPicker message={message} onSwitch={onSwitch} />
      </AILocaleProvider>,
    );
    expect(screen.getByRole("group", { name: "Message versions" })).toHaveTextContent("1 / 2");
    fireEvent.click(screen.getByRole("button", { name: "Next version" }));
    expect(onSwitch).toHaveBeenCalledWith("version-2");
  });

  it("degrades unknown parts without executing them", () => {
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessagePart part={{ type: "unknown", originalType: "future-widget", value: { unsafe: true } }} />
      </AILocaleProvider>,
    );
    expect(screen.getByText("Unsupported content: future-widget")).toHaveAttribute("data-unknown-part", "future-widget");
  });

  it("reports tool approval decisions through controlled callbacks", () => {
    const approve = vi.fn();
    const reject = vi.fn();
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIMessagePart
          part={{ type: "tool-call", id: "tool-1", name: "write_file", input: { path: "README.md" }, state: "approval-required", approvalId: "approval-1" }}
          onApprove={approve}
          onReject={reject}
        />
      </AILocaleProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Allow" }));
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(approve).toHaveBeenCalledWith("approval-1");
    expect(reject).toHaveBeenCalledWith("approval-1");
  });
});
