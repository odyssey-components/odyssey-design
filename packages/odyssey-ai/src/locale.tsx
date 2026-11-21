// The AI locale contract now lives with the AI presentation components in
// @odyssey/ui/ai. This module keeps the historical Odyssey AI names so the
// runtime package's public entry points stay stable.
export {
  AILocaleProvider as OdysseyAILocaleProvider,
  aiLocales as odysseyAILocales,
  createAILocale as createOdysseyAILocale,
  useAILocale as useOdysseyAILocale,
} from "@odyssey/ui/ai/locale";
export type {
  AILocale as OdysseyAILocale,
  AILocalePatch as OdysseyAILocalePatch,
} from "@odyssey/ui/ai/locale";
