import { render, screen } from "@testing-library/react";
import { OdysseyProvider } from "../../OdysseyProvider";
import { odysseyThemes } from "../../theme";
import { Button } from "./Button";

describe("Button disabled state", () => {
  const variants = [
    ["outline", "neutral"],
    ["solid", "neutral"],
    ["soft", "neutral"],
    ["ghost", "neutral"],
    ["link", "neutral"],
    ["solid", "danger"],
  ] as const;

  it.each(variants)("keeps the %s disabled surface in static utility variants", (variant, tone) => {
    render(
      <OdysseyProvider theme={odysseyThemes.shadcn} colorScheme="light">
        <Button variant={variant} tone={tone} disabled>
          press
        </Button>
      </OdysseyProvider>,
    );
    const button = screen.getByRole("button", { name: "press" });
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:cursor-not-allowed");
    expect(button.className).toContain("disabled:text-");
    if (variant === "solid") expect(button.className).toContain("disabled:border-[color-mix(");
  });

  it("uses element opacity for non-Shadcn presets through the static theme selector", () => {
    render(
      <OdysseyProvider theme={odysseyThemes["ant-design"]} colorScheme="light">
        <Button variant="solid" disabled>
          press
        </Button>
      </OdysseyProvider>,
    );
    expect(screen.getByRole("button", { name: "press" })).toBeDisabled();
    expect(document.querySelector("[data-od-root]")).toHaveAttribute("data-od-theme", "ant-design");
    expect(screen.getByRole("button", { name: "press" }).className).toContain("disabled:cursor-not-allowed");
  });
});
