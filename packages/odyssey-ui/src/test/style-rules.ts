/**
 * The CSS rules that apply to one rendered element.
 *
 * The document keeps every component's stylesheet, so a rule that belongs to
 * another component can satisfy an assertion that was meant for this one.
 * Scoping by the element's own class names keeps a witness about the component
 * it names.
 */
export function styleRulesFor(element: Element): string[] {
  const classes = [...element.classList];
  if (!classes.length) return [];
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .map((rule) => rule.cssText)
    .filter((text) => classes.some((name) => text.includes(`.${name}`)));
}

/** The declarations of the rules that match one of the given selectors. */
export function declarationsFor(element: Element, selector: string): string[] {
  return styleRulesFor(element)
    .filter((text) => text.includes(selector))
    .map((text) => {
      const body = /\{([\s\S]*)\}/.exec(text)?.[1] ?? "";
      return body
        .split(";")
        .map((declaration) => declaration.trim())
        .filter(Boolean)
        .join("; ");
    });
}
