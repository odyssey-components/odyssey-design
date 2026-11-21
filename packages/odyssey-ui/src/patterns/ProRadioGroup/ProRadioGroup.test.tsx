import { OdysseyProvider } from "@odyssey/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { ProRadioGroup } from "./ProRadioGroup";

describe("ProRadioGroup", () => {
  it("renders options and emits the selected value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProRadioGroup
          aria-label="Density"
          options={[
            { value: "standard", label: "Comfortable" },
            { value: "compact", label: "Compact" },
          ]}
          onValueChange={onValueChange}
        />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("radio", { name: "Compact" }));
    expect(onValueChange).toHaveBeenCalledWith("compact", expect.anything());
  });

  it("supports button options, group props, refs, and custom rendering", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <OdysseyProvider>
        <ProRadioGroup
          ref={ref}
          aria-label="View"
          optionType="button"
          orientation="horizontal"
          block
          className="custom-root"
          style={{ width: 320 }}
          classNames={{ button: "custom-button" }}
          value={1}
          options={[
            { value: 1, label: "List" },
            { value: 2, label: "Grid", disabled: true },
          ]}
          renderOption={(option) => <span>{option.label} view</span>}
        />
      </OdysseyProvider>,
    );
    expect(ref.current).toHaveAttribute("data-od-slot", "pro-radio-group");
    expect(ref.current).toHaveAttribute("data-block", "true");
    expect(ref.current).toHaveClass("custom-root");
    expect(ref.current).toHaveStyle({ width: "320px" });
    expect(screen.getByRole("radio", { name: "List view" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List view" })).toHaveClass("custom-button");
    expect(screen.getByRole("radio", { name: "Grid view" })).toHaveAttribute("aria-disabled", "true");
  });
});
