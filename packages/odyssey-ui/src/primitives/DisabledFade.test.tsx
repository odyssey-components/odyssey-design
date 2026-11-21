import { readFileSync } from "node:fs";

/**
 * The official shadcn disabled recipe keeps each control's own colors at half.
 * Since the controls now ship static CSS, assert the shared stylesheet contract
 * directly instead of looking for runtime-injected style tags.
 */
const stylesheet = readFileSync("src/styles.css", "utf8");

function rule(selector: string) {
  const start = stylesheet.indexOf(selector);
  if (start < 0) throw new Error(`Missing shared style rule: ${selector}`);
  const open = stylesheet.indexOf("{", start);
  const close = stylesheet.indexOf("}", open);
  return stylesheet.slice(open + 1, close);
}

function expectFades(selector: string, properties: string[]) {
  const declarations = rule(selector);
  for (const property of properties) {
    expect(declarations).toContain(`${property}: color-mix(in oklch,`);
    expect(declarations).toContain("50%, transparent)");
  }
}

describe("the official disabled fade", () => {
  it("fades the text input's own fill, ink and border by half", () => {
    expectFades('[data-od-theme="shadcn"] .od-Input-field:disabled', ["background", "border-color", "color"]);
  });

  it("fades the select trigger's own fill, ink and border by half", () => {
    expectFades('[data-od-theme="shadcn"] .od-Select-trigger[data-disabled]', ["background", "border-color", "color"]);
  });

  it("fades the checkbox's own fill and border by half", () => {
    expectFades('[data-od-theme="shadcn"] .od-Checkbox-control[data-disabled]', ["background", "border-color", "color"]);
  });

  it("fades the switch's own track and thumb by half", () => {
    expectFades('[data-od-theme="shadcn"] .od-Switch-switch[data-disabled]', ["background", "border-color", "color"]);
    expectFades('[data-od-theme="shadcn"] .od-Switch-switch[data-disabled] .od-Switch-thumb', ["background"]);
  });

  it("fades the tab trigger's own ink by half", () => {
    expectFades('[data-od-theme="shadcn"] .od-Tabs-tab[data-disabled]', ["color"]);
  });
});
