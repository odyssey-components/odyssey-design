export const docsThemeValues = ["shadcn", "ant-design", "fluent", "material-design"] as const;
export const docsRadiusValues = ["default", "none", "small", "medium", "large", "full"] as const;
export const docsPrimaryValues = ["default", "blue", "indigo", "emerald", "orange", "rose"] as const;

export type DocsThemeValue = (typeof docsThemeValues)[number];
export type DocsRadiusValue = (typeof docsRadiusValues)[number];
export type DocsPrimaryValue = (typeof docsPrimaryValues)[number];

export interface DocsCustomizerSearch {
  theme?: DocsThemeValue;
  radius?: Exclude<DocsRadiusValue, "default">;
  primary?: Exclude<DocsPrimaryValue, "default">;
  compact?: true;
  density?: "standard" | "compact" | "spacious";
  dark?: true;
}

function optionalChoice<T extends readonly string[]>(value: unknown, choices: T): T[number] | undefined {
  return typeof value === "string" && choices.includes(value) && value !== "default" ? value : undefined;
}

function trueOnly(value: unknown): true | undefined {
  return value === true || value === "true" || value === 1 || value === "1" ? true : undefined;
}

export function validateCustomizerSearch(search: Record<string, unknown>): DocsCustomizerSearch {
  const theme = search.theme === "material-ui" ? "material-design" : search.theme;
  return {
    theme: optionalChoice(theme, docsThemeValues) as DocsCustomizerSearch["theme"],
    radius: optionalChoice(search.radius, docsRadiusValues) as DocsCustomizerSearch["radius"],
    primary: optionalChoice(search.primary, docsPrimaryValues) as DocsCustomizerSearch["primary"],
    ...(typeof search.density === "string" && ["standard", "compact", "spacious"].includes(search.density)
      ? { density: search.density as DocsCustomizerSearch["density"] }
      : {}),
    compact: trueOnly(search.compact),
    dark: trueOnly(search.dark),
  };
}
