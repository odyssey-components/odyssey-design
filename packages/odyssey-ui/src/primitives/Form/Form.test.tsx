import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Form } from "./Form";

describe("Form", () => {
  it("forwards form properties and exposes its layout variant", () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref} aria-label="Filters" variant="responsive-grid" noValidate />);
    const form = screen.getByRole("form", { name: "Filters" });
    expect(form).toHaveAttribute("data-variant", "responsive-grid");
    expect(form).toHaveAttribute("novalidate");
    expect(ref.current).toBe(form);
  });
});
