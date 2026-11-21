import { createOdysseyTheme, registerOdysseyThemePreset, unregisterOdysseyThemePreset } from "@odyssey/ui/theme";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import { ProAdminProvider, useProAdminAppearance } from "./ProAdminProvider";

function Probe() {
  const appearance = useProAdminAppearance();
  return (
    <>
      <output>
        {appearance.colorScheme}/{appearance.themeId}/{appearance.density}
      </output>
      <output data-testid="available-themes">{appearance.themes.map((theme) => theme.id).join(",")}</output>
      <button type="button" onClick={() => appearance.setColorScheme("dark")}>
        dark
      </button>
      <button type="button" onClick={() => appearance.setDensity("spacious")}>
        spacious
      </button>
      <button type="button" onClick={() => appearance.setDensity("compact")}>
        compact
      </button>
    </>
  );
}

describe("ProAdminProvider", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders deterministic defaults during SSR", () => {
    const html = renderToString(
      <ProAdminProvider appearance={{ storageKey: "ssr-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(html).toContain('data-od-color-scheme="system"');
    expect(html).toContain('data-od-theme="shadcn"');
    expect(html).toContain('data-od-density="standard"');
  });

  it("does not statically inject Admin component anatomy", () => {
    const html = renderToString(
      <ProAdminProvider appearance={{ storageKey: "provider-only" }}>
        <div>content</div>
      </ProAdminProvider>,
    );
    expect(html).not.toContain("<style");
    expect(html).not.toContain("data-styled");
  });

  it("persists appearance choices per application", () => {
    const view = render(
      <ProAdminProvider appearance={{ storageKey: "appearance-test" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByText("system/shadcn/standard")).toBeInTheDocument();
    fireEvent.click(screen.getByText("dark"));
    fireEvent.click(screen.getByText("compact"));
    expect(screen.getByText("dark/shadcn/compact")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("appearance-test") ?? "{}")).toMatchObject({ colorScheme: "dark", density: "compact" });
    view.unmount();
    render(
      <ProAdminProvider appearance={{ storageKey: "appearance-test" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByText("dark/shadcn/compact")).toBeInTheDocument();
  });

  it("uses registered presets when custom theme options are omitted", () => {
    registerOdysseyThemePreset({ id: "registry-test", label: "Registry", theme: createOdysseyTheme("registry-test") });
    try {
      render(
        <ProAdminProvider appearance={{ storageKey: "registry-appearance", defaultThemeId: "registry-test" }}>
          <Probe />
        </ProAdminProvider>,
      );
      expect(screen.getByText("system/registry-test/standard")).toBeInTheDocument();
    } finally {
      unregisterOdysseyThemePreset("registry-test");
    }
  });

  it("includes all built-in presets without changing the Shadcn default", () => {
    render(
      <ProAdminProvider appearance={{ storageKey: "fluent-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByTestId("available-themes")).toHaveTextContent("shadcn,ant-design,fluent,material-design");
    expect(screen.getByText("system/shadcn/standard")).toBeInTheDocument();
  });

  it("persists and restores spacious density", () => {
    const view = render(
      <ProAdminProvider appearance={{ storageKey: "spacious-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    fireEvent.click(screen.getByText("spacious"));
    expect(screen.getByText("system/shadcn/spacious")).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("spacious-appearance") ?? "{}").density).toBe("spacious");
    view.unmount();
    render(
      <ProAdminProvider appearance={{ storageKey: "spacious-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByText("system/shadcn/spacious")).toBeInTheDocument();
  });

  it("migrates the legacy preset field and recovers from invalid storage", () => {
    window.localStorage.setItem("legacy-appearance", JSON.stringify({ preset: "shadcn", colorScheme: "dark", density: "compact" }));
    render(
      <ProAdminProvider appearance={{ storageKey: "legacy-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByText("dark/shadcn/compact")).toBeInTheDocument();

    window.localStorage.setItem("invalid-appearance", "{");
    render(
      <ProAdminProvider appearance={{ storageKey: "invalid-appearance" }}>
        <Probe />
      </ProAdminProvider>,
    );
    expect(screen.getByText("system/shadcn/standard")).toBeInTheDocument();
  });
});
