/**
 * The pointer states of a control, read from the stylesheet.
 *
 * jsdom paints no pointer, so the hover and the press of a control are
 * read from the rules a browser reads: a rule applies when the element
 * carries its classes and the state the rule names. The cascade is
 * resolved the way a browser resolves it, so the value that wins is the
 * value the press really shows.
 */
export type PointerState = "hover" | "active";

const stateAttribute: Record<PointerState, string> = {
  active: "data-od-probe-active",
  hover: "data-od-probe-hover",
};

interface StyleRule {
  selector: string;
  declarations: string[];
  order: number;
  specificity: number;
}

/** Whether a media query holds in this environment. */
function mediaApplies(condition: string): boolean {
  if (!condition) return true;
  try {
    return window.matchMedia(condition).matches;
  } catch {
    return false;
  }
}

function specificityOf(selector: string) {
  const cleaned = selector.replace(/:not\(([^)]*)\)/g, "$1");
  const count = (pattern: RegExp) => (cleaned.match(pattern) ?? []).length;
  return count(/#[\w-]+/g) * 10000 + (count(/\.[\w-]+/g) + count(/\[[^\]]*\]/g) + count(/:[\w-]+/g)) * 100;
}

function collectStyleRules(): StyleRule[] {
  const rules: StyleRule[] = [];
  let order = 0;
  const walk = (list: CSSRuleList) => {
    for (const rule of list) {
      const style = rule as CSSStyleRule;
      if (!style.selectorText) {
        // A media rule paints only where its query holds, the way a
        // browser reads it. A query the environment cannot evaluate is
        // skipped: it must not take the whole stylesheet with it.
        const media = rule as CSSMediaRule;
        if (media.cssRules && mediaApplies(media.conditionText)) walk(media.cssRules);
        continue;
      }
      rules.push({
        selector: style.selectorText,
        declarations: style.style.cssText
          .split(";")
          .map((declaration) => declaration.trim())
          .filter(Boolean),
        order: order++,
        specificity: specificityOf(style.selectorText),
      });
    }
  };
  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      // A sheet the test cannot read proves nothing about a state.
    }
  }
  return rules;
}

function matchesState(element: HTMLElement, selector: string) {
  const rewritten = selector.replace(/:hover\b/g, `[${stateAttribute.hover}]`).replace(/:active\b/g, `[${stateAttribute.active}]`);
  try {
    return element.matches(rewritten);
  } catch {
    return false;
  }
}

/** The declarations the cascade leaves in force for the given states. */
export function paintFor(element: HTMLElement, states: PointerState[]) {
  for (const state of states) element.setAttribute(stateAttribute[state], "");
  try {
    return collectStyleRules()
      .filter((rule) => matchesState(element, rule.selector))
      .sort((left, right) => left.specificity - right.specificity || left.order - right.order)
      .flatMap((rule) => rule.declarations);
  } finally {
    for (const state of states) element.removeAttribute(stateAttribute[state]);
  }
}

/** The value one property carries once the cascade has had its say. */
export function paintValue(element: HTMLElement, states: PointerState[], property: string) {
  const declared = paintFor(element, states).filter((declaration) => declaration.startsWith(`${property}:`));
  return declared.length ? declared[declared.length - 1].slice(property.length + 1).trim() : undefined;
}

/** The token values a theme wrote on the root, resolved in place. */
export function resolveTokens(value: string, root: HTMLElement) {
  return value.replace(/var\((--[\w-]+)\)/g, (_match, name: string) => root.style.getPropertyValue(name).trim() || `var(${name})`);
}
