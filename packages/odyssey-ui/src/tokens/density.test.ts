import { describe, expect, it } from "vitest";
import { getOdysseyThemePresets, resolveOdysseyTheme } from "../theme";

describe("spacious density", () => {
  for (const preset of getOdysseyThemePresets()) {
    for (const scheme of ["light", "dark"] as const) {
      it(`expands ${preset.id}/${scheme} geometry and preserves visual identity`, () => {
        const standard = resolveOdysseyTheme(preset.theme, scheme, "standard");
        const spacious = resolveOdysseyTheme(preset.theme, scheme, "spacious");
        expect(spacious.density).toBe("spacious");
        expect(spacious.semantic).toEqual(standard.semantic);
        expect(spacious.reference.typography).toEqual(standard.reference.typography);
        expect(spacious.reference.radius).toEqual(standard.reference.radius);
        expect(spacious.reference.motion).toEqual(standard.reference.motion);
        expect(spacious.reference.control.heightMd).toBe(standard.reference.control.heightMd + 4);
        expect(spacious.components.table.rowHeight).toBe(standard.components.table.rowHeight + 8);
        expect(spacious.components.menu.itemHeight).toBe(standard.components.menu.itemHeight + 8);
        expect(spacious.components.button.paddingInlineMd).toBe(standard.components.button.paddingInlineMd + standard.seed.geometry.spacingUnit);
      });
    }
  }
});
