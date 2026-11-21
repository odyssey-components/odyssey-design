import type { OdysseyI18nInstance } from "@odyssey/ui/i18n";
import type { OdysseyLocale } from "@odyssey/ui/locale";
import { Toaster } from "@odyssey/ui/primitives/toast";
import { TooltipProvider } from "@odyssey/ui/primitives/tooltip";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { getOdysseyThemePresets, odysseyThemes } from "@odyssey/ui/theme";
import type { OdysseyColorScheme, OdysseyDensity, OdysseyThemeDefinition } from "@odyssey/ui/types";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProLocale } from "../locale";
import { ProProvider } from "../ProProvider";

export interface ProAdminAppearanceThemeOption {
  id: string;
  label: string;
  theme: OdysseyThemeDefinition;
}

export interface ProAdminAppearanceConfig {
  storageKey: string;
  defaultColorScheme?: OdysseyColorScheme;
  defaultThemeId?: string;
  defaultDensity?: OdysseyDensity;
  themes?: readonly ProAdminAppearanceThemeOption[];
}

export interface ProAdminProviderProps {
  appearance: ProAdminAppearanceConfig;
  children: ReactNode;
  i18n?: OdysseyI18nInstance;
  uiLocale?: OdysseyLocale;
  locale?: ProLocale;
}

const schemes = ["system", "light", "dark"] as const satisfies readonly OdysseyColorScheme[];
const densities = ["standard", "compact", "spacious"] as const satisfies readonly OdysseyDensity[];

function registryThemes(): readonly ProAdminAppearanceThemeOption[] {
  return getOdysseyThemePresets().map(({ id, label, theme }) => ({ id, label, theme }));
}

export const defaultProAdminThemes: readonly ProAdminAppearanceThemeOption[] = registryThemes();

interface ProAdminAppearanceState {
  colorScheme: OdysseyColorScheme;
  themeId: string;
  density: OdysseyDensity;
}

export interface ProAdminAppearanceValue extends ProAdminAppearanceState {
  themes: readonly ProAdminAppearanceThemeOption[];
  setColorScheme: (value: OdysseyColorScheme) => void;
  setThemeId: (value: string) => void;
  setDensity: (value: OdysseyDensity) => void;
}

const ProAdminAppearanceContext = createContext<ProAdminAppearanceValue | null>(null);

const valid = <T extends string>(value: unknown, choices: readonly T[], fallback: T): T =>
  typeof value === "string" && choices.includes(value as T) ? (value as T) : fallback;
const migrateThemeId = (value: unknown): unknown => (value === "material-ui" ? "material-design" : value);

function restoreAppearance(storageKey: string, defaults: ProAdminAppearanceState, themeIds: readonly string[]): ProAdminAppearanceState {
  if (typeof window === "undefined") return defaults;
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as Record<string, unknown> | null;
    return {
      colorScheme: valid(saved?.colorScheme, schemes, defaults.colorScheme),
      themeId: valid(migrateThemeId(saved?.themeId ?? saved?.preset), themeIds, defaults.themeId),
      density: valid(saved?.density, densities, defaults.density),
    };
  } catch {
    return defaults;
  }
}

export function ProAdminProvider({ appearance, children, i18n, uiLocale, locale }: ProAdminProviderProps) {
  const themes = useMemo(() => appearance.themes ?? registryThemes(), [appearance.themes]);
  const themeIds = useMemo(() => themes.map((item) => item.id), [themes]);
  const defaults = useMemo<ProAdminAppearanceState>(() => {
    const fallbackThemeId = themeIds.includes("shadcn") ? "shadcn" : (themeIds[0] ?? "shadcn");
    return {
      colorScheme: appearance.defaultColorScheme ?? "system",
      themeId: valid(appearance.defaultThemeId, themeIds, fallbackThemeId),
      density: appearance.defaultDensity ?? "standard",
    };
  }, [appearance.defaultColorScheme, appearance.defaultDensity, appearance.defaultThemeId, themeIds]);
  const [state, setState] = useState<ProAdminAppearanceState>(defaults);

  useEffect(() => {
    const restored = restoreAppearance(appearance.storageKey, defaults, themeIds);
    setState(restored);
    try {
      window.localStorage.setItem(appearance.storageKey, JSON.stringify(restored));
    } catch {
      // Appearance remains usable when browser storage is unavailable.
    }
  }, [appearance.storageKey, defaults, themeIds]);

  const update = useCallback(
    (patch: Partial<ProAdminAppearanceState>) =>
      setState((current) => {
        const next = { ...current, ...patch };
        if (typeof window !== "undefined") window.localStorage.setItem(appearance.storageKey, JSON.stringify(next));
        return next;
      }),
    [appearance.storageKey],
  );
  const value = useMemo<ProAdminAppearanceValue>(
    () => ({
      ...state,
      themes,
      setColorScheme: (colorScheme) => update({ colorScheme }),
      setThemeId: (themeId) => update({ themeId: valid(themeId, themeIds, state.themeId) }),
      setDensity: (density) => update({ density }),
    }),
    [state, themeIds, themes, update],
  );
  const theme = themes.find((item) => item.id === state.themeId)?.theme ?? themes[0]?.theme ?? odysseyThemes.shadcn;

  return (
    <OdysseyProvider colorScheme={state.colorScheme} theme={theme} density={state.density} i18n={i18n} locale={uiLocale}>
      <TooltipProvider>
        <Toaster>
          <ProProvider locale={locale}>
            <ProAdminAppearanceContext.Provider value={value}>{children}</ProAdminAppearanceContext.Provider>
          </ProProvider>
        </Toaster>
      </TooltipProvider>
    </OdysseyProvider>
  );
}

export function useProAdminAppearance(): ProAdminAppearanceValue {
  const value = useContext(ProAdminAppearanceContext);
  if (!value) throw new Error("useProAdminAppearance must be used inside ProAdminProvider");
  return value;
}
