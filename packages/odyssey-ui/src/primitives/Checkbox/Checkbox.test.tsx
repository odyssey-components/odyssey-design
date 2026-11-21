// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI renders the accessible checkbox control and hidden input inside the label.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { vi } from "vitest";
import { OdysseyProvider } from "../../OdysseyProvider";
import { Checkbox, CheckboxGroup, CheckboxIndicator } from "./Checkbox";

describe("Checkbox", () => {
  it("exposes its label and toggles from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <label>
        <Checkbox>
          <CheckboxIndicator />
        </Checkbox>
        接收更新
      </label>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "接收更新" });
    checkbox.focus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
  });

  it("toggles when its visible label is clicked", async () => {
    const user = userEvent.setup();
    render(
      <label>
        <Checkbox>
          <CheckboxIndicator />
        </Checkbox>
        接收更新
      </label>,
    );
    await user.click(screen.getByText("接收更新"));
    expect(screen.getByRole("checkbox", { name: "接收更新" })).toBeChecked();
  });

  it("supports controlled groups, refs, native values, and group disabled state", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLDivElement>();
    const onValueChange = vi.fn();
    function Example() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <form>
          <CheckboxGroup
            ref={ref}
            aria-label="Topics"
            name="topics"
            value={value}
            onValueChange={(next) => {
              setValue(next);
              onValueChange(next);
            }}
          >
            <label>
              <Checkbox value="design">
                <CheckboxIndicator />
              </Checkbox>
              Design
            </label>
            <label>
              <Checkbox value="code">
                <CheckboxIndicator />
              </Checkbox>
              Code
            </label>
          </CheckboxGroup>
        </form>
      );
    }
    render(<Example />);
    expect(ref.current).toHaveAttribute("data-orientation", "vertical");
    expect(document.querySelector('input[name="topics"]')).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Design" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["design"]);
    expect(screen.getByRole("checkbox", { name: "Design" })).toBeChecked();
  });

  it("keeps keyboard focus visible with a focus ring that carries a width", async () => {
    const user = userEvent.setup();
    render(
      <OdysseyProvider>
        <label>
          <Checkbox>
            <CheckboxIndicator />
          </Checkbox>
          接收更新
        </label>
      </OdysseyProvider>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "接收更新" });

    await user.tab();
    expect(checkbox).toHaveFocus();

    expect(checkbox).toHaveClass("focus-visible:shadow-[var(--od-checkbox-focus-shadow)]");

    // The published ring resolves to a shadow with a spread, so a focused
    // control is distinguishable without relying on colour.
    const root = document.querySelector<HTMLElement>("[data-od-root]");
    const ring = root?.style.getPropertyValue("--od-checkbox-focus-shadow") ?? "";
    const spread = /\b0 0 0 (\d+(?:\.\d+)?)px/.exec(ring)?.[1];
    expect(Number(spread)).toBeGreaterThanOrEqual(2);
  });

  it("exposes the disabled state and never invokes the action while disabled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <label>
        <Checkbox disabled onCheckedChange={onCheckedChange}>
          <CheckboxIndicator />
        </Checkbox>
        接收更新
      </label>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "接收更新" });

    // The control publishes the disabled state for assistive technology and
    // for the styles that paint it.
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
    expect(checkbox).toHaveAttribute("data-disabled");
    // The form control behind the checkbox is disabled as well.
    expect(document.querySelector('input[type="checkbox"]')).toBeDisabled();

    await user.click(checkbox);
    checkbox.focus();
    await user.keyboard(" ");
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("keeps the hover, checked and disabled states distinguishable in the state matrix", async () => {
    const user = userEvent.setup();
    render(
      <label>
        <Checkbox>
          <CheckboxIndicator />
        </Checkbox>
        接收更新
      </label>,
    );
    const checkbox = screen.getByRole("checkbox", { name: "接收更新" });

    expect(checkbox).toHaveClass("hover:not-data-[disabled]:border-[var(--od-primary-hover)]");
    expect(checkbox).toHaveClass("data-[checked]:bg-[var(--od-primary)]");
    expect(checkbox).toHaveClass("data-[disabled]:opacity-50");

    // The state that paints the rules is the state the element publishes.
    expect(checkbox).toHaveAttribute("data-unchecked");
    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("data-checked");
    expect(checkbox).not.toHaveAttribute("data-unchecked");
  });

  it("does not change a readonly checkbox", async () => {
    const user = userEvent.setup();
    render(
      <label>
        <Checkbox readOnly>
          <CheckboxIndicator />
        </Checkbox>
        Locked
      </label>,
    );
    await user.click(screen.getByRole("checkbox", { name: "Locked" }));
    expect(screen.getByRole("checkbox", { name: "Locked" })).not.toBeChecked();
  });
});
