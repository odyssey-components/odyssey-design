import { describe, expect, it } from "vitest";
import { menuFocusDeclarations } from "./menu-focus-rules";
import { menuFocusSemantics } from "./menu-focus-semantics";
import { odysseyTokenVars } from "./web";

/**
 * The official menu focus recipe, read off the rule the stylesheet paints.
 *
 * The official shadcn menu recipes read a focused entry by its fill:
 * `focus:bg-accent focus:text-accent-foreground`, and they declare no ring
 * around it. The contract publishes three facts about that treatment, and
 * all three are read off the rule itself, so a stylesheet that changes the
 * rule changes what the contract reports.
 */
describe("the official menu focus recipe", () => {
  it("fills a focused entry with the accent surface", () => {
    expect(menuFocusSemantics().usesAccentFill).toBe(true);
  });

  it("writes the label of a focused entry in the accent ink", () => {
    expect(menuFocusSemantics().usesAccentForeground).toBe(true);
  });

  it("draws no outline around a focused entry", () => {
    expect(menuFocusSemantics().drawsOutline).toBe(false);
  });

  it("reads the fill and the ink off the rule the stylesheet paints", () => {
    expect(menuFocusDeclarations).toContain(`background: ${odysseyTokenVars.accent};`);
    expect(menuFocusDeclarations).toContain(`color: ${odysseyTokenVars.accentForeground};`);
  });

  it("reports an entry that fills itself with another surface as one that does not use the accent fill", () => {
    // The reported facts come from the declarations, not from a constant: a
    // rule that names another surface must be reported as another surface.
    const declarations = menuFocusDeclarations.replace(`background: ${odysseyTokenVars.accent};`, `background: ${odysseyTokenVars.primary};`);
    expect(menuFocusSemantics(declarations).usesAccentFill).toBe(false);
  });

  it("reports an entry that draws a ring around itself as one that does", () => {
    const declarations = `${menuFocusDeclarations} outline: 2px solid ${odysseyTokenVars.ring};`;
    expect(menuFocusSemantics(declarations).drawsOutline).toBe(true);
  });
});
