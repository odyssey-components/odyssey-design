import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { OdysseyProvider, useOdysseyResolvedTokens, useOdysseyTokens } from "./OdysseyProvider";
import { Badge } from "./primitives/Badge";
import { Stack } from "./primitives/Stack";
import { createOdysseyTheme, odysseyThemes } from "./theme";
import { shadcnSchemes } from "./themes/shadcn-schemes";

function contrastRatio(foreground: string, background: string): number {
  const luminance = (value: string) => {
    const hexChannels = value.slice(1).match(/../g);
    if (!hexChannels) throw new Error(`Expected a six-digit color, got ${value}`);
    const channels = hexChannels
      .map((channel) => parseInt(channel, 16) / 255)
      .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function TokenProbe() {
  const tokens = useOdysseyTokens();
  const resolved = useOdysseyResolvedTokens();
  return <span data-control-height={resolved?.reference.control.heightMd}>{tokens?.primary}</span>;
}

describe("runtime themes", () => {
  it("uses distinct Shadcn semantic status colors with readable foregrounds", () => {
    for (const scheme of [shadcnSchemes.light, shadcnSchemes.dark]) {
      if (!scheme) throw new Error("Shadcn color scheme is missing");
      const colors = scheme.semantic?.color;
      if (!colors) throw new Error("Shadcn semantic colors are missing");
      expect(new Set([colors.info, colors.success, colors.warning]).size).toBe(3);
      for (const name of ["info", "success", "warning"] as const) {
        expect(contrastRatio(String(colors[`${name}Foreground`]), String(colors[name]))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it("deeply extends a theme and applies tokens without a build artifact", () => {
    const theme = createOdysseyTheme("brand", { seed: { colors: { primary: "#1e6e62" } } }, odysseyThemes.shadcn);
    render(
      <OdysseyProvider theme={theme} colorScheme="light" density="compact" style={{ "--od-primary": "hotpink" } as React.CSSProperties}>
        <TokenProbe />
      </OdysseyProvider>,
    );
    const root = document.querySelector("[data-od-root]") as HTMLElement;
    expect(root).toHaveAttribute("data-od-theme", "brand");
    expect(root).toHaveAttribute("data-od-resolved-color-scheme", "light");
    expect(root.style.getPropertyValue("--od-primary")).toBe("hotpink");
    expect(screen.getByText("#1e6e62")).toBeInTheDocument();
    expect(screen.getByText("#1e6e62")).toHaveAttribute("data-control-height", "32");
  });

  it("exposes interaction recipes as runtime styling attributes", () => {
    render(
      <OdysseyProvider theme={odysseyThemes["ant-design"]}>
        <button type="button">save</button>
      </OdysseyProvider>,
    );
    expect(document.querySelector("[data-od-root]")).toHaveAttribute("data-od-action-filled-feedback", "outline-wave");
  });

  it("keeps CSS variables complete and deterministic when themes change", () => {
    const view = render(
      <OdysseyProvider theme={odysseyThemes.shadcn}>
        <TokenProbe />
      </OdysseyProvider>,
    );
    const root = document.querySelector("[data-od-root]") as HTMLElement;
    const initialVariables = root.getAttribute("style");
    view.rerender(
      <OdysseyProvider theme={odysseyThemes["ant-design"]}>
        <TokenProbe />
      </OdysseyProvider>,
    );
    expect(root).toHaveAttribute("data-od-theme", "ant-design");
    expect(root.style.getPropertyValue("--od-primary")).not.toBe("");
    view.rerender(
      <OdysseyProvider theme={odysseyThemes.shadcn}>
        <TokenProbe />
      </OdysseyProvider>,
    );
    expect(root.getAttribute("style")).toBe(initialVariables);
  });

  it("updates mounted component geometry when mode and density change", () => {
    const view = render(
      <OdysseyProvider colorScheme="light" density="standard">
        <TokenProbe />
      </OdysseyProvider>,
    );
    const root = document.querySelector("[data-od-root]") as HTMLElement;
    const lightBackground = root.style.getPropertyValue("--od-background");
    expect(root.style.getPropertyValue("--od-control-height-md")).toBe("36px");
    expect(root.style.getPropertyValue("--od-selection-control-size")).toBe("20px");

    view.rerender(
      <OdysseyProvider colorScheme="dark" density="compact">
        <TokenProbe />
      </OdysseyProvider>,
    );
    expect(root).toHaveAttribute("data-od-color-scheme", "dark");
    expect(root).toHaveAttribute("data-od-density", "compact");
    expect(root.style.getPropertyValue("--od-background")).not.toBe(lightBackground);
    expect(root.style.getPropertyValue("--od-control-height-md")).toBe("32px");
    expect(root.style.getPropertyValue("--od-selection-control-size")).toBe("18px");
    expect(root.style.getPropertyValue("--od-switch-width")).toBe("40px");
  });

  it("is SSR safe and keeps resolved tokens inline without runtime stylesheet collection", () => {
    const html = renderToString(
      <OdysseyProvider>
        <div>SSR</div>
      </OdysseyProvider>,
    );
    expect(html).toContain("data-od-root");
    expect(html).toContain("--od-background:");
    expect(html).not.toContain("data-styled");
    expect(html).not.toContain("<style");
  });

  it("uses stable static component classes regardless of instance count", () => {
    function collect(children: React.ReactNode) {
      return renderToString(<OdysseyProvider>{children}</OdysseyProvider>);
    }

    const baseline = collect(<span>baseline</span>);
    const single = collect(
      <Stack>
        <Badge>badge</Badge>
      </Stack>,
    );
    const badgeLabels = Array.from({ length: 100 }, (_, index) => `badge-${index + 1}`);
    const dense = collect(
      <Stack>
        {badgeLabels.map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
      </Stack>,
    );

    expect(baseline).not.toContain("data-styled");
    expect(single).toContain("od-Stack");
    expect(single).toContain("inline-flex");
    expect(dense.match(/data-od-slot="badge"/g)).toHaveLength(100);
  });

  it("keeps utility classes on standalone components without a provider", () => {
    const html = renderToString(<Badge tone="success">standalone</Badge>);
    expect(html).toContain("inline-flex");
    expect(html).toContain("--od-success");
  });
});
