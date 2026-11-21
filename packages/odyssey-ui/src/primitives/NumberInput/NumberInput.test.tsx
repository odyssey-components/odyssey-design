import { render, screen } from "@testing-library/react";
import { Field, FieldLabel } from "../Field";
import { NumberInput } from "./NumberInput";

it("renders a labeled decimal input", () => {
  render(
    <Field>
      <FieldLabel>Count</FieldLabel>
      <NumberInput />
    </Field>,
  );
  expect(screen.getByRole("spinbutton", { name: "Count" })).toHaveAttribute("inputmode", "decimal");
});
