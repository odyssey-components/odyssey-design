import { odysseyTokenVars } from "../web";

/**
 * The disabled rules a control paints with.
 *
 * The official shadcn recipe fades a disabled control to half its opacity
 * (`disabled:opacity-50`) and gives it no disabled colours of its own: a
 * disabled control keeps the fill, the ink and the border of its own resting
 * state, each painted at half. A stylesheet cannot fade a layer of its own
 * accord, so the fade is mixed into the colours the control owns — the same
 * per-layer fade a native stack reaches by painting each of its layers at
 * half.
 *
 * The rules live in one module per capability, so a control's stylesheet
 * carries only the rules it paints with: the button's bundle must not carry
 * the select's rules.
 *
 * The lists live here so the stylesheet and the contract read the same fact:
 * a palette that is added to the fade list stops being one that keeps its own
 * colours, and the contract reports that without anyone remembering to change
 * two places.
 */

/** The capabilities whose disabled state the official recipe fades. */
export const disabledFadeCapabilities = ["button", "textInput", "select", "checkbox", "switch", "tabs"] as const;

export type DisabledFadeCapability = (typeof disabledFadeCapabilities)[number];

/** The palettes whose disabled state is the official fade. */
export const disabledFadePalettes = ["shadcn"] as const;

/** The fraction of its own colours a disabled official control keeps. */
export const disabledOpacity = 0.5;

/** One rule of a capability's disabled fade. */
export interface OdysseyDisabledRule {
  /** The selector the rule hangs on, relative to the control's own class. */
  readonly selector: string;
  /** The declarations the rule paints. */
  readonly declarations: string;
}

/** One capability's disabled fade. */
export interface OdysseyDisabledFade {
  /** The capability the fade belongs to. */
  readonly capability: DisabledFadeCapability;
  /**
   * The fraction a disabled control of this capability keeps of its own
   * colours in the palettes that do not own the official fade.
   */
  readonly presetOpacity: number;
  /** The rules the disabled state paints, in cascade order. */
  readonly rules: readonly OdysseyDisabledRule[];
}

/**
 * The colour a faded layer is painted with.
 *
 * A layer that rests on no colour at all stays on no colour: fading a
 * transparent fill would paint a colour where there was none.
 */
export function faded(value: string): string {
  if (value === "transparent") return value;
  return `color-mix(in oklch, ${value} ${disabledOpacity * 100}%, transparent)`;
}

/**
 * The fraction a faded layer is painted at, read off the rule's own mix.
 *
 * The rule is the thing the stylesheet paints, so the fraction is read back
 * out of it rather than restated from the constant the rule was written
 * with: a rule that is edited by hand reports what it actually paints.
 */
export function fadeFraction(declarations: string): number | undefined {
  const match = declarations.match(/color-mix\(in oklch, .+? ([\d.]+)%, transparent\)/);
  return match ? Number(match[1]) / 100 : undefined;
}

/** The fill, the ink and the border a rule paints, all at half. */
export function surface(fill: string, ink: string, border: string): string {
  return `background:${faded(fill)};border-color:${faded(border)};color:${faded(ink)};opacity:1;`;
}

/**
 * The rules a fade paints, scoped to the palettes that own the fade.
 *
 * The official recipe keeps the control's own colours at half, and the
 * presets keep their disabled surface and their own element opacity. A rule
 * is written without whitespace: there are many of them and they ship in
 * every bundle that carries a control.
 */
export function fadeRulesFor(fade: OdysseyDisabledFade): string {
  return disabledFadePalettes.flatMap((palette) => fade.rules.map((rule) => `[data-od-theme="${palette}"] &${rule.selector}{${rule.declarations}}`)).join("\n");
}

/**
 * The token the palette paints its disabled surface with.
 *
 * A fade that paints this colour is not painting the control's own colours,
 * and the contract reports that.
 */
export const disabledSurfaceVar = odysseyTokenVars.disabled;

/** The token the palette paints its disabled ink with. */
export const disabledInkVar = odysseyTokenVars.disabledForeground;
