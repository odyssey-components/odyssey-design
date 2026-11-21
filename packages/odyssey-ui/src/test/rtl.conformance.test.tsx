import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { OdysseyProvider } from "../OdysseyProvider";
import { RTL_CASES } from "./rtl-cases";
import { componentRules, hasRtlMirror, physicalViolations, resolvesDirection, rtlRules, ruleSelects } from "./rtl-harness";

/**
 * Physical declarations a component may keep, each with the reason it stays
 * direction-neutral. Every other direction-dependent physical declaration
 * fails the witness, so a component cannot silently reintroduce one.
 */
const PHYSICAL_EXCEPTIONS: { property: string; selector: RegExp; reason: string }[] = [
  {
    property: "left",
    selector: /ripple/i,
    reason: "The ripple starts at the pointer position, which is physical by nature.",
  },
  {
    property: "left",
    selector: /od-Dialog-dialog/,
    reason: "The overlay is centred by a symmetric transform and the sheet spans the full inline width.",
  },
];

/** Reports the direction-dependent physical declarations a component ships without an accepted reason. */
function unexplainedViolations(component: string, container: HTMLElement, classPrefix: string): { property: string; value: string; selector: string }[] {
  const rules = componentRules(container, classPrefix);
  const mirrors = rtlRules(rules);
  return physicalViolations(component, rules).filter(
    (violation) =>
      !hasRtlMirror(violation, mirrors) &&
      !PHYSICAL_EXCEPTIONS.some((entry) => entry.property === violation.property && entry.selector.test(violation.selector)),
  );
}

describe("layout.rtl conformance", () => {
  it("witnesses every capability the contract requires on the web platform", () => {
    expect(RTL_CASES.map((testCase) => testCase.id).sort()).toEqual([
      "Alert",
      "Badge",
      "Button",
      "Card",
      "Checkbox",
      "Dialog",
      "Divider",
      "DropdownMenu",
      "EmptyState",
      "Field",
      "IconButton",
      "Pagination",
      "Popover",
      "Progress",
      "Select",
      "Skeleton",
      "Switch",
      "Tabs",
      "TextInput",
      "Tooltip",
    ]);
  });

  for (const testCase of RTL_CASES) {
    it(`${testCase.id} lays out under a right-to-left root without physical direction properties`, async () => {
      const { container } = render(<OdysseyProvider dir="rtl">{testCase.render()}</OdysseyProvider>);
      const root = testCase.root(container);
      expect(resolvesDirection(root, "rtl")).toBe(true);
      expect(unexplainedViolations(testCase.id, container, testCase.classPrefix)).toEqual([]);
    });

    it(`${testCase.id} keeps every mirrored rule reachable in a right-to-left layout`, () => {
      const { container } = render(<OdysseyProvider dir="rtl">{testCase.render()}</OdysseyProvider>);
      const rules = rtlRules(componentRules(container, testCase.classPrefix));
      for (const rule of rules) {
        const selected = Array.from(container.querySelectorAll("*")).some((element) => ruleSelects(rule, element));
        expect({ rule: rule.selectorText, selected }).toEqual({ rule: rule.selectorText, selected: true });
      }
    });

    if (testCase.dirProp) {
      it(`${testCase.id} honours an explicit direction on its own root`, async () => {
        const { container } = render(testCase.render("rtl"));
        const root = testCase.root(container);
        expect(root.getAttribute("dir")).toBe("rtl");
        expect(resolvesDirection(root, "rtl")).toBe(true);
        const rules = rtlRules(componentRules(container, testCase.classPrefix));
        for (const rule of rules) {
          const selected = Array.from(container.querySelectorAll("*")).some((element) => ruleSelects(rule, element));
          expect({ rule: rule.selectorText, selected }).toEqual({ rule: rule.selectorText, selected: true });
        }
      });
    }

    const keyboard = testCase.keyboard;
    if (keyboard) {
      it(`${testCase.id} keeps its keyboard interaction working in a right-to-left layout`, async () => {
        const user = userEvent.setup();
        const { container } = render(<OdysseyProvider dir="rtl">{testCase.render()}</OdysseyProvider>);
        await keyboard(user, container);
      });
    }
  }
});
