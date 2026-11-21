import { buttonDisabledFade } from "./button";
import { checkboxDisabledFade } from "./checkbox";
import { selectDisabledFade } from "./select";
import { type DisabledFadeCapability, fadeRulesFor, type OdysseyDisabledFade } from "./shared";
import { switchDisabledFade } from "./switch";
import { tabsDisabledFade } from "./tabs";
import { textInputDisabledFade } from "./textInput";

export { buttonDisabledFade, buttonDisabledFadeRules } from "./button";
export { checkboxDisabledFade, checkboxDisabledFadeRules } from "./checkbox";
export { selectDisabledFade, selectDisabledFadeRules } from "./select";
export * from "./shared";
export { switchDisabledFade, switchDisabledFadeRules } from "./switch";
export { tabsDisabledFade, tabsDisabledFadeRules } from "./tabs";
export { textInputDisabledFade, textInputDisabledFadeRules } from "./textInput";

/**
 * The fades the official recipe paints, one entry per capability.
 *
 * The list is the contract's own view of the rules: a capability that stops
 * fading its own colours is reported as one that does not.
 */
export const disabledFades: readonly OdysseyDisabledFade[] = [
  buttonDisabledFade,
  textInputDisabledFade,
  selectDisabledFade,
  checkboxDisabledFade,
  switchDisabledFade,
  tabsDisabledFade,
];

/**
 * The rules that fade a disabled control of the official recipe.
 *
 * The rules are scoped to the palettes that own the fade: the official recipe
 * keeps the control's own colours at half, and the presets keep their
 * disabled surface and their own element opacity.
 *
 * A control asks for its own capability's rules, so a stylesheet carries only
 * the rules it paints with.
 */
export function disabledFadeRules(capability?: DisabledFadeCapability): string {
  const fades = capability ? disabledFades.filter((fade) => fade.capability === capability) : disabledFades;
  return fades.map((fade) => fadeRulesFor(fade)).join("\n");
}
