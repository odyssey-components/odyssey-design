import { buildAdapter } from "../../scripts/design-system-adapter";
import { odysseyThemes, resolveOdysseyTheme } from "../theme";
import { drawsFocusHalo, elevationToCss, focusHaloCapabilities, focusHaloPath, officialElevation, officialFocusHalo } from "../tokens";
import type { OdysseyFocusHaloCapability } from "../tokens/focus-halo";
import type { OdysseyElevation, OdysseyResolvedTokens } from "../tokens/types";

const shadcn = (scheme: "light" | "dark" = "light"): OdysseyResolvedTokens => resolveOdysseyTheme(odysseyThemes.shadcn, scheme, "standard");

/** The official Tailwind v4 recipes, written out by hand from the upstream registry. */
const officialRecipes = {
  xs: { layers: [[0, 1, 2, 0, 0, 0, 0, 0.05]] },
  sm: {
    layers: [
      [0, 1, 3, 0, 0, 0, 0, 0.1],
      [0, 1, 2, -1, 0, 0, 0, 0.1],
    ],
  },
  md: {
    layers: [
      [0, 4, 6, -1, 0, 0, 0, 0.1],
      [0, 2, 4, -2, 0, 0, 0, 0.1],
    ],
  },
  lg: {
    layers: [
      [0, 10, 15, -3, 0, 0, 0, 0.1],
      [0, 4, 6, -4, 0, 0, 0, 0.1],
    ],
  },
} satisfies Record<string, OdysseyElevation>;

describe("Odyssey elevation tokens", () => {
  it("declares the four official shadow levels", () => {
    expect(officialElevation.xs.layers).toEqual(officialRecipes.xs.layers);
    expect(officialElevation.sm.layers).toEqual(officialRecipes.sm.layers);
    expect(officialElevation.md.layers).toEqual(officialRecipes.md.layers);
    expect(officialElevation.lg.layers).toEqual(officialRecipes.lg.layers);
  });

  it("serializes an elevation into the upstream CSS recipe", () => {
    expect(elevationToCss(officialElevation.xs)).toBe("0 1px 2px 0 rgb(0 0 0 / 0.05)");
    expect(elevationToCss(officialElevation.sm)).toBe("0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)");
    expect(elevationToCss(officialElevation.md)).toBe("0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)");
    expect(elevationToCss(officialElevation.lg)).toBe("0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)");
    // An empty elevation is no shadow at all.
    expect(elevationToCss({ layers: [] })).toBe("none");
  });

  it("resolves the four levels of the shadcn theme to the official recipes", () => {
    const theme = shadcn();
    expect(theme.reference.shadow.xs.layers).toEqual(officialRecipes.xs.layers);
    expect(theme.reference.shadow.sm.layers).toEqual(officialRecipes.sm.layers);
    expect(theme.reference.shadow.md.layers).toEqual(officialRecipes.md.layers);
    expect(theme.reference.shadow.lg.layers).toEqual(officialRecipes.lg.layers);
    expect(theme.reference.shadow.xs.css).toBe("0 1px 2px 0 rgb(0 0 0 / 0.05)");
  });

  it("declares no elevation outside the shadcn theme", () => {
    for (const id of ["ant-design", "fluent", "material-design"] as const) {
      const theme = resolveOdysseyTheme(odysseyThemes[id], "light", "standard");
      expect(theme.reference.shadow.sm.layers).toEqual([]);
      expect(theme.components.card.shadow.layers).toEqual([]);
    }
  });
});

