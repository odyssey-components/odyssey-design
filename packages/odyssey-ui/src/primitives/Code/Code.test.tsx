import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Code } from "./Code";

it("renders inline and block code slots", () => {
  const { rerender } = render(<Code>passkey</Code>);
  expect(screen.getByText("passkey")).toHaveAttribute("data-od-slot", "inline-code");
  rerender(<Code block>hash</Code>);
  expect(screen.getByText("hash")).toHaveAttribute("data-od-slot", "code-block");
});

it("forwards refs and native code attributes", () => {
  const ref = createRef<HTMLElement>();
  render(
    <Code ref={ref} className="hash" title="info hash">
      abc
    </Code>,
  );
  expect(ref.current).toBe(screen.getByText("abc"));
  expect(ref.current).toHaveClass("hash");
  expect(ref.current).toHaveAttribute("title", "info hash");
});
