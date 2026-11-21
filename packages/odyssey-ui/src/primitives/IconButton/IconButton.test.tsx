import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "./IconButton";

function TestIcon() {
  return (
    <svg data-testid="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v18" />
    </svg>
  );
}

describe("IconButton", () => {
  it("forwards its accessible name, ref, native props, class and style", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton ref={ref} aria-label="Favorite" className="custom-icon-button" style={{ color: "rgb(1, 2, 3)" }} type="submit">
        <TestIcon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Favorite" });
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("data-od-slot", "icon-button");
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("custom-icon-button");
    expect(button).toHaveStyle({ color: "rgb(1, 2, 3)" });
  });

  it.each(["sm", "md", "lg"] as const)("keeps the %s control square without sizing its svg", (size) => {
    render(
      <IconButton aria-label={`${size} action`} size={size}>
        <TestIcon />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: `${size} action` });
    const icon = screen.getByTestId("icon");
    expect(button).toHaveAttribute("data-size", size);
    expect(button).toHaveAttribute("data-shape", "rounded");
    expect(button).toHaveClass("h-[var(--_od-icon-button-size)]", "w-[var(--_od-icon-button-size)]", "p-0");
    expect(icon).not.toHaveAttribute("width");
    expect(icon).not.toHaveAttribute("height");
    expect(icon.getAttribute("style") ?? "").not.toMatch(/(?:width|height)/);
  });

  it("supports a circular shape through the public contract", () => {
    render(
      <IconButton aria-label="Circular action" shape="circular">
        <TestIcon />
      </IconButton>,
    );

    expect(screen.getByRole("button", { name: "Circular action" })).toHaveAttribute("data-shape", "circular");
  });

  it("keeps the keyboard focus visible without relying on colour alone", async () => {
    const user = userEvent.setup();
    render(
      <IconButton aria-label="Favorite">
        <TestIcon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });

    await user.tab();
    expect(button).toHaveFocus();

    // The official focus paint is a spread halo — the ring at half its
    // opacity — so the focus ring is a shadow that carries a width of its
    // own rather than a solid outline.
    expect(button.className).toContain("focus-visible:shadow-[var(--od-button-focus-shadow)]");
  });

  it("exposes its disabled state and never invokes the action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Favorite" disabled onClick={onClick}>
        <TestIcon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("activates on Enter and on Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Favorite" onClick={onClick}>
        <TestIcon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("distinguishes its hover, active and disabled states in the state matrix", () => {
    const { rerender } = render(
      <IconButton aria-label="Favorite" variant="solid">
        <TestIcon />
      </IconButton>,
    );
    const button = screen.getByRole("button", { name: "Favorite" });

    expect(button.className).toContain("hover:bg-[var(--od-primary-hover)]");
    expect(button.className).toContain("disabled:cursor-not-allowed");

    rerender(
      <IconButton aria-label="Favorite" variant="solid" disabled>
        <TestIcon />
      </IconButton>,
    );
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:cursor-not-allowed");
  });
});
