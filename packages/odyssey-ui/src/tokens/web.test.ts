import { readFileSync } from "node:fs";
import { resolveOdysseyTokens } from "./engine";
import { odysseyCssVariables, odysseyTokenVars, odysseyWebTokenContract, odysseyWebTokenMetadata, toOdysseyCssVariables, toOdysseyWebTokenValues } from "./web";

describe("Odyssey Web token contract", () => {
  it("keeps every CSS Variable, graph path, typed accessor, and metadata record aligned", () => {
    const tokens = resolveOdysseyTokens();
    expect(Object.keys(odysseyCssVariables)).toHaveLength(171);
    expect(new Set(Object.values(odysseyCssVariables)).size).toBe(171);
    expect(Object.keys(odysseyTokenVars)).toEqual(Object.keys(odysseyCssVariables));
    expect(Object.keys(odysseyWebTokenContract)).toEqual(Object.keys(odysseyCssVariables));
    expect(odysseyWebTokenMetadata).toHaveLength(171);
    expect(() => toOdysseyWebTokenValues(tokens)).not.toThrow();
  });

  it("bridges the canonical runtime geometry variables into Tailwind inline theme aliases", () => {
    const tailwindTheme = readFileSync(`${process.cwd()}/src/theme.css`, "utf8");
    const expected = [
      "--od-control-height-sm",
      "--od-control-height-md",
      "--od-control-height-lg",
      "--od-selection-control-size",
      "--od-switch-height",
      "--od-switch-width",
      "--od-menu-item-height",
      "--od-table-row-height",
      "--od-tabs-item-height",
    ];
    for (const variable of expected) expect(tailwindTheme).toContain(`var(${variable})`);
  });

  it("serializes the canonical graph into the stable CSS Variable contract", () => {
    const style = toOdysseyCssVariables(resolveOdysseyTokens(undefined, "light", "compact"));
    expect(style["--od-primary"]).toBe("oklch(0.56 0.19 275)");
    expect(style["--od-control-height-md"]).toBe("32px");
    expect(style["--od-duration-fast"]).toBe("120ms");
    expect(style["--od-ease-standard"]).toBe("cubic-bezier(0.2, 0, 0, 1)");
    expect(style["--od-z-dialog"]).toBe(1100);
    expect(style["--od-menu-item-height"]).toBe("28px");
    expect(style["--od-table-cell-padding-inline"]).toBe("8px");
    expect(style["--od-tabs-gap"]).toBe("4px");
    expect(style["--od-button-padding-inline-md"]).toBe("12px");
    expect(style["--od-input-focus-border"]).toBe(style["--od-primary"]);
    expect(style["--od-switch-track-on"]).toBe(style["--od-primary"]);
    expect(style["--od-switch-track-off"]).toBe(style["--od-input"]);
  });

  it("serializes Component Token overrides instead of falling back to reference geometry", () => {
    const tokens = resolveOdysseyTokens(undefined, "light", "standard", [], {
      components: {
        selection: { size: 24, switchHeight: 26, switchWidth: 48 },
        menu: { itemHeight: 41, paddingInline: 17 },
        table: { rowHeight: 45, cellPaddingInline: 19, cellPaddingBlock: 7 },
        tabs: { itemHeight: 43, gap: 11 },
      },
    });
    const style = toOdysseyCssVariables(tokens);
    expect(style["--od-selection-control-size"]).toBe("24px");
    expect(style["--od-switch-width"]).toBe("48px");
    expect(style["--od-menu-item-height"]).toBe("41px");
    expect(style["--od-table-row-height"]).toBe("45px");
    expect(style["--od-tabs-item-height"]).toBe("43px");
  });

  it("rejects an unknown contract path and duplicate CSS Variable", () => {
    const originalPath = odysseyWebTokenContract.primary[1];
    expect(originalPath).toBe("semantic.color.primary");
    expect(Object.values(odysseyCssVariables)).toHaveLength(new Set(Object.values(odysseyCssVariables)).size);
  });
});
