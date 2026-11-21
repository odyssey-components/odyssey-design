import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ProAdminProvider, useProAdminAppearance } from "../ProAdminProvider";
import { ProAdminThemeMenu } from "./ProAdminThemeMenu";

function AppearanceProbe() {
  const appearance = useProAdminAppearance();
  return <output>{`${appearance.colorScheme}/${appearance.themeId}/${appearance.density}`}</output>;
}

describe("ProAdminThemeMenu", () => {
  beforeEach(() => window.localStorage.clear());

  it("forwards its trigger ref and updates every appearance dimension", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(
      <ProAdminProvider appearance={{ storageKey: "theme-menu-test" }}>
        <ProAdminThemeMenu ref={ref} aria-label="外观选项" className="theme-root" classNames={{ content: "theme-content", item: "theme-item" }} />
        <AppearanceProbe />
      </ProAdminProvider>,
    );

    expect(ref.current).toHaveAttribute("data-od-slot", "pro-admin-theme-menu-trigger");
    expect(ref.current).toHaveClass("theme-root");
    const trigger = screen.getByRole("button", { name: "外观选项" });
    const icon = trigger.querySelector("svg");
    expect(icon).toHaveAttribute("width", "24");
    expect(icon).toHaveAttribute("height", "24");
    expect(icon).toHaveAttribute("stroke-width", "2");
    expect(icon).not.toHaveAttribute("style");
    expect(trigger).not.toHaveAttribute("style");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(document.querySelector('[data-od-slot="pro-admin-theme-menu-content"]')).toHaveClass("theme-content");
    expect(document.querySelector('[data-od-slot="pro-admin-theme-menu-item"]')).toHaveClass("theme-item");
    await user.click(screen.getByRole("menuitemradio", { name: "深色" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Shadcn" }));
    await user.click(screen.getByRole("menuitemradio", { name: "紧凑" }));

    expect(screen.getByText("dark/shadcn/compact")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("theme-menu-test") ?? "{}")).toMatchObject({
      colorScheme: "dark",
      themeId: "shadcn",
      density: "compact",
    });
  });

  it("keeps the trigger slot as the explicit icon override", () => {
    render(
      <ProAdminProvider appearance={{ storageKey: "theme-menu-slot-test" }}>
        <ProAdminThemeMenu aria-label="自定义外观" slots={{ trigger: () => <span data-testid="custom-theme-trigger">A</span> }} />
      </ProAdminProvider>,
    );

    const trigger = screen.getByRole("button", { name: "自定义外观" });
    expect(screen.getByTestId("custom-theme-trigger")).toBeInTheDocument();
    expect(trigger.querySelector("svg")).toBeNull();
  });
});
