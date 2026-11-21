import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ProCountBadge } from "./ProCountBadge";

describe("ProCountBadge", () => {
  it("normalizes counts, hides zero by default, and supports refs and native props", () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(<ProCountBadge ref={ref} count={Number.NaN} data-testid="count" />);
    expect(ref.current).toBe(screen.getByTestId("count"));
    expect(ref.current).toHaveAttribute("data-od-slot", "pro-count-badge");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    rerender(<ProCountBadge count={-3} showZero />);
    expect(screen.getByText("0")).toBeVisible();
  });

  it("renders overflow and custom count content", () => {
    const { rerender } = render(<ProCountBadge count={120} overflowCount={99} />);
    expect(screen.getByText("99+")).toHaveAttribute("aria-label", "99+");
    rerender(<ProCountBadge count={12} renderCount={(count, display) => `${display} of ${count}`} />);
    expect(screen.getByText("12 of 12")).toBeVisible();
  });

  it("anchors indicators and keeps unlabeled dots decorative", () => {
    render(
      <ProCountBadge count={3} dot classNames={{ indicator: "indicator" }} styles={{ anchor: { color: "red" } }}>
        <button type="button">Inbox</button>
      </ProCountBadge>,
    );
    expect(screen.getByRole("button", { name: "Inbox" })).toBeVisible();
    expect(document.querySelector('[data-od-slot="pro-count-badge-anchor"]')).toHaveStyle({ color: "rgb(255, 0, 0)" });
    expect(document.querySelector('[data-od-slot="pro-count-badge-indicator"]')).toHaveClass("indicator");
    expect(document.querySelector('[data-od-slot="pro-count-badge-indicator"]')).toHaveClass("absolute", "translate-x-1/2");
    expect(document.querySelector('[data-od-slot="pro-count-badge-indicator"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("uses an explicit accessible label for status dots", () => {
    render(<ProCountBadge count={1} dot label="New activity" />);
    expect(screen.getByLabelText("New activity")).toHaveAttribute("data-dot", "true");
  });
});
