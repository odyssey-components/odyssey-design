import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Input } from "../Input";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field";

it("automatically associates field messaging", () => {
  render(
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Work address</FieldDescription>
      <FieldError>Invalid</FieldError>
    </Field>,
  );
  const input = screen.getByRole("textbox", { name: "Email" });
  expect(input).toHaveAccessibleDescription("Work address Invalid");
  expect(input).toHaveAttribute("aria-invalid", "true");
});

it("exposes the disabled state of a field and never edits its control", async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <Field disabled>
      <FieldLabel>Email</FieldLabel>
      <Input onChange={onChange} />
    </Field>,
  );
  const input = screen.getByRole("textbox", { name: "Email" });

  expect(input).toBeDisabled();
  expect(input).toHaveAttribute("data-disabled");
  await user.type(input, "hi");
  expect(onChange).not.toHaveBeenCalled();
  expect(input).toHaveValue("");
});

it("keeps the valid, the invalid and the disabled field apart in one state matrix", () => {
  const { container, rerender } = render(
    <Field>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Work address</FieldDescription>
    </Field>,
  );
  const field = container.querySelector('[data-od-slot="field"]') as HTMLElement;

  // A valid, enabled field carries neither of the two states.
  expect(field).not.toHaveAttribute("data-invalid");
  expect(field).not.toHaveAttribute("data-disabled");

  rerender(
    <Field invalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Work address</FieldDescription>
      <FieldError>Invalid</FieldError>
    </Field>,
  );
  expect(field).toHaveAttribute("data-invalid");
  expect(field).not.toHaveAttribute("data-disabled");

  // The invalid state is the one the field's own CSS paints differently: the
  // error message takes the destructive colour, the neutral message does not.
  const error = container.querySelector('[data-od-slot="field-error"]') as HTMLElement;
  const description = container.querySelector('[data-od-slot="field-description"]') as HTMLElement;
  expect(error).toHaveClass("od-Field-error");
  expect(description).toHaveClass("od-Field-description");

  rerender(
    <Field disabled>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>Work address</FieldDescription>
    </Field>,
  );
  expect(field).toHaveAttribute("data-disabled");
  expect(field).not.toHaveAttribute("data-invalid");
});
