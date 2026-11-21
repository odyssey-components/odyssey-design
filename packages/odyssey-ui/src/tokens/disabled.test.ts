import { disabledFadeCapabilities, disabledFadePalettes, disabledFadeRules, disabledFades, disabledOpacity, disabledSemantics, fadeFraction } from "../tokens";
import { odysseyTokenVars } from "./web";

/**
 * The official disabled recipe.
 *
 * The official shadcn recipe declares `disabled:opacity-50` and no disabled
 * colours of its own, so a disabled control keeps the fill, the ink and the
 * border of its own resting state, each painted at half. A stylesheet cannot
 * fade a layer of its own accord, so the fade is mixed into the colours the
 * control owns.
 *
 * The assertions read the rules the stylesheet applies, so a rule that is
 * edited by hand fails them. Each capability is asserted on its own, so a
 * failure names the capability that broke.
 */
describe("the official disabled fade", () => {
  it.each(disabledFadeCapabilities)("fades %s's own colours to half", (capability) => {
    const fade = disabledFades.find((entry) => entry.capability === capability);
    expect(fade).toBeDefined();
    expect(fade?.rules.length ?? 0).toBeGreaterThan(0);
    for (const rule of fade?.rules ?? []) {
      expect(fadeFraction(rule.declarations)).toBe(disabledOpacity);
    }
  });

  it.each(disabledFadeCapabilities)("never paints the palette's own disabled surface or disabled ink for %s", (capability) => {
    const fade = disabledFades.find((entry) => entry.capability === capability);
    const paint = (fade?.rules ?? []).map((rule) => rule.declarations).join("");
    expect(paint).not.toContain(`${odysseyTokenVars.disabled})`);
    expect(paint).not.toContain(`${odysseyTokenVars.disabledForeground})`);
  });

  it.each(disabledFadeCapabilities)("reports the fraction and the own colours for %s", (capability) => {
    expect(disabledSemantics(capability, "shadcn")).toEqual({
      opacity: 0.5,
      usesOwnColors: true,
    });
  });

  it.each(disabledFadeCapabilities)("scopes the fade of %s to the palettes that own it", (capability) => {
    const rules = disabledFadeRules(capability);
    expect(rules).not.toBe("");
    for (const line of rules.split("\n")) {
      expect(line.startsWith('[data-od-theme="shadcn"]')).toBe(true);
    }
  });

  it("scopes the fade to the palettes that own it", () => {
    expect(disabledFadePalettes).toEqual(["shadcn"]);
  });

  it.each(disabledFadeCapabilities)("reports the preset's own opacity for %s, the palettes that keep their own disabled surface", (capability) => {
    const preset = disabledSemantics(capability, "ant-design");
    expect(preset.usesOwnColors).toBe(false);
  });
});
