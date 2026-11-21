export type AppLang = "zh" | "en";

export function normalizeLang(input: string | null | undefined): AppLang | undefined {
  if (!input) return undefined;
  const value = String(input).trim().toLowerCase();
  if (value.startsWith("zh")) return "zh";
  if (value.startsWith("en")) return "en";
  return undefined;
}
