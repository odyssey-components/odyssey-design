import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleButton } from "./ToggleButton";

describe("ToggleButton", () => {
  it("exposes pressed semantics and primary visual state", () => {
    const { rerender } = render(<ToggleButton pressed={false}>AI执黑</ToggleButton>);
    const button = screen.getByRole("button", { name: "AI执黑" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("data-tone", "neutral");
    expect(button).toHaveAttribute("data-variant", "outline");

    rerender(<ToggleButton pressed>AI执黑</ToggleButton>);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-variant", "outline");
  });

  it("binds persistent selection colors to semantic theme tokens", () => {
    render(<ToggleButton pressed>AI执白</ToggleButton>);
    const button = screen.getByRole("button", { name: "AI执白" });
    expect(button).toHaveClass("data-[pressed]:border-[var(--od-primary)]");
    expect(button).toHaveClass("data-[pressed]:bg-[var(--od-accent)]");
    expect(button).toHaveClass("data-[pressed]:text-[var(--od-accent-foreground)]");
    expect(button).toHaveClass("data-[pressed]:hover:border-[var(--od-primary-hover)]");
    expect(button).toHaveClass("data-[pressed]:active:border-[var(--od-primary-active)]");
  });

  it("keeps disabled styling separate from the pressed state", () => {
    render(
      <ToggleButton pressed disabled>
        AI执白
      </ToggleButton>,
    );
    const button = screen.getByRole("button", { name: "AI执白" });
    expect(button).toHaveClass("data-[disabled]:opacity-[0.72]");
    expect(button).toHaveClass("data-[pressed]:text-[var(--od-accent-foreground)]");
  });

  it("supports pointer and keyboard changes independently", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(
      <ToggleButton pressed={false} onPressedChange={onPressedChange}>
        AI执白
      </ToggleButton>,
    );
    const button = screen.getByRole("button", { name: "AI执白" });

    await user.click(button);
    button.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onPressedChange).toHaveBeenCalledTimes(3);
    expect(onPressedChange.mock.calls.at(-1)?.[0]).toBe(true);
  });

  it("forwards refs and native properties while respecting disabled", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    const onPressedChange = vi.fn();
    render(
      <ToggleButton ref={ref} pressed disabled name="ai-black" onPressedChange={onPressedChange}>
        AI执黑
      </ToggleButton>,
    );

    expect(ref.current).toBe(screen.getByRole("button", { name: "AI执黑" }));
    expect(ref.current).toHaveAttribute("name", "ai-black");
    const button = screen.getByRole("button", { name: "AI执黑" });
    await user.click(button);
    expect(onPressedChange).not.toHaveBeenCalled();
  });
});
