import type { UserEvent } from "@testing-library/user-event";
import type { ReactElement } from "react";

/** CSS declarations whose physical meaning flips when the writing direction mirrors. */
const PHYSICAL_PROPERTIES = [
  "left",
  "right",
  "margin-left",
  "margin-right",
  "padding-left",
  "padding-right",
  "border-left",
  "border-right",
  "border-left-color",
  "border-right-color",
  "border-left-style",
  "border-right-style",
  "border-left-width",
  "border-right-width",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
];

/** Properties that only break when they carry a physical keyword. */
const PHYSICAL_KEYWORDS: { property: string; values: string[] }[] = [
  { property: "float", values: ["left", "right"] },
  { property: "clear", values: ["left", "right"] },
  { property: "text-align", values: ["left", "right"] },
];

/** Locates the element a component exposes under a stable slot attribute. */
export function bySlot(slot: string) {
  return (container: HTMLElement) => {
    const element = container.querySelector(`[data-od-slot="${slot}"]`);
    if (!element) throw new Error(`missing [data-od-slot="${slot}"]`);
    return element as HTMLElement;
  };
}

export interface RtlCase {
  /** Contract capability id under test. */
  id: string;
  /** Stable class prefix the component stamps on its own nodes. */
  classPrefix: string;
  /** True when the component forwards a `dir` prop to its own root element. */
  dirProp?: boolean;
  /** Renders the component under test, optionally declaring an explicit direction. */
  render: (dir?: string) => ReactElement;
  /** Locates the element whose writing direction must resolve to rtl. */
  root: (container: HTMLElement) => HTMLElement;
  /** Optional keyboard behaviour that must keep working under rtl. */
  keyboard?: (user: UserEvent, container: HTMLElement) => Promise<void>;
}

export interface PhysicalViolation {
  component: string;
  selector: string;
  property: string;
  value: string;
}

/** Collects every style rule the document currently carries, including nested at-rules. */
export function styleRules(): CSSStyleRule[] {
  const rules: CSSStyleRule[] = [];
  const visit = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      const style = rule as CSSStyleRule;
      if (typeof style.selectorText === "string" && style.style) {
        rules.push(style);
      } else if ("cssRules" in rule) {
        visit((rule as CSSGroupingRule).cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules);
    } catch {
      // Cross-origin sheets are not readable and carry no component styles.
    }
  }
  return rules;
}

/** Returns the rules that belong to a component, by its stable class prefix or its rendered nodes. */
export function componentRules(container: HTMLElement, classPrefix: string): CSSStyleRule[] {
  const rendered = new Set<string>();
  for (const element of Array.from(container.querySelectorAll("*"))) {
    for (const name of Array.from(element.classList)) rendered.add(name);
  }
  return styleRules().filter((rule) => {
    if (rule.selectorText.includes(`.${classPrefix}`)) return true;
    for (const name of rendered) {
      if (rule.selectorText.includes(`.${name}`)) return true;
    }
    return false;
  });
}

/** Reports the direction-sensitive physical declarations a component still ships. */
export function physicalViolations(component: string, rules: CSSStyleRule[]): PhysicalViolation[] {
  const violations: PhysicalViolation[] = [];
  for (const rule of rules) {
    // The serialized declarations are read instead of the parsed style so a
    // shorthand such as `border: 1px solid` is not mistaken for the physical
    // `border-left` longhands the CSS object model derives from it.
    for (const declaration of rule.style.cssText.split(";")) {
      const separator = declaration.indexOf(":");
      if (separator < 0) continue;
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();
      if (!property || !value) continue;
      if ((PHYSICAL_PROPERTIES as readonly string[]).includes(property)) {
        violations.push({ component, selector: rule.selectorText, property, value });
        continue;
      }
      const keywords = PHYSICAL_KEYWORDS.find((entry) => entry.property === property);
      if (keywords && keywords.values.includes(value.toLowerCase())) {
        violations.push({ component, selector: rule.selectorText, property, value });
        continue;
      }
      if (property === "transform") {
        // A zero offset moves nothing, so only a real offset depends on the
        // writing direction.
        const offsets = [...value.matchAll(/translatex\(([^)]*)\)/gi)].map((match) => match[1].trim());
        if (offsets.some((offset) => !/^[+-]?0(?:px|%)?$/i.test(offset))) {
          violations.push({ component, selector: rule.selectorText, property, value });
        }
      }
    }
  }
  return violations;
}

const DIRECTION_MARKER = /\[dir=["']?rtl["']?\]/gi;

function selectorTargets(selector: string): string[] {
  return selector
    .split(",")
    .map((part) => part.replace(DIRECTION_MARKER, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * Reports whether a physical declaration is compensated by a right-to-left
 * mirror that targets the same element. A physical offset may only stay in the
 * stylesheet when the component ships the mirrored rule beside it.
 */
export function hasRtlMirror(violation: PhysicalViolation, rtl: CSSStyleRule[]): boolean {
  const targets = selectorTargets(violation.selector);
  return rtl.some((rule) => {
    const mirrored = selectorTargets(rule.selectorText);
    return targets.some((target) => mirrored.includes(target));
  });
}

/** Returns the rules that only apply to a right-to-left layout. */
export function rtlRules(rules: CSSStyleRule[]): CSSStyleRule[] {
  return rules.filter((rule) => /\[dir=["']?rtl["']?\]|:dir\(rtl\)/i.test(rule.selectorText));
}

/** Reports whether a rule selects the given element, ignoring pseudo-elements. */
export function ruleSelects(rule: CSSStyleRule, element: Element): boolean {
  return rule.selectorText
    .split(",")
    .map((part) =>
      part
        .trim()
        .replace(/::[\w-]+/g, "")
        .trim(),
    )
    .filter(Boolean)
    .some((selector) => {
      try {
        return element.matches(selector);
      } catch {
        return false;
      }
    });
}

/** Reports whether the element resolves the given writing direction. */
export function resolvesDirection(element: Element, expected: "ltr" | "rtl"): boolean {
  return getComputedStyle(element).direction === expected;
}
