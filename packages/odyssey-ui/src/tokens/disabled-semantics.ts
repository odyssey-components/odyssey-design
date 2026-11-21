import { type DisabledFadeCapability, disabledFadePalettes, disabledFades, disabledOpacity, fadeFraction } from "./disabled-rules/index";
import { odysseyTokenVars } from "./web";

/**
 * The disabled semantics a control paints.
 *
 * The contract publishes two facts about a disabled control: the fraction it
 * fades its colours to, and whether the colours are its own. The answer is
 * read off the rules the stylesheet applies — the fade the palettes own and
 * the colours that fade paints — so a control that gives its disabled state
 * a surface of its own is reported as one that does.
 */
export interface OdysseyDisabledSemantics {
  /** The fraction of its own colours a disabled control keeps. */
  opacity: number;
  /** The disabled fill is the control's own fill faded. */
  usesOwnColors: boolean;
}

/**
 * The disabled semantics a control paints under a theme.
 *
 * The official recipe fades the whole element to half its opacity, so a
 * disabled control keeps its own fill, ink and border at half. The presets
 * paint a disabled surface and a disabled ink of their own, and fade the
 * element on top of them.
 */
export function disabledSemantics(capability: DisabledFadeCapability, themeId: string): OdysseyDisabledSemantics {
  const official = disabledFadePalettes.includes(themeId as (typeof disabledFadePalettes)[number]);
  const fade = disabledFades.find((entry) => entry.capability === capability);
  // The fade paints the control's own colours: the palette's disabled
  // surface and its disabled ink are not among the colours it uses.
  const paint = fade?.rules.map((rule) => rule.declarations).join("") ?? "";
  const usesOwnColors =
    official && fade !== undefined && !paint.includes(`${odysseyTokenVars.disabled})`) && !paint.includes(`${odysseyTokenVars.disabledForeground})`);
  // The fraction is read back out of the rules the stylesheet paints, so a
  // rule that is edited by hand reports what it actually paints. A rule
  // that fades nothing has no fraction of its own and falls back to the
  // factor the palette declares.
  const painted = fade?.rules.map((rule) => fadeFraction(rule.declarations)).filter((fraction): fraction is number => fraction !== undefined);
  const opacity = official ? (painted?.[0] ?? disabledOpacity) : (fade?.presetOpacity ?? disabledOpacity);
  return {
    opacity,
    usesOwnColors,
  };
}
