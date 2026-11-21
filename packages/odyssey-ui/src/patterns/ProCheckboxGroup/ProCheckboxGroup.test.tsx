import { OdysseyProvider } from "@odyssey/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProCheckboxGroup } from "./ProCheckboxGroup";

describe("ProCheckboxGroup", () => {
  it("renders options and emits string arrays", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProCheckboxGroup
          aria-label="Topics"
          options={[
            { value: "design", label: "Design" },
            { value: "code", label: "Code" },
          ]}
          onValueChange={onValueChange}
        />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("checkbox", { name: "Code" }));
    expect(onValueChange.mock.calls.at(-1)?.[0]).toEqual(["code"]);
  });
  it("supports refs, option state, renderOption, and semantic styles", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <OdysseyProvider>
        <ProCheckboxGroup
          ref={ref}
          aria-label="Access"
          className="root"
          classNames={{ control: "control" }}
          options={[{ value: "read", label: "Read", disabled: true }]}
          renderOption={(option) => <span>{option.label} access</span>}
        />
      </OdysseyProvider>,
    );
    expect(ref.current).toHaveAttribute("data-od-slot", "pro-checkbox-group");
    expect(ref.current).toHaveClass("root");
    expect(screen.getByRole("checkbox", { name: "Read access" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("checkbox", { name: "Read access" })).toHaveClass("control");
  });
});
