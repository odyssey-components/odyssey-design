import { menuFocusDeclarations } from "./menu-focus-rules";
import { odysseyTokenVars } from "./web";

/**
 * The focus semantics a menu entry paints.
 *
 * The contract publishes three facts about a focused menu entry: whether the
 * fill is the accent surface, whether the ink is the accent ink, and whether
 * the entry wears an outline around itself. All three are read off the rule
 * the stylesheet paints, so the contract states what the stack draws and the
 * two cannot drift apart.
 */
export interface OdysseyMenuFocusSemantics {
  /** The focused entry fills with the accent surface. */
  usesAccentFill: boolean;
  /** The focused entry writes its label in the accent ink. */
  usesAccentForeground: boolean;
  /** The focused entry draws an outline around itself. */
  drawsOutline: boolean;
}

/** Matches a declaration that paints an outline or a border of its own. */
const OUTLINE_DECLARATION = /(^|;)\s*(outline|border)(-[a-z]+)?\s*:/;

/**
 * The focus semantics a menu entry paints.
 *
 * The answer comes from the declarations the stylesheet paints, so a
 * stylesheet that stops filling the entry with the accent surface, or that
 * starts drawing a ring around it, is reported as one that does.
 *
 * The declarations are a parameter so the derivation can be exercised on a
 * rule of its own: the facts are read off the paint, never assumed.
 */
export function menuFocusSemantics(declarations: string = menuFocusDeclarations): OdysseyMenuFocusSemantics {
  const paint = declarations;
  return {
    usesAccentFill: paint.includes(`background: ${odysseyTokenVars.accent};`),
    usesAccentForeground: paint.includes(`color: ${odysseyTokenVars.accentForeground};`),
    drawsOutline: OUTLINE_DECLARATION.test(paint),
  };
}
