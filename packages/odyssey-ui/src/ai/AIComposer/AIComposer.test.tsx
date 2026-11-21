import { fireEvent, render, screen } from "@testing-library/react";
import { AIComposer, AIComposerInput, AIComposerSend } from "./AIComposer";

describe("AIComposer", () => {
  it("submits on Enter but never on Shift+Enter, IME composition or a repeated Enter key", () => {
    const onSubmit = vi.fn();
    render(
      <AIComposer onSubmit={onSubmit}>
        <AIComposerInput aria-label="Prompt" />
        <AIComposerSend />
      </AIComposer>,
    );
    const input = screen.getByRole("textbox", { name: "Prompt" });

    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", repeat: true });

    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("keeps the send action inactive while the prompt cannot be submitted", () => {
    render(
      <AIComposer>
        <AIComposerInput aria-label="Prompt" />
        <AIComposerSend canSubmit={false} />
      </AIComposer>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("exposes the composer anatomy through stable semantic slots", () => {
    const { container } = render(
      <AIComposer>
        <AIComposerInput aria-label="Prompt" />
      </AIComposer>,
    );
    expect(container.querySelector('[data-od-slot="ai-composer-root"]')).not.toBeNull();
    expect(container.querySelector('[data-od-slot="ai-composer-root"]')).toHaveClass("od-AIComposer-root");
    expect(screen.getByRole("textbox", { name: "Prompt" })).toHaveAttribute("data-od-slot", "ai-composer-input");
  });
});
