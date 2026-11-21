import type { OdysseyColorScheme, OdysseyDensity, OdysseyThemeDefinition } from "@odyssey/ui/types";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface DocsAppearanceConfig {
  storageKey?: string;
  defaultColorScheme?: OdysseyColorScheme;
  defaultDensity?: OdysseyDensity;
  theme?: OdysseyThemeDefinition;
}

interface DocsAppearanceState {
  colorScheme: OdysseyColorScheme;
  density: OdysseyDensity;
}

export interface DocsAppearanceValue extends DocsAppearanceState {
  setColorScheme: (value: OdysseyColorScheme) => void;
  setDensity: (value: OdysseyDensity) => void;
}

const schemes = ["system", "light", "dark"] as const satisfies readonly OdysseyColorScheme[];
const densities = ["standard", "compact"] as const satisfies readonly OdysseyDensity[];
const DocsAppearanceContext = createContext<DocsAppearanceValue | null>(null);

function valid<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return typeof value === "string" && choices.includes(value as T) ? (value as T) : fallback;
}

export function DocsAppearanceProvider({ children, config }: { children: ReactNode; config?: DocsAppearanceConfig }) {
  const storageKey = config?.storageKey ?? "odyssey:docs:appearance";
  const defaults = useMemo<DocsAppearanceState>(
    () => ({ colorScheme: config?.defaultColorScheme ?? "system", density: config?.defaultDensity ?? "standard" }),
    [config?.defaultColorScheme, config?.defaultDensity],
  );
  const [state, setState] = useState(defaults);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as Record<string, unknown> | null;
      setState({ colorScheme: valid(saved?.colorScheme, schemes, defaults.colorScheme), density: valid(saved?.density, densities, defaults.density) });
    } catch {
      setState(defaults);
    }
  }, [defaults, storageKey]);

  const update = useCallback(
    (patch: Partial<DocsAppearanceState>) =>
      setState((current) => {
        const next = { ...current, ...patch };
        if (typeof window !== "undefined") window.localStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      }),
    [storageKey],
  );
  const value = useMemo<DocsAppearanceValue>(
    () => ({ ...state, setColorScheme: (colorScheme) => update({ colorScheme }), setDensity: (density) => update({ density }) }),
    [state, update],
  );
  return <DocsAppearanceContext.Provider value={value}>{children}</DocsAppearanceContext.Provider>;
}

export function useDocsAppearance(): DocsAppearanceValue {
  const value = useContext(DocsAppearanceContext);
  if (!value) throw new Error("useDocsAppearance must be used inside DocsAppearanceProvider");
  return value;
}
