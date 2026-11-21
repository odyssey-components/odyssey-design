import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AILocaleProvider, aiLocales } from "../locale";
import { AIToolCall, AIToolCallError, AIToolCallResult } from "./AIToolCall";

const toolCallPart = {
  type: "tool-call" as const,
  id: "call-1",
  name: "read_file",
  input: { path: "a.ts" },
  state: "output-available" as const,
};

describe("AIToolCall", () => {
  it("presents the tool call with its name and serialized input", () => {
    const { container } = render(<AIToolCall part={toolCallPart} />);
    expect(container.querySelector('[data-od-slot="ai-tool-call"]')).not.toBeNull();
    expect(screen.getByText("read_file")).toBeInTheDocument();
    expect(screen.getByText(/"path": "a.ts"/)).toHaveAttribute("data-od-slot", "ai-tool-call-input");
  });

  it("returns approval decisions to the caller instead of granting them", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIToolCall part={{ ...toolCallPart, approvalId: "approval-1" }} onApprove={onApprove} onReject={onReject} />
      </AILocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Allow" }));
    expect(onApprove).toHaveBeenCalledWith("approval-1");
    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(onReject).toHaveBeenCalledWith("approval-1");
  });

  it("announces tool failures and renders tool output", () => {
    render(
      <>
        <AIToolCallError>Tool execution failed</AIToolCallError>
        <AIToolCallResult part={{ type: "tool-result", toolCallId: "call-1", output: { ok: true }, state: "output-available" }} />
      </>,
    );
    expect(screen.getByRole("alert")).toHaveAttribute("data-od-slot", "ai-tool-call-error");
    expect(screen.getByText(/"ok": true/)).toHaveAttribute("data-od-slot", "ai-tool-call-result");
  });
});
