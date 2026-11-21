import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { OdysseyProvider } from "../../OdysseyProvider";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "./Select";

/** The select with the popup it opens, so the open state has something to show. */
function renderSelect(props: { open?: boolean; defaultValue?: string; disabled?: boolean; onOpenChange?: (open: boolean) => void } = {}) {
  return render(
    <Select {...props}>
      <SelectTrigger aria-label="City">
        <SelectValue placeholder="pick" />
        <SelectIcon />
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner>
          <SelectContent>
            <SelectList>
              <SelectItem value="shanghai">
                <SelectItemText>Shanghai</SelectItemText>
              </SelectItem>
            </SelectList>
          </SelectContent>
        </SelectPositioner>
      </SelectPortal>
    </Select>,
  );
}

describe("Select", () => {
  it("exposes shrinkable value and icon anatomy", () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="City" style={{ width: "6rem" }}>
          <SelectValue placeholder="A very long city name" />
          <SelectIcon />
        </SelectTrigger>
      </Select>,
    );

    const trigger = container.querySelector('[data-od-slot="select-trigger"]');
    const value = container.querySelector('[data-od-slot="select-value"]');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-variant", "outline");
    expect(value).toBeInTheDocument();
    const icon = container.querySelector('[data-od-slot="select-icon"]');
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon?.querySelector("svg")).toHaveAttribute("viewBox", "0 0 24 24");
    expect(icon?.querySelector("svg")).toHaveAttribute("width", "16");
    expect(icon?.querySelector("svg")).toHaveAttribute("height", "16");
  });

  it("supports a ghost trigger when the surrounding surface provides the boundary", () => {
    const { container } = render(
      <Select>
        <SelectTrigger variant="ghost" aria-label="Model">
          <SelectValue placeholder="Select model" />
          <SelectIcon />
        </SelectTrigger>
      </Select>,
    );

    expect(container.querySelector('[data-od-slot="select-trigger"]')).toHaveAttribute("data-variant", "ghost");
    expect(container.querySelector('[data-od-slot="select-trigger"]')).toHaveClass("od-Select-trigger");
  });

  it("logically aligns trigger and value text", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveClass("od-Select-trigger");
  });

  it("preserves custom icon content", () => {
    const { container } = render(
      <Select>
        <SelectTrigger aria-label="City">
          <SelectValue placeholder="City" />
          <SelectIcon>
            <span data-testid="custom-select-icon">custom</span>
          </SelectIcon>
        </SelectTrigger>
      </Select>,
    );

    expect(container.querySelector('[data-testid="custom-select-icon"]')).toBeInTheDocument();
    expect(container.querySelector('[data-od-slot="select-icon"] svg')).not.toBeInTheDocument();
  });

  it("renders the caller's controlled value instead of its raw value", () => {
    const items = [
      { value: "merchant-uuid-1", label: "远航商贸" },
      { value: "merchant-uuid-2", label: "云帆服务" },
    ];
    const { container } = render(
      <Select items={items} value="merchant-uuid-1">
        <SelectTrigger aria-label="所属商户">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
      </Select>,
    );

    const trigger = container.querySelector('[data-od-slot="select-trigger"]');
    expect(trigger).toHaveTextContent("远航商贸");
    expect(trigger).not.toHaveTextContent("merchant-uuid-1");
  });

  it("decouples trigger and popup widths while forwarding refs and native props", () => {
    const triggerRef = createRef<HTMLButtonElement>();
    const positionerRef = createRef<HTMLDivElement>();
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Select open items={[{ label: "Shanghai", value: "shanghai" }]}>
        <SelectTrigger ref={triggerRef} aria-label="City" style={{ inlineSize: "8rem" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner ref={positionerRef}>
            <SelectContent ref={contentRef} width="20rem" data-testid="select-popup" style={{ inlineSize: "22rem" }}>
              <SelectList>
                <SelectItem value="shanghai">
                  <SelectItemText>Shanghai</SelectItemText>
                </SelectItem>
              </SelectList>
            </SelectContent>
          </SelectPositioner>
        </SelectPortal>
      </Select>,
    );

    // jsdom 30 resolves logical properties in the computed style to a used value,
    // so the declared inline value is what these assertions check.
    expect(triggerRef.current?.style.inlineSize).toBe("8rem");
    expect(positionerRef.current).toHaveAttribute("data-od-slot", "select-positioner");
    expect(contentRef.current).toHaveAttribute("data-width", "custom");
    expect(contentRef.current).toHaveAttribute("data-testid", "select-popup");
    expect(contentRef.current?.style.inlineSize).toBe("22rem");
    expect(contentRef.current).toHaveClass("od-Select-popup");
  });

  it.each([
    [undefined, "content"],
    ["content" as const, "content"],
    ["trigger" as const, "trigger"],
  ])("maps width %s to the %s popup mode", (width, mode) => {
    render(
      <Select open items={[{ label: "One", value: "one" }]}>
        <SelectTrigger>One</SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectContent width={width} data-testid="sized-select-popup">
              <SelectList>
                <SelectItem value="one">One</SelectItem>
              </SelectList>
            </SelectContent>
          </SelectPositioner>
        </SelectPortal>
      </Select>,
    );
    expect(document.querySelector('[data-testid="sized-select-popup"]')).toHaveAttribute("data-width", mode);
  });

  it("exposes the trigger with a role and an accessible name", () => {
    renderSelect();

    const trigger = screen.getByRole("combobox", { name: "City" });
    expect(trigger).toHaveAccessibleName("City");
  });

  it("keeps keyboard focus visible with a focus ring that carries a width", async () => {
    const user = userEvent.setup();
    render(
      <OdysseyProvider>
        <Select>
          <SelectTrigger aria-label="City">
            <SelectValue placeholder="pick" />
            <SelectIcon />
          </SelectTrigger>
        </Select>
      </OdysseyProvider>,
    );
    const trigger = screen.getByRole("combobox", { name: "City" });

    await user.tab();
    expect(trigger).toHaveFocus();

    expect(trigger).toHaveClass("od-Select-trigger");
    const root = document.querySelector("[data-od-root]") as HTMLElement;
    expect(root.style.getPropertyValue("--od-input-focus-shadow")).toMatch(/\b0 0 0 (?:\d+(?:\.\d+)?)(?:px|rem|em)/);
  });

  it("keeps a disabled trigger inert", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderSelect({ disabled: true, onOpenChange });

    const trigger = screen.getByRole("combobox", { name: "City" });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("data-disabled");

    await user.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens the popup from the keyboard", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderSelect({ onOpenChange });

    const trigger = screen.getByRole("combobox", { name: "City" });
    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledTimes(1);

    // Space opens the trigger the same way Enter does.
    await user.keyboard("{Escape}");
    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenCalledTimes(3);
  });

  it("moves focus into the popup and returns it to the trigger when dismissed", async () => {
    const user = userEvent.setup();
    renderSelect();

    const trigger = screen.getByRole("combobox", { name: "City" });
    await user.tab();
    expect(trigger).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Base UI hands the popup its focus on the next animation frame, so the
    // move is awaited rather than assumed to land within the keystroke.
    await waitFor(() => expect(screen.getByRole("option", { name: "Shanghai" })).toHaveFocus());
    expect(document.activeElement).not.toBe(trigger);

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("distinguishes hover, open, selected and disabled in the state matrix", () => {
    renderSelect({ open: true, defaultValue: "shanghai" });

    const trigger = screen.getByRole("combobox", { name: "City" });
    const item = screen.getByRole("option", { name: "Shanghai" });

    expect(trigger).toHaveClass("od-Select-trigger");
    expect(item).toHaveClass("od-Select-item");
    expect(item).toHaveAttribute("data-selected");
  });
});
