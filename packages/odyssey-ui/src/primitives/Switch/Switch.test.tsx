import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { OdysseyProvider } from "../../OdysseyProvider";
import { Switch, SwitchThumb } from "./Switch";

it("toggles with pointer input", async () => {
  const user = userEvent.setup();
  render(
    <span>
      <Switch aria-label="Updates">
        <SwitchThumb />
      </Switch>
      Updates
    </span>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });
  await user.click(control);
  expect(control).toBeChecked();
});

it("forwards refs, size, invalid, and readonly state", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  render(
    <Switch ref={ref} aria-label="Locked" size="lg" readOnly aria-invalid="true">
      <SwitchThumb />
    </Switch>,
  );
  const control = screen.getByRole("switch", { name: "Locked" });
  expect(ref.current).toBe(control);
  expect(control).toHaveAttribute("data-size", "lg");
  expect(control).toHaveAttribute("data-readonly", "true");
  await user.click(control);
  expect(control).not.toBeChecked();
});

it("keeps keyboard focus visible with a focus ring that carries a width", async () => {
  const user = userEvent.setup();
  render(
    <OdysseyProvider>
      <Switch aria-label="Updates">
        <SwitchThumb />
      </Switch>
    </OdysseyProvider>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });

  await user.tab();
  expect(control).toHaveFocus();

  expect(control).toHaveClass("od-Switch-switch");
  const root = document.querySelector("[data-od-root]") as HTMLElement;
  expect(root.style.getPropertyValue("--od-switch-focus-shadow")).toMatch(/\b0 0 0 (?:\d+(?:\.\d+)?)(?:px|rem|em)/);
});

it("keeps a disabled switch inert", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(
    <Switch aria-label="Updates" disabled onCheckedChange={onCheckedChange}>
      <SwitchThumb />
    </Switch>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });

  // The switch is not a native form control, so it reports the disabled state
  // itself instead of carrying the disabled attribute.
  expect(control).toHaveAttribute("aria-disabled", "true");
  expect(control).toHaveAttribute("data-disabled");
  expect(control).toHaveAttribute("tabindex", "-1");

  await user.click(control);
  expect(onCheckedChange).not.toHaveBeenCalled();
  expect(control).toHaveAttribute("aria-checked", "false");
});

it("toggles the switch from the keyboard", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(
    <Switch aria-label="Updates" onCheckedChange={onCheckedChange}>
      <SwitchThumb />
    </Switch>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });

  await user.tab();
  expect(control).toHaveFocus();

  await user.keyboard(" ");
  expect(control).toHaveAttribute("aria-checked", "true");
  await user.keyboard("{Enter}");
  expect(control).toHaveAttribute("aria-checked", "false");
  expect(onCheckedChange).toHaveBeenCalledTimes(2);
});

it("distinguishes hover, checked and disabled in the state matrix", () => {
  const { rerender } = render(
    <Switch aria-label="Updates" checked={false}>
      <SwitchThumb />
    </Switch>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });

  expect(control).toHaveClass("od-Switch-switch");
  expect(control).toHaveAttribute("data-unchecked");
  rerender(
    <Switch aria-label="Updates" checked disabled>
      <SwitchThumb />
    </Switch>,
  );
  expect(control).toHaveAttribute("data-checked");
  expect(control).toHaveAttribute("data-disabled");
});

it("keeps the controlled checked value owned by the caller", async () => {
  const user = userEvent.setup();
  const onCheckedChange = vi.fn();
  render(
    <Switch aria-label="Updates" checked={false} onCheckedChange={onCheckedChange}>
      <SwitchThumb />
    </Switch>,
  );
  const control = screen.getByRole("switch", { name: "Updates" });

  await user.click(control);
  // The control asks to be checked, but the value the caller passed stays
  // authoritative.
  expect(onCheckedChange.mock.calls.at(-1)?.[0]).toBe(true);
  expect(control).toHaveAttribute("aria-checked", "false");
  expect(control).not.toHaveAttribute("data-checked");
});
