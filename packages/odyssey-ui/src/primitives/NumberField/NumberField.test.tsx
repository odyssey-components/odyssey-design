import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from ".";

describe("NumberField", () => {
  it("supports controlled null and stepper interactions", () => {
    function Example() {
      const [value, setValue] = useState<number | null>(null);
      return (
        <NumberField value={value} onValueChange={setValue} min={0} max={2}>
          <NumberFieldGroup>
            <NumberFieldInput aria-label="Count" />
            <NumberFieldIncrement aria-label="Increase" />
            <NumberFieldDecrement aria-label="Decrease" />
          </NumberFieldGroup>
        </NumberField>
      );
    }
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    fireEvent.click(screen.getByRole("button", { name: "Increase" }));
    expect(screen.getByRole("textbox", { name: "Count" })).toHaveValue("1");
  });

  it("forwards root and input refs through stable anatomy", () => {
    const inputRef = { current: null as HTMLInputElement | null };
    const { container } = render(
      <NumberField>
        <NumberFieldGroup>
          <NumberFieldInput ref={inputRef} aria-label="Amount" />
        </NumberFieldGroup>
      </NumberField>,
    );
    expect(container.querySelector('[data-od-slot="number-field"]')).toBeTruthy();
    expect(inputRef.current).toBe(screen.getByRole("textbox", { name: "Amount" }));
  });
});