describe("Odyssey component shadows", () => {
  const componentShadows = () => {
    const theme = shadcn();
    return {
      "components.button.shadow": theme.components.button.shadow,
      "components.input.shadow": theme.components.input.shadow,
      "components.switch.shadow": theme.components.switch.shadow,
      "components.tabs.triggerShadow": theme.components.tabs.triggerShadow,
      "components.card.shadow": theme.components.card.shadow,
      "components.menu.shadow": theme.components.menu.shadow,
      "components.dialog.shadow": theme.components.dialog.shadow,
      "components.alert.shadow": theme.components.alert.shadow,
      "components.badge.shadow": theme.components.badge.shadow,
      "components.skeleton.shadow": theme.components.skeleton.shadow,
      "components.tooltip.shadow": theme.components.tooltip.shadow,
    };
  };

  it("resolves the eleven component shadows to the official recipes", () => {
    const shadows = componentShadows();
    expect(shadows["components.button.shadow"].layers).toEqual([]);
    expect(shadows["components.input.shadow"].layers).toEqual(officialRecipes.xs.layers);
    expect(shadows["components.switch.shadow"].layers).toEqual(officialRecipes.xs.layers);
    expect(shadows["components.tabs.triggerShadow"].layers).toEqual(officialRecipes.sm.layers);
    expect(shadows["components.card.shadow"].layers).toEqual(officialRecipes.sm.layers);
    expect(shadows["components.menu.shadow"].layers).toEqual(officialRecipes.md.layers);
    expect(shadows["components.dialog.shadow"].layers).toEqual(officialRecipes.lg.layers);
    expect(shadows["components.alert.shadow"].layers).toEqual([]);
    expect(shadows["components.badge.shadow"].layers).toEqual([]);
    expect(shadows["components.skeleton.shadow"].layers).toEqual([]);
    expect(shadows["components.tooltip.shadow"].layers).toEqual([]);
  });

  it("paints the component shadows as the upstream multi-layer CSS", () => {
    const shadows = componentShadows();
    expect(shadows["components.card.shadow"].css).toBe("0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)");
    expect(shadows["components.menu.shadow"].css).toBe("0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)");
    expect(shadows["components.dialog.shadow"].css).toBe("0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)");
    expect(shadows["components.input.shadow"].css).toBe("0 1px 2px 0 rgb(0 0 0 / 0.05)");
    expect(shadows["components.button.shadow"].css).toBe("none");
  });

  it("keeps the tooltip without a shadow, as the official recipe has", () => {
    const theme = shadcn();
    expect(theme.components.tooltip.shadow.css).toBe("none");
  });
});

describe("Odyssey focus halo coverage", () => {
  const official: readonly OdysseyFocusHaloCapability[] = ["Button", "IconButton", "TextInput", "Field", "Checkbox", "Switch", "Select", "Tabs", "Pagination"];

  it("reports the official halo for the nine capabilities that draw one", () => {
    const theme = shadcn();
    for (const capability of official) expect(drawsFocusHalo(theme, capability)).toBe(true);
  });

  it("reports no halo for the eleven capabilities the official recipe leaves bare", () => {
    const theme = shadcn();
    for (const capability of focusHaloCapabilities) if (!official.includes(capability)) expect(drawsFocusHalo(theme, capability)).toBe(false);
  });

  it("paints the halo the official recipe asks for", () => {
    const theme = shadcn();
    expect(officialFocusHalo(theme)).toBe("0 0 0 3px oklch(0.708 0 0 / 50%)");
    expect(theme.components.checkbox.focusShadow.css).toBe(officialFocusHalo(theme));
    expect(theme.components.checkbox.focusBorder).toBe(theme.semantic.color.ring);
  });

  it("reports no halo for the badge, which owns no focusable surface", () => {
    const theme = shadcn();
    expect(Object.keys(theme.components.badge)).not.toContain("focusShadow");
    expect(drawsFocusHalo(theme, "Badge")).toBe(false);
  });

  it("gives every button variant the ring on focus, and the other themes their own border", () => {
    const shadcnTheme = shadcn();
    expect(shadcnTheme.components.button.focusBorder).toBe(shadcnTheme.semantic.color.ring);
    expect(shadcnTheme.components.button.solidFocusBorder).toBe(shadcnTheme.semantic.color.ring);
    expect(shadcnTheme.components.button.dangerSolidFocusBorder).toBe(shadcnTheme.semantic.color.ring);
    expect(shadcnTheme.components.button.ghostFocusBorder).toBe(shadcnTheme.semantic.color.ring);
    // The other themes keep the border each variant already wears.
    for (const id of ["ant-design", "fluent", "material-design"] as const) {
      const theme = resolveOdysseyTheme(odysseyThemes[id], "light", "standard");
      expect(theme.components.button.focusBorder).toBe(theme.semantic.color.border);
      expect(theme.components.button.solidFocusBorder).toBe(theme.semantic.color.primary);
      expect(theme.components.button.ghostFocusBorder).toBe("transparent");
    }
  });

  it("reports the coverage under the capability path of the contract", () => {
    expect(focusHaloPath("TextInput")).toBe("components.textInput.focusHalo");
    expect(focusHaloPath("DropdownMenu")).toBe("components.dropdownMenu.focusHalo");
    expect(focusHaloPath("EmptyState")).toBe("components.emptyState.focusHalo");
  });
});

