import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ToggleButton } from "../ToggleButton";
import { ToggleGroup } from "./ToggleGroup";

describe("ToggleGroup", () => {
  it("supports uncontrolled single selection and refs", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    render(
      <ToggleGroup ref={ref} aria-label="Alignment">
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("button", { name: "Left" }));
    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Right" }));
    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false");
    expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
  });
  it("moves focus with orientation-aware arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup aria-label="View" orientation="vertical">
        <ToggleButton value="grid">Grid</ToggleButton>
        <ToggleButton value="list">List</ToggleButton>
      </ToggleGroup>,
    );
    screen.getByRole("button", { name: "Grid" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: "List" })).toHaveFocus();
  });
});
