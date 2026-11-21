/**
 * The declarations a menu entry paints when it takes focus.
 *
 * The official menu recipes read a focused entry by its fill:
 * `focus:bg-accent focus:text-accent-foreground`. They declare no ring around
 * the entry, so the fill and the ink are the whole treatment — an official
 * menu entry wears neither a halo nor an outline.
 *
 * The declarations live in the token layer so the stylesheet and the
 * contract read the same fact: a stylesheet that changes the rule changes
 * what the contract reports.
 *
 * The module holds the rule alone, with no derivation on it, so a stylesheet
 * that paints the rule carries nothing but the rule.
 */
import { odysseyTokenVars } from "./web";

export const menuFocusDeclarations = `background: ${odysseyTokenVars.accent}; color: ${odysseyTokenVars.accentForeground};`;
