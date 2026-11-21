import { readFileSync } from "node:fs";
import { builtinThemeContract } from "./generated/builtin-theme-contract";
import { odysseyInteractionRecipes } from "./interaction-recipes";
import {
  builtinThemeContractDigest,
  createOdysseyTheme,
  getOdysseyThemePreset,
  getOdysseyThemePresets,
  normalizeOdysseyBuiltinThemeId,
  odysseyThemes,
  registerOdysseyThemePreset,
  resolvedThemeToStyle,
  resolvedThemeToTokens,
  resolveOdysseyTheme,
  unregisterOdysseyThemePreset,
} from "./theme";
import { registerRadiusLadderTests, registerSurfaceTests } from "./theme.surfaces.tests";
import { odysseyCssVariables } from "./token-contract";
import { odysseyContrastRatio, parseOdysseyColor, shadow } from "./tokens";
import { odysseyBuiltinThemeIds } from "./types";

describe("runtime theme resolution", () => {
  it("exposes semantic theme aliases and runtime geometry through Tailwind theme variables", () => {
    const tailwindTheme = readFileSync(`${process.cwd()}/src/theme.css`, "utf8");
    expect(tailwindTheme).toContain("--color-primary: var(--od-primary)");
    expect(tailwindTheme).toContain("--font-sans: var(--od-font-sans)");
    expect(tailwindTheme).toContain("--spacing-control-height-md: var(--od-control-height-md)");
    expect(tailwindTheme).toContain("--spacing-switch-width: var(--od-switch-width)");
    expect(tailwindTheme).toContain("--radius-dialog: var(--od-dialog-radius)");
    expect(tailwindTheme).toContain("--shadow-card: var(--od-card-shadow)");
    expect(tailwindTheme).toContain("--z-index-dialog: var(--od-z-dialog)");
  });

  it("keeps the complete public CSS Variable contract", () => {
    const resolved = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    const style = resolvedThemeToStyle(resolved) as Record<string, string | number>;
    const tokens = resolvedThemeToTokens(resolved);
    expect(Object.keys(odysseyCssVariables)).toHaveLength(171);
    expect(Object.keys(style).sort()).toEqual(Object.values(odysseyCssVariables).sort());
    for (const [role, variable] of Object.entries(odysseyCssVariables)) expect(String(style[variable])).toBe(tokens[role as keyof typeof tokens]);
  });

  it("derives semantic and component tokens from a theme", () => {
    const custom = createOdysseyTheme("brand", { seed: { colors: { primary: "#1677ff" } } }, odysseyThemes.shadcn);
    const theme = resolveOdysseyTheme(custom, "light", "standard");
    expect(theme.semantic.color.primary).toBe("#1677ff");
    expect(theme.reference.typography.fontEditorial).toContain("Georgia");
    expect(resolvedThemeToStyle(theme)).toHaveProperty("--od-primary", "#1677ff");
  });

  it("keeps a custom Shadcn-derived theme's ring tied to its brand seed", () => {
    const seed = { colors: { primary: "#1677ff" } };
    const generic = resolveOdysseyTheme(createOdysseyTheme("brand-base", { seed }), "dark", "standard");
    const shadcnDerived = resolveOdysseyTheme(createOdysseyTheme("brand-shadcn", { seed }, odysseyThemes.shadcn), "dark", "standard");
    expect(shadcnDerived.semantic.color.ring).toBe(generic.semantic.color.ring);
  });

  it("deeply extends seed, scheme, component, and interaction values", () => {
    const base = createOdysseyTheme("base", {
      interactions: odysseyInteractionRecipes.material,
      seed: { geometry: { radius: 6, spacingUnit: 5 } },
      tokens: { components: { card: { shadow: shadow("none") } } },
      schemes: { dark: { semantic: { color: { background: "oklch(0.2 0 0)" } } } },
    });
    const child = createOdysseyTheme("child", { seed: { geometry: { radius: 12 } } }, base);
    const theme = resolveOdysseyTheme(child, "dark", "standard");
    expect(theme.seed.geometry.radius).toBe(12);
    expect(theme.seed.geometry.spacingUnit).toBe(5);
    expect(theme.components.card.shadow.css).toBe("none");
    expect(theme.semantic.color.background).toBe("oklch(0.2 0 0)");
    expect(theme.interactions).toBe(odysseyInteractionRecipes.material);
  });

  it("supports compact density and disabled motion", () => {
    const custom = createOdysseyTheme("still", { seed: { motion: { enabled: false } } }, odysseyThemes.shadcn);
    const style = resolvedThemeToStyle(resolveOdysseyTheme(custom, "light", "compact"));
    expect(style).toHaveProperty("--od-duration-fast", "0ms");
    expect(style).toHaveProperty("--od-duration-normal", "0ms");
    expect(style).toHaveProperty("--od-control-height-md", "32px");
    expect(style).toHaveProperty("--od-space-2", "4px");
    expect(style).toHaveProperty("--od-space-8", "24px");
    expect(style).toHaveProperty("--od-item-height", "28px");
    expect(style).toHaveProperty("--od-selection-control-size", "18px");
    expect(style).toHaveProperty("--od-switch-height", "22px");
    expect(style).toHaveProperty("--od-switch-width", "40px");
  });

  it("keeps standard density geometry and typography stable", () => {
    const standard = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    const compact = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "compact");
    expect(standard.reference).toEqual(
      expect.objectContaining({
        space: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 },
        control: expect.objectContaining({ itemHeight: 36 }),
        selection: { controlSize: 20, switchHeight: 24, switchWidth: 44 },
      }),
    );
    expect(compact.reference.space).toEqual({ 1: 4, 2: 4, 3: 8, 4: 12, 6: 16, 8: 24 });
    expect(compact.reference.typography.size.md).toBe(standard.reference.typography.size.md);
  });

  it("applies algorithms in declaration order with accumulated tokens", () => {
    const theme = createOdysseyTheme("ordered", {
      algorithms: [
        () => ({ reference: { typography: { weight: { medium: 600 } } } }),
        ({ reference }) => ({ components: { button: { fontWeight: reference.typography.weight.medium } } }),
      ],
    });
    expect(resolveOdysseyTheme(theme, "light", "standard").components.button.fontWeight).toBe(600);
  });

  it("registers and unregisters custom presets without replacing built-ins", () => {
    const preset = { id: "brand-test", label: "Brand", theme: createOdysseyTheme("brand-test") };
    registerOdysseyThemePreset(preset);
    expect(getOdysseyThemePreset("brand-test")).toBe(preset);
    expect(getOdysseyThemePresets()).toContain(preset);
    expect(unregisterOdysseyThemePreset("brand-test")).toBe(true);
    expect(getOdysseyThemePreset("default")).toBeUndefined();
    expect(getOdysseyThemePresets().map(({ id }) => id)).toEqual(["shadcn", "ant-design", "fluent", "material-design"]);
    expect(normalizeOdysseyBuiltinThemeId("default")).toBe("shadcn");
    expect(normalizeOdysseyBuiltinThemeId("material-ui")).toBe("material-design");
  });

  it("resolves every built-in from the shared Theme contract seed", () => {
    expect(builtinThemeContractDigest).toMatch(/^[a-f0-9]{64}$/);
    for (const id of odysseyBuiltinThemeIds) {
      const theme = resolveOdysseyTheme(odysseyThemes[id], "light", "standard");
      const seed = builtinThemeContract[id].seed;
      expect(theme.seed.geometry).toEqual({ radius: seed.radius, spacingUnit: seed.spacingUnit, controlHeight: seed.controlHeight, lineWidth: seed.lineWidth });
      expect(theme.seed.motion).toEqual({ enabled: seed.motionEnabled, duration: seed.motionDuration, easing: seed.motionEasing });
      expect(theme.seed.colors.primary).toBe(`oklch(${seed.primary[0]} ${seed.primary[1]} ${seed.primary[2]} / ${seed.primary[3]})`);
    }
  });

  it("keeps the Ant Design preset's key semantics", () => {
    const theme = resolveOdysseyTheme(odysseyThemes["ant-design"], "light", "standard");
    expect(theme.components.button.fontWeight).toBe(400);
    expect(theme.components.card.headerDividerWidth).toBe(1);
    expect(theme.components.card.headerPaddingBlockEnd).toBe(theme.reference.space[6]);
    expect(theme.components.card.footerPaddingBlockStart).toBe(theme.reference.space[6]);
    expect(theme.reference.control.heightMd).toBe(32);
  });

  it.each(["light", "dark"] as const)("keeps shadcn accent selection distinct from disabled state in %s mode", (scheme) => {
    const theme = resolveOdysseyTheme(odysseyThemes.shadcn, scheme, "standard");
    const { accent, accentForeground, disabled, disabledForeground } = theme.semantic.color;

    expect(accent).not.toBe(disabled);
    expect(accentForeground).not.toBe(disabledForeground);
    expect(odysseyContrastRatio(parseOdysseyColor(accentForeground), parseOdysseyColor(accent))).toBeGreaterThanOrEqual(4.5);
  });

  it("uses official primary and input recipes for Shadcn switches", () => {
    const light = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    const dark = resolveOdysseyTheme(odysseyThemes.shadcn, "dark", "standard");
    expect(light.components.switch.trackOn).toBe(light.semantic.color.primary);
    expect(light.components.switch.trackOff).toBe(light.semantic.color.input);
    expect(dark.components.switch.trackOn).toBe(dark.semantic.color.primary);
    expect(dark.components.switch.trackOff).toBe("oklch(1 0 0 / 12%)");
  });

  it.each([
    ["light", "oklch(0.708 0 0)"],
    ["dark", "oklch(0.556 0 0)"],
  ] as const)("uses the neutral Shadcn ring in %s for the native focus alias", (scheme, ring) => {
    for (const density of ["standard", "compact"] as const) {
      const theme = resolveOdysseyTheme(odysseyThemes.shadcn, scheme, density);
      expect(theme.semantic.color.ring).toBe(ring);
      expect(theme.semantic.color.focusIndicator).toBe(ring);
    }
  });

  registerSurfaceTests();

  it.each([
    [
      "light",
      "oklch(0.708 0 0 / 50%)",
      "oklch(0.646 0.222 41.116)",
      "oklch(0.6 0.118 184.704)",
      "oklch(0.398 0.07 227.392)",
      "oklch(0.828 0.189 84.429)",
      "oklch(0.769 0.188 70.08)",
      "oklch(0.985 0 0)",
      "oklch(0.145 0 0)",
      "oklch(0.488 0.243 264.376)",
      "oklch(0.985 0 0)",
      "oklch(0.97 0 0)",
      "oklch(0.205 0 0)",
      "oklch(0.922 0 0)",
      "oklch(0.708 0 0)",
    ],
    [
      "dark",
      "oklch(0.556 0 0 / 50%)",
      "oklch(0.488 0.243 264.376)",
      "oklch(0.696 0.17 162.48)",
      "oklch(0.769 0.188 70.08)",
      "oklch(0.627 0.265 303.9)",
      "oklch(0.645 0.246 16.439)",
      "oklch(0.205 0 0)",
      "oklch(0.985 0 0)",
      "oklch(0.488 0.243 264.376)",
      "oklch(0.985 0 0)",
      "oklch(0.269 0 0)",
      "oklch(0.985 0 0)",
      "oklch(1 0 0 / 10%)",
      "oklch(0.556 0 0)",
    ],
  ] as const)(
    "pins the official Shadcn semantic colours in %s",
    (scheme, focusRing, chart1, chart2, chart3, chart4, chart5, sidebar, sidebarForeground, sidebarPrimary, sidebarPrimaryForeground, sidebarAccent, sidebarAccentForeground, sidebarBorder, sidebarRing) => {
      const theme = resolveOdysseyTheme(odysseyThemes.shadcn, scheme, "standard");
      expect(theme.semantic.color).toMatchObject({
        focusRing,
        chart1,
        chart2,
        chart3,
        chart4,
        chart5,
        sidebar,
        sidebarForeground,
        sidebarPrimary,
        sidebarPrimaryForeground,
        sidebarAccent,
        sidebarAccentForeground,
        sidebarBorder,
        sidebarRing,
      });
    },
  );

  it.each([
    ["light", "oklch(0.708 0 0 / 50%)"],
    ["dark", "oklch(0.556 0 0 / 50%)"],
  ] as const)("paints the official focus halo in %s as a spread ring", (scheme, focusRing) => {
    const theme = resolveOdysseyTheme(odysseyThemes.shadcn, scheme, "standard");
    expect(theme.semantic.color.focusRing).toBe(focusRing);
    expect(theme.components.input.activeShadow.css).toBe(`0 0 0 3px ${focusRing}`);
    expect(theme.components.input.focusBorder).toBe(theme.semantic.color.ring);
  });

  registerRadiusLadderTests();

  it.each([
    ["light", "standard", "#0f6cbd", "#ffffff", 32, 44, 20, 40],
    ["light", "compact", "#0f6cbd", "#ffffff", 28, 36, 18, 36],
    ["dark", "standard", "#115ea3", "#292929", 32, 44, 20, 40],
    ["dark", "compact", "#115ea3", "#292929", 28, 36, 18, 36],
  ] as const)("resolves the Fluent 2 Web preset for %s/%s", (scheme, density, primary, background, height, rowHeight, selectionSize, switchWidth) => {
    const theme = resolveOdysseyTheme(odysseyThemes.fluent, scheme, density);
    expect(theme).toMatchObject({
      colorScheme: scheme,
      density,
      semantic: { color: { background, primary, focusIndicator: scheme === "dark" ? "#ffffff" : "#000000" } },
      reference: {
        control: { heightMd: height },
        radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem", xl: "0.5rem" },
        typography: { size: { md: "0.875rem" }, weight: { semibold: 600 } },
      },
      components: {
        button: { fontWeight: 600, paddingInlineSm: 8, paddingInlineMd: 12, paddingInlineLg: 16 },
        input: { focusBorder: scheme === "dark" ? "#adadad" : "#616161" },
        selection: { size: selectionSize, switchWidth },
        table: { rowHeight },
      },
    });
    expect(theme.interactions).toBe(odysseyInteractionRecipes.quiet);
    expect(
      odysseyContrastRatio(parseOdysseyColor(theme.semantic.color.primaryForeground), parseOdysseyColor(theme.semantic.color.primary)),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      odysseyContrastRatio(parseOdysseyColor(theme.semantic.color.focusIndicator), parseOdysseyColor(theme.semantic.color.background)),
    ).toBeGreaterThanOrEqual(3);
  });

  it("keeps Fluent component recipes while allowing brand and radius seed customization", () => {
    const custom = createOdysseyTheme("fluent-custom", { seed: { colors: { primary: "#7c3aed" }, geometry: { radius: 12 } } }, odysseyThemes.fluent);
    const theme = resolveOdysseyTheme(custom, "light", "standard");
    expect(theme.semantic.color.primary).toBe("#7c3aed");
    expect(theme.reference.radius.md).toBe("0.75rem");
    expect(theme.components.button).toMatchObject({ fontWeight: 600, paddingInlineMd: 12, radius: "0.75rem" });
    expect(theme.semantic.color.background).toBe("#ffffff");

    const lightBrand = resolveOdysseyTheme(
      createOdysseyTheme("fluent-light-brand", { seed: { colors: { primary: "#fbbf24" } } }, odysseyThemes.fluent),
      "light",
      "standard",
    );
    expect(lightBrand.semantic.color.primaryForeground).not.toBe("#ffffff");
    expect(
      odysseyContrastRatio(parseOdysseyColor(lightBrand.semantic.color.primaryForeground), parseOdysseyColor(lightBrand.semantic.color.primary)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("rejects unsafe theme names", () => {
    expect(() => createOdysseyTheme('bad"]')).toThrow(/Theme name/);
  });

  it("always rejects invalid semantic colors", () => {
    const theme = createOdysseyTheme("invalid-color", { tokens: { semantic: { color: { primary: "not-a-color" } } } });
    expect(() => resolveOdysseyTheme(theme, "light", "standard")).toThrow(/Invalid Odyssey color token/);
  });
});
