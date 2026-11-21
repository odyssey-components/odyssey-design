import { render, screen } from "@testing-library/react";
import { Field, FieldLabel } from "../Field";
import { Textarea } from "./Textarea";

it("participates in Field context", () => {
  render(
    <Field>
      <FieldLabel>Notes</FieldLabel>
      <Textarea />
    </Field>,
  );
  expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAttribute("data-od-slot", "textarea");
});

it("uses token utilities and lets the consumer extend the control class", () => {
  render(<Textarea aria-label="Comment" className="resize-y rounded-none" aria-invalid="true" />);
  const textarea = screen.getByRole("textbox", { name: "Comment" });
  expect(textarea).toHaveClass("w-full", "focus-visible:outline-none", "aria-[invalid=true]:border-[var(--od-destructive)]", "resize-y", "rounded-none");
});
