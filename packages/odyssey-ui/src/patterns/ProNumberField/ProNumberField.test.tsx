import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProNumberField } from ".";

describe("ProNumberField", () => {
  it("connects field copy and semantic anatomy", () => {
    const onValueChange = vi.fn();
    render(
      <ProNumberField
        label="Quantity"
        description="Whole units"
        error="Required"
        value={null}
        onValueChange={onValueChange}
        classNames={{ group: "custom-group" }}
      />,
    );
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelector('[data-od-slot="pro-number-field-group"]')).toHaveClass("custom-group");
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(onValueChange).toHaveBeenCalled();
  });
});