describe("Odyssey adapter theme scoping", () => {
  const adapter = buildAdapter();
  const themes = adapter.themes as Record<string, Record<string, Record<string, unknown>>>;

  it("declares the new paths for the shadcn theme alone", () => {
    const shadcnPaths = Object.keys(themes.shadcn["light.standard"]);
    const others = Object.keys(themes["ant-design"]["light.standard"]);
    expect(shadcnPaths).toHaveLength(262);
    expect(others).toHaveLength(208);
    const added = shadcnPaths.filter((path) => !others.includes(path));
    expect(added).toHaveLength(54);
    expect(added).toContain("reference.shadow.xs");
    expect(added).toContain("components.card.shadow");
    expect(added).toContain("components.checkbox.focusHalo");
    expect(added).toContain("components.table.radius");
    expect(added).toContain("components.iconButton.radius");
    expect(added).toContain("components.button.pressMatchesHover");
    expect(added).toContain("components.button.pressDecoration");
    expect(added).toContain("components.button.disabledOpacity");
    expect(added).toContain("components.button.disabledUsesOwnColors");
    expect(added).toContain("components.textInput.disabledOpacity");
    expect(added).toContain("components.textInput.disabledUsesOwnColors");
    expect(added).toContain("components.select.disabledOpacity");
    expect(added).toContain("components.select.disabledUsesOwnColors");
    expect(added).toContain("components.checkbox.disabledOpacity");
    expect(added).toContain("components.checkbox.disabledUsesOwnColors");
    expect(added).toContain("components.switch.disabledOpacity");
    expect(added).toContain("components.switch.disabledUsesOwnColors");
    expect(added).toContain("components.tabs.disabledOpacity");
    expect(added).toContain("components.tabs.disabledUsesOwnColors");
    expect(added).toContain("components.dropdownMenu.focusUsesAccentFill");
    expect(added).toContain("components.dropdownMenu.focusUsesAccentForeground");
    expect(added).toContain("components.dropdownMenu.focusDrawsOutline");
  });

  it("keeps the path set of the other three themes the same in every mode", () => {
    for (const id of ["ant-design", "fluent", "material-design"]) {
      const paths = Object.keys(themes[id]["light.standard"]);
      expect(paths).toHaveLength(208);
      for (const mode of Object.keys(themes[id])) expect(Object.keys(themes[id][mode])).toEqual(paths);
      expect(paths.some((path) => path.endsWith(".focusHalo"))).toBe(false);
      expect(paths.some((path) => path.endsWith(".shadow"))).toBe(false);
    }
  });

  it("reports the official elevation and the coverage for the shadcn theme", () => {
    const values = themes.shadcn["light.standard"];
    expect(values["reference.shadow.xs"]).toEqual({ layers: officialRecipes.xs.layers });
    expect(values["components.card.shadow"]).toEqual({ layers: officialRecipes.sm.layers });
    expect(values["components.button.shadow"]).toEqual({ layers: [] });
    expect(values["components.table.radius"]).toBe(0);
    expect(values["components.iconButton.radius"]).toBe(8.75);
    expect(values["components.button.focusHalo"]).toBe(true);
    expect(values["components.badge.focusHalo"]).toBe(false);
    expect(values["components.card.focusHalo"]).toBe(false);
  });
});
