import {
  defaultOdysseyDesignSeed,
  defineOdysseyTokens,
  mergeOdysseyDesignSeed,
  odysseyColorWithAlpha,
  odysseyContrastRatio,
  parseOdysseyColor,
  resolveOdysseyTokens,
} from "./index";

describe("Odyssey canonical token engine", () => {
  it("resolves the complete scheme and density matrix", () => {
    for (const colorScheme of ["light", "dark"] as const) {
      for (const density of ["standard", "compact"] as const) {
        const tokens = resolveOdysseyTokens(defaultOdysseyDesignSeed, colorScheme, density);
        expect(tokens).toMatchObject({
          colorScheme,
          density,
          seed: defaultOdysseyDesignSeed,
          reference: { space: density === "compact" ? { 1: 4, 2: 4, 3: 8, 4: 12, 6: 16, 8: 24 } : { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 } },
          components: {
            menu: { itemHeight: density === "compact" ? 28 : 36 },
            selection: density === "compact" ? { size: 18, switchHeight: 22, switchWidth: 40 } : { size: 20, switchHeight: 24, switchWidth: 44 },
          },
        });
        expect(Object.keys(tokens.semantic.color)).toHaveLength(47);
        expect(Object.keys(tokens.components).sort()).toEqual([
          "alert",
          "badge",
          "button",
          "card",
          "checkbox",
          "dialog",
          "iconButton",
          "input",
          "menu",
          "overlay",
          "pagination",
          "selection",
          "skeleton",
          "switch",
          "table",
          "tabs",
          "tooltip",
        ]);
        expect(tokens.components.switch.trackOn).toBe(tokens.semantic.color.primary);
        expect(tokens.components.switch.trackOff).toBe(tokens.semantic.color.input);
      }
    }
  });

  it("derives stable standard and compact references", () => {
    const standard = resolveOdysseyTokens();
    const compact = resolveOdysseyTokens(defaultOdysseyDesignSeed, "light", "compact");
    expect(standard.reference.space).toEqual({ 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 });
    expect(compact.reference.space).toEqual({ 1: 4, 2: 4, 3: 8, 4: 12, 6: 16, 8: 24 });
    expect(compact.components.selection).toEqual({ size: 18, switchHeight: 22, switchWidth: 40 });
  });

  /**
   * The per-surface radii belong to the theme: the generic derivation gives
   * every surface the baseline step of the theme's own ladder, so a theme that
   * never asked for the official recipe keeps the corners it always had.
   */
  it("derives the baseline surface radii from the theme's own ladder", () => {
    const tokens = resolveOdysseyTokens(defaultOdysseyDesignSeed, "light", "standard");
    expect(tokens.components.badge.radius).toBe(tokens.reference.radius.sm);
    expect(tokens.components.tooltip.radius).toBe(tokens.reference.radius.sm);
    expect(tokens.components.checkbox.radius).toBe(tokens.reference.radius.sm);
    expect(tokens.components.skeleton.radius).toBe(tokens.reference.radius.sm);
    expect(tokens.components.alert.radius).toBe(tokens.reference.radius.md);
    expect(tokens.components.menu.radius).toBe(tokens.reference.radius.lg);
    // The tab list and its trigger are a strip of the page: no radius.
    expect(tokens.components.tabs.radius).toBe("0px");
    expect(tokens.components.tabs.triggerRadius).toBe("0px");
  });

  /**
   * Expected values are written by hand from the v2 contract, not produced by
   * the resolver under test. The seed is deliberately non-default and its
   * spacing unit is deliberately fractional, so a resolver that rounded or
   * assumed integer units would fail here.
   */
  it("tracks a non-default seed through both densities", () => {
    const seed = mergeOdysseyDesignSeed(defaultOdysseyDesignSeed, { geometry: { spacingUnit: 4.5, controlHeight: 40 } });
    const standard = resolveOdysseyTokens(seed, "light", "standard");
    const compact = resolveOdysseyTokens(seed, "light", "compact");

    expect(standard.reference.space).toEqual({ 1: 4.5, 2: 9, 3: 13.5, 4: 18, 6: 27, 8: 36 });
    expect(standard.reference.control).toMatchObject({ heightSm: 36, heightMd: 40, heightLg: 44, paddingSm: 13.5, paddingMd: 18, paddingLg: 27, gap: 9 });
    expect(compact.reference.space).toEqual({ 1: 4.5, 2: 4.5, 3: 9, 4: 13.5, 6: 18, 8: 27 });
    expect(compact.reference.control).toMatchObject({ heightSm: 32, heightMd: 36, heightLg: 40, paddingSm: 9, paddingMd: 13.5, paddingLg: 18, gap: 4.5 });

    // Per-density rather than per-seed, so a different seed must not move them.
    expect(standard.reference.control.itemHeight).toBe(36);
    expect(compact.reference.control.itemHeight).toBe(28);
    expect(standard.reference.selection).toEqual({ controlSize: 20, switchHeight: 24, switchWidth: 44 });
    expect(compact.reference.selection).toEqual({ controlSize: 18, switchHeight: 22, switchWidth: 40 });

    // Component tokens must still be reached through the reference graph.
    expect(standard.components.menu.itemHeight).toBe(36);
    expect(compact.components.menu.itemHeight).toBe(28);
    expect(standard.components.table).toMatchObject({ rowHeight: 36, cellPaddingInline: 13.5, cellPaddingBlock: 9 });
    expect(compact.components.table).toMatchObject({ rowHeight: 28, cellPaddingInline: 9, cellPaddingBlock: 4.5 });
    expect(standard.components.tabs).toMatchObject({ itemHeight: 36, gap: 4.5 });
    expect(compact.components.tabs).toMatchObject({ itemHeight: 28, gap: 4.5 });
  });

  /** Density is a geometry input; it must not reach colour, typography, motion or radius. */
  it("leaves semantics typography motion and radius unchanged by density", () => {
    const nonDefaultSeed = mergeOdysseyDesignSeed(defaultOdysseyDesignSeed, { geometry: { spacingUnit: 4.5, controlHeight: 40 } });

    for (const seed of [defaultOdysseyDesignSeed, nonDefaultSeed]) {
      const standard = resolveOdysseyTokens(seed, "dark", "standard");
      const compact = resolveOdysseyTokens(seed, "dark", "compact");

      for (const tokens of [standard, compact]) {
        expect(tokens.reference.typography.lineHeight).toEqual({ tight: 1.25, normal: 1.5 });
        expect(tokens.reference.typography.size).toEqual({ xs: "0.75rem", sm: "0.8125rem", md: "0.875rem", lg: "1rem", xl: "1.25rem" });
        expect(tokens.reference.radius).toEqual({ base: "0.5rem", xs: "0.25rem", sm: "0.3rem", md: "0.5rem", lg: "0.75rem", xl: "1rem", pill: "999px" });
        expect(tokens.reference.motion).toMatchObject({ fast: 120, normal: 180, slow: 240 });
        expect(tokens.reference.geometry).toEqual({ lineWidth: 1, focusRingWidth: 3, interactiveTargetMin: 44 });
      }

      expect(standard.semantic.color).toEqual(compact.semantic.color);
      expect(standard.reference.typography).toEqual(compact.reference.typography);
      expect(standard.reference.radius).toEqual(compact.reference.radius);
      expect(standard.reference.motion).toEqual(compact.reference.motion);
      expect(standard.reference.selection).not.toEqual(compact.reference.selection);
    }
  });

  /**
   * The official roles every theme carries when the theme does not pin its
   * own: the chart ramp reads the seed's five colours, the sidebar mirrors
   * the surfaces the page already has, and the halo is the ring at half its
   * opacity.
   */
  it("derives the official chart, sidebar and focus roles from the theme it carries", () => {
    const tokens = resolveOdysseyTokens(defaultOdysseyDesignSeed, "light", "standard");
    const { color } = tokens.semantic;
    expect(color.chart1).toBe(defaultOdysseyDesignSeed.colors.primary);
    expect(color.chart2).toBe(defaultOdysseyDesignSeed.colors.info);
    expect(color.chart3).toBe(defaultOdysseyDesignSeed.colors.success);
    expect(color.chart4).toBe(defaultOdysseyDesignSeed.colors.warning);
    expect(color.chart5).toBe(defaultOdysseyDesignSeed.colors.danger);
    expect(color.sidebar).toBe(color.card);
    expect(color.sidebarForeground).toBe(color.foreground);
    expect(color.sidebarPrimary).toBe(color.primary);
    expect(color.sidebarPrimaryForeground).toBe(color.primaryForeground);
    expect(color.sidebarAccent).toBe(color.accent);
    expect(color.sidebarAccentForeground).toBe(color.accentForeground);
    expect(color.sidebarBorder).toBe(color.border);
    expect(color.sidebarRing).toBe(color.ring);
    expect(color.focusRing).toBe(odysseyColorWithAlpha(color.ring, 0.5));
    // The halo is painted as a spread ring, so a focused control is
    // distinguishable without relying on colour.
    expect(tokens.components.input.activeShadow.css).toBe(`0 0 0 3px ${color.focusRing}`);
    // The floating surfaces sit one elevation step below the dialog, and both
    // levels are the contract paths that paint them.
    expect(tokens.components.menu.shadow).toBe(tokens.reference.shadow.md);
    expect(tokens.components.dialog.shadow).toBe(tokens.reference.shadow.lg);
  });

  it("uses structured reference colors and rejects unsupported seed colors", () => {
    expect(parseOdysseyColor("#1677ff")).toMatchObject({ space: "oklch", alpha: 1 });
    expect(resolveOdysseyTokens().reference.color.primary[0]).toMatchObject({ space: "oklch" });
    expect(() => parseOdysseyColor("rebeccapurple")).toThrow(/Unsupported/);
  });

  it("derives readable foreground pairs for both schemes", () => {
    for (const scheme of ["light", "dark"] as const) {
      const value = resolveOdysseyTokens(defaultOdysseyDesignSeed, scheme).semantic.color;
      expect(odysseyContrastRatio(parseOdysseyColor(value.primaryForeground), parseOdysseyColor(value.primary))).toBeGreaterThanOrEqual(4.5);
      expect(odysseyContrastRatio(parseOdysseyColor(value.destructiveForeground), parseOdysseyColor(value.destructive))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("never stores CSS Variable references in the resolved graph", () => {
    expect(JSON.stringify(resolveOdysseyTokens())).not.toMatch(/var\(--od-/);
  });

  it("deeply merges and validates seed groups", () => {
    expect(mergeOdysseyDesignSeed(defaultOdysseyDesignSeed, { geometry: { radius: 12 } }).geometry).toEqual({
      radius: 12,
      spacingUnit: 4,
      controlHeight: 36,
      lineWidth: 1,
    });
    expect(() => mergeOdysseyDesignSeed(defaultOdysseyDesignSeed, { geometry: { controlHeight: -1 } })).toThrow(/geometry\.controlHeight/);
  });

  it("defines and validates the complete TypeScript seed schema", () => {
    expect(defineOdysseyTokens({ ...defaultOdysseyDesignSeed })).toEqual(defaultOdysseyDesignSeed);
    expect(() => defineOdysseyTokens({ ...defaultOdysseyDesignSeed, geometry: { ...defaultOdysseyDesignSeed.geometry, spacingUnit: 0 } })).toThrow(
      /geometry\.spacingUnit/,
    );
    expect(() => defineOdysseyTokens({ ...defaultOdysseyDesignSeed, colors: { ...defaultOdysseyDesignSeed.colors, primary: "rebeccapurple" } })).toThrow(
      /Unsupported Odyssey seed color/,
    );
  });

  it("applies algorithms in order and validates every override", () => {
    const tokens = resolveOdysseyTokens(
      defaultOdysseyDesignSeed,
      "light",
      "standard",
      [() => ({ reference: { control: { itemHeight: 40 } } }), (current) => ({ components: { menu: { itemHeight: current.reference.control.itemHeight } } })],
      { components: { menu: { paddingInline: 10 } } },
    );
    expect(tokens.components.menu).toMatchObject({ itemHeight: 40, paddingInline: 10, radius: "0.75rem" });
    expect(() => resolveOdysseyTokens(defaultOdysseyDesignSeed, "light", "standard", [], { components: { missing: { size: 1 } } } as never)).toThrow(
      /Unknown Odyssey token override/,
    );
    expect(() => resolveOdysseyTokens(defaultOdysseyDesignSeed, "light", "standard", [], { components: { menu: { itemHeight: "40px" } } } as never)).toThrow(
      /override type/,
    );
  });
});
