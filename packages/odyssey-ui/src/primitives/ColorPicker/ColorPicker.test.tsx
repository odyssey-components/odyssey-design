import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { vi } from "vitest";
import { OdysseyProvider } from "../../OdysseyProvider";
import { ColorPicker } from "./ColorPicker";

it("forwards accessible native color input behavior", () => {
  const change = vi.fn();
  render(<ColorPicker label="颜色" value="#112233" onChange={change} />);
  const input = screen.getByLabelText("颜色");
  expect(input).toHaveValue("#112233");
  fireEvent.change(input, { target: { value: "#445566" } });
  expect(change).toHaveBeenCalled();
});

it("forwards ref, form attributes, disabled and policy state", () => {
  const ref = createRef<HTMLInputElement>();
  render(<ColorPicker ref={ref} label="强调色" name="accent" disabled allowAlpha defaultValue="#abcdef" dir="rtl" />);
  const input = screen.getByLabelText("强调色");
  expect(ref.current).toBe(input);
  expect(input).toBeDisabled();
  expect(input).toHaveAttribute("name", "accent");
  expect(input).toHaveAttribute("dir", "rtl");
  expect(input).toHaveAttribute("data-allow-alpha", "true");
});

it.each(["light", "dark"] as const)("inherits the %s Odyssey color scheme", (colorScheme) => {
  render(
    <OdysseyProvider colorScheme={colorScheme}>
      <ColorPicker label="主题色" defaultValue="#123456" />
    </OdysseyProvider>,
  );
  expect(screen.getByLabelText("主题色").closest("[data-od-resolved-color-scheme]")).toHaveAttribute("data-od-resolved-color-scheme", colorScheme);
});
