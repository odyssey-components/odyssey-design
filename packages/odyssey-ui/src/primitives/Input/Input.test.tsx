import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldLabel } from "../Field";
import { Input } from "./Input";

it("participates in Field context", () => {
  render(
    <Field disabled>
      <FieldLabel>Name</FieldLabel>
      <Input />
    </Field>,
  );
  expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
});

it("exposes its disabled state and never invokes the action", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<Input aria-label="Name" disabled onChange={onChange} />);
  const input = screen.getByRole("textbox", { name: "Name" });

  expect(input).toBeDisabled();
  await user.type(input, "Odyssey");
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveValue("");
});

it("accepts keyboard input the way a native text field does", async () => {
  const user = userEvent.setup();
  const typed: string[] = [];
  render(
    <Input
      aria-label="Name"
      onChange={(event) => {
        typed.push(event.target.value);
      }}
    />,
  );
  const input = screen.getByRole("textbox", { name: "Name" });

  await user.tab();
  expect(input).toHaveFocus();

  await user.keyboard("Odyssey");
  expect(typed).toHaveLength(7);
  expect(typed.at(-1)).toBe("Odyssey");
  expect(input).toHaveValue("Odyssey");

  // Enter carries no meaning in a single-line text field, so it neither
  // clears the field nor reports another change.
  await user.keyboard("{Enter}");
  expect(input).toHaveValue("Odyssey");
  expect(typed).toHaveLength(7);
});

it("uses token utilities for states and merges consumer class overrides", () => {
  render(<Input aria-label="Name" className="px-4" aria-invalid="true" disabled />);
  const input = screen.getByRole("textbox", { name: "Name" });
  expect(input).toHaveClass(
    "w-full",
    "focus-visible:outline-none",
    "disabled:cursor-not-allowed",
    "aria-[invalid=true]:border-[var(--od-destructive)]",
    "px-4",
  );
  expect(input.className).not.toContain("--od-control-padding-sm");
  expect(input).toHaveAttribute("aria-invalid", "true");
});

it("keeps the caller's value authoritative", async () => {
  const user = userEvent.setup();
  const typed: string[] = [];
  render(
    <Input
      aria-label="Name"
      value="Odyssey"
      onChange={(event) => {
        typed.push(event.target.value);
      }}
    />,
  );
  const input = screen.getByRole("textbox", { name: "Name" });

  await user.click(input);
  await user.keyboard("!");
  // The keystroke is reported to the caller...
  expect(typed).toEqual(["Odyssey!"]);
  // ...but the controlled value still owns what the field shows.
  expect(input).toHaveValue("Odyssey");
});
