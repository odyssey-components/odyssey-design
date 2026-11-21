import { odysseyThemes, resolveOdysseyTheme } from "./theme";

/** A radius ladder in dp, so a ladder can be pinned without its rem spelling. */
function radiusDp(radius: Record<string, string>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(radius).map(([step, value]) => {
      const dp = value.endsWith("px") ? Number.parseFloat(value) : Number.parseFloat(value) * 16;
      return [step, Math.round(dp * 1000) / 1000];
    }),
  );
}

/** One radius in dp, so a component radius can be pinned without its rem spelling. */
function radiusValueDp(value: string): number {
  const dp = value.endsWith("px") ? Number.parseFloat(value) : Number.parseFloat(value) * 16;
  return Math.round(dp * 1000) / 1000;
}

/**
 * The surfaces the official recipe paints.
 *
 * The suite in `theme.test.ts` registers these groups where they stood, so
 * the runtime theme resolution suite keeps one owner, one order, and one
 * list of names.
 */
export function registerSurfaceTests(): void {
  /**
   * The official shadcn ladder is derived from the contract seed, so the
   * values below follow the seed rather than being written twice: a contract
   * that moves the seed moves the ladder with it.
   */
  it("resolves the official Shadcn radius ladder and the component radii that follow it", () => {
    const theme = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    expect(theme.reference.radius).toEqual({
      base: "0.625rem",
      xs: "0.3125rem",
      sm: "0.46875rem",
      md: "0.546875rem",
      lg: "0.625rem",
      xl: "0.9375rem",
      pill: "999px",
    });
    expect(theme.components.button.radius).toBe(theme.reference.radius.md);
    expect(theme.components.input.radius).toBe(theme.reference.radius.md);
    expect(theme.components.card.radius).toBe(theme.reference.radius.xl);
    expect(theme.components.dialog.radius).toBe(theme.reference.radius.lg);
  });

  /**
   * The two overlay elevations are the contract paths that publish them: the
   * floating surfaces wear the menu's shadow, the surfaces that float above
   * the page wear the dialog's. A theme that owns an elevation states it on
   * that path, so the published path is the one that paints.
   */
  it("resolves the overlay elevations on the contract paths that paint them", () => {
    const shadcn = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    expect(shadcn.components.menu.shadow.css).toBe(shadcn.reference.shadow.md.css);
    expect(shadcn.components.dialog.shadow.css).toBe(shadcn.reference.shadow.lg.css);

    const ant = resolveOdysseyTheme(odysseyThemes["ant-design"], "light", "standard");
    expect(ant.components.dialog.shadow.css).toBe(ant.reference.shadow.emphasis.css);
    const fluent = resolveOdysseyTheme(odysseyThemes.fluent, "light", "standard");
    expect(fluent.components.dialog.shadow.css).toBe(fluent.reference.shadow.lg.css);
  });

  /**
   * The official recipe names the radius step of every surface it paints, and
   * those steps belong to the shadcn theme alone.
   */
  it("resolves the official Shadcn surface radii", () => {
    const theme = resolveOdysseyTheme(odysseyThemes.shadcn, "light", "standard");
    expect(radiusValueDp(theme.components.badge.radius)).toBe(999);
    expect(radiusValueDp(theme.components.tooltip.radius)).toBe(8.75);
    expect(radiusValueDp(theme.components.checkbox.radius)).toBe(4);
    expect(radiusValueDp(theme.components.alert.radius)).toBe(10);
    expect(radiusValueDp(theme.components.tabs.radius)).toBe(10);
    expect(radiusValueDp(theme.components.tabs.triggerRadius)).toBe(8.75);
    expect(radiusValueDp(theme.components.skeleton.radius)).toBe(8.75);
    expect(radiusValueDp(theme.components.menu.radius)).toBe(8.75);
  });

  /**
   * The other three themes keep the baseline the contract pins: every surface
   * reads a step of that theme's own ladder, the badge is not a pill, and the
   * tab list and its trigger carry no radius at all.
   */
  it.each([
    ["ant-design", { badge: 3.6, tooltip: 3.6, checkbox: 3.6, alert: 6, tabs: 0, tabsTrigger: 0, skeleton: 3.6, menu: 9 }],
    ["fluent", { badge: 2, tooltip: 2, checkbox: 2, alert: 4, tabs: 0, tabsTrigger: 0, skeleton: 2, menu: 6 }],
    ["material-design", { badge: 2.4, tooltip: 2.4, checkbox: 2.4, alert: 4, tabs: 0, tabsTrigger: 0, skeleton: 2.4, menu: 6 }],
  ] as const)("keeps the %s surface radii on the baseline", (id, expected) => {
    for (const scheme of ["light", "dark"] as const) {
      for (const density of ["standard", "compact"] as const) {
        const theme = resolveOdysseyTheme(odysseyThemes[id], scheme, density);
        expect(radiusValueDp(theme.components.badge.radius)).toBe(expected.badge);
        expect(radiusValueDp(theme.components.tooltip.radius)).toBe(expected.tooltip);
        expect(radiusValueDp(theme.components.checkbox.radius)).toBe(expected.checkbox);
        expect(radiusValueDp(theme.components.alert.radius)).toBe(expected.alert);
        expect(radiusValueDp(theme.components.tabs.radius)).toBe(expected.tabs);
        expect(radiusValueDp(theme.components.tabs.triggerRadius)).toBe(expected.tabsTrigger);
        expect(radiusValueDp(theme.components.skeleton.radius)).toBe(expected.skeleton);
        expect(radiusValueDp(theme.components.menu.radius)).toBe(expected.menu);
      }
    }
  });

  /**
   * The official recipe's steps must not leak onto a theme that never asked
   * for them: a pill badge and rounded tabs are the shadcn theme's corners.
   */
  it("keeps the official badge and tab corners off the other themes", () => {
    for (const id of ["ant-design", "fluent", "material-design"] as const) {
      const theme = resolveOdysseyTheme(odysseyThemes[id], "light", "standard");
      expect(theme.components.badge.radius).not.toBe(theme.reference.radius.pill);
      expect(theme.components.badge.radius).toBe(theme.reference.radius.sm);
      expect(theme.components.tabs.radius).toBe("0px");
      expect(theme.components.tabs.triggerRadius).toBe("0px");
    }
  });
}

/**
 * The radius ladder each theme keeps on its own formula.
 *
 * The suite in `theme.test.ts` registers this group where it stood, so the
 * order of the runtime theme resolution suite does not change.
 */
export function registerRadiusLadderTests(): void {
  it.each([
    ["ant-design", { base: 6, xs: 3, sm: 3.6, md: 6, lg: 9, xl: 12, pill: 999 }],
    ["fluent", { base: 4, xs: 2, sm: 2, md: 4, lg: 6, xl: 8, pill: 10000 }],
    ["material-design", { base: 4, xs: 2, sm: 2.4, md: 4, lg: 6, xl: 8, pill: 999 }],
  ] as const)("keeps the %s radius ladder on its own formula", (id, expected) => {
    const theme = resolveOdysseyTheme(odysseyThemes[id], "light", "standard");
    expect(radiusDp(theme.reference.radius)).toEqual(expected);
  });
}
