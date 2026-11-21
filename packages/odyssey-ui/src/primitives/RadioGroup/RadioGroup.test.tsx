import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { RadioButton, RadioGroup, RadioGroupIndicator, RadioGroupItem } from "./RadioGroup";

function RadioOption({ label, value, disabled = false }: { disabled?: boolean; label: string; value: string }) {
  return (
    <span>
      <RadioGroupItem value={value} disabled={disabled} aria-label={label}>
        <RadioGroupIndicator />
      </RadioGroupItem>{" "}
      {label}
    </span>
  );
}

describe("RadioGroup", () => {
  it("changes an uncontrolled value with pointer and keyboard input", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup defaultValue="standard" aria-label="Density">
        <RadioOption label="Comfortable" value="standard" />
        <RadioOption label="Compact" value="compact" />
      </RadioGroup>,
    );
    const standard = screen.getByRole("radio", { name: "Comfortable" });
    const compact = screen.getByRole("radio", { name: "Compact" });
    expect(screen.getByRole("radiogroup", { name: "Density" })).toHaveAttribute("data-orientation", "vertical");
    await user.click(compact);
    expect(compact).toBeChecked();
    await user.keyboard("{ArrowUp}");
    expect(standard).toBeChecked();
  });

  it("supports controlled values and forwards the group and item refs", async () => {
    const user = userEvent.setup();
    const groupRef = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLSpanElement>();
    function Controlled() {
      const [value, setValue] = useState<"a" | "b">("a");
      return (
        <RadioGroup ref={groupRef} value={value} onValueChange={setValue} aria-label="Choice" className="custom-group">
          <RadioGroupItem ref={itemRef} value="a" aria-label="A">
            <RadioGroupIndicator />
          </RadioGroupItem>
          <RadioGroupItem value="b" aria-label="B">
            <RadioGroupIndicator />
          </RadioGroupItem>
        </RadioGroup>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("radio", { name: "B" }));
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
    expect(groupRef.current).toHaveClass("custom-group");
    expect(itemRef.current).toHaveAttribute("data-od-slot", "radio-group-item");
  });

  it("submits its name and value and carries group state", () => {
    render(
      <>
        <form id="settings" data-testid="form" />
        <RadioGroup form="settings" name="density" defaultValue="compact" required readOnly aria-label="Density">
          <RadioOption label="Compact" value="compact" />
        </RadioGroup>
      </>,
    );
    expect(new FormData(screen.getByTestId("form") as HTMLFormElement).get("density")).toBe("compact");
    expect(screen.getByRole("radio", { name: "Compact" })).toHaveAttribute("data-readonly");
  });

  it("selects the focused option with Space and propagates disabled state", async () => {
    const user = userEvent.setup();
    render(
      <RadioGroup aria-label="Choice">
        <RadioGroupItem value="a" aria-label="A">
          <RadioGroupIndicator />
        </RadioGroupItem>
        <RadioGroupItem value="b" aria-label="B">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    );
    await user.tab();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "A" })).toBeChecked();

    render(
      <RadioGroup disabled aria-label="Disabled choice">
        <RadioGroupItem value="c" aria-label="C">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "C" })).toHaveAttribute("aria-disabled", "true");
  });

  it("renders button radios with layout, size, style, and disabled state", async () => {
    const user = userEvent.setup();
    const buttonRef = createRef<HTMLSpanElement>();
    render(
      <RadioGroup defaultValue="list" aria-label="View" orientation="horizontal" size="lg" buttonStyle="solid" block dir="rtl">
        <RadioButton ref={buttonRef} value="list">
          List
        </RadioButton>
        <RadioButton value="grid" disabled aria-invalid="true">
          Grid
        </RadioButton>
      </RadioGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "View" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("data-size", "lg");
    expect(group).toHaveAttribute("data-button-style", "solid");
    expect(group).toHaveAttribute("data-block", "true");
    expect(buttonRef.current).toHaveAttribute("data-checked");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
  });

  it("lets the indicator own the visual selected dot", () => {
    render(
      <RadioGroup defaultValue="a" aria-label="Choice">
        <RadioGroupItem value="a" aria-label="A">
          <RadioGroupIndicator />
        </RadioGroupItem>
      </RadioGroup>,
    );
    const indicator = document.querySelector('[data-od-slot="radio-group-indicator"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator?.querySelector("span")).toBeInTheDocument();
  });
});
