import { DirectionProvider } from "@base-ui/react/direction-provider";
import { I18nextProvider, type OdysseyI18nInstance } from "@odyssey/i18n";
import {
  type CSSProperties,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { getInteractionRules } from "./interaction-recipes";
import { inheritedDirection, type WritingDirection } from "./internal/writing-direction";
import { type OdysseyLocale, OdysseyLocaleContext, resolveOdysseyLocale } from "./locale";
import { type OdysseyResolvedTheme, odysseyThemes, resolvedThemeToStyle, resolvedThemeToTokens, resolveOdysseyTheme } from "./theme";
import type { OdysseyComputedTokens } from "./token-contract";
import type { OdysseyResolvedTokens } from "./tokens";
import type { OdysseyColorScheme, OdysseyDensity, OdysseyThemeDefinition } from "./types";

const OdysseyPortalContext = createContext<RefObject<HTMLDivElement | null> | null>(null);
export interface OdysseyRuntimeTheme extends Omit<OdysseyResolvedTheme, "colorScheme"> {
  name: string;
  colorScheme: OdysseyColorScheme;
  resolvedColorScheme: Exclude<OdysseyColorScheme, "system">;
  tokens: OdysseyComputedTokens;
  root: RefObject<HTMLDivElement | null>;
}
const OdysseyThemeContext = createContext<OdysseyRuntimeTheme | null>(null);

export interface OdysseyProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  children: ReactNode;
  colorScheme?: OdysseyColorScheme;
  density?: OdysseyDensity;
  i18n?: OdysseyI18nInstance;
  locale?: OdysseyLocale;
  theme?: OdysseyThemeDefinition;
}

const systemSchemeQuery = "(prefers-color-scheme: dark)";
function subscribeToSystemScheme(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const media = window.matchMedia(systemSchemeQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function getSystemScheme(): "light" | "dark" {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(systemSchemeQuery).matches ? "dark" : "light";
}

function subscribeToLanguage(instance: OdysseyI18nInstance | undefined, onChange: () => void) {
  if (!instance) return () => {};
  instance.on("languageChanged", onChange);
  return () => instance.off("languageChanged", onChange);
}

function getLanguage(instance: OdysseyI18nInstance | undefined) {
  return instance?.resolvedLanguage ?? instance?.language ?? "zh-CN";
}

function interactionAttributes(theme: OdysseyResolvedTheme) {
  const attributes: Record<string, string> = {};
  for (const rule of getInteractionRules(theme.interactions)) {
    if (rule.target === "action") {
      for (const surface of rule.surfaces ?? []) attributes[`data-od-action-${surface}-feedback`] = rule.driver;
    } else {
      attributes[`data-od-${rule.target}-feedback`] = rule.driver;
    }
  }
  return attributes;
}

export function OdysseyProvider({
  children,
  colorScheme = "system",
  density = "standard",
  dir,
  i18n,
  locale,
  style,
  theme = odysseyThemes.shadcn,
  ...props
}: OdysseyProviderProps) {
  const root = useRef<HTMLDivElement>(null);
  const portalContainer = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<WritingDirection>(dir === "rtl" ? "rtl" : "ltr");
  useEffect(() => {
    if (dir === "rtl" || dir === "ltr") {
      setDirection(dir);
      return;
    }
    setDirection(inheritedDirection(root.current));
  }, [dir]);
  const systemScheme = useSyncExternalStore<"light" | "dark">(subscribeToSystemScheme, getSystemScheme, () => "light");
  const language = useSyncExternalStore(
    (onChange) => subscribeToLanguage(i18n, onChange),
    () => getLanguage(i18n),
    () => getLanguage(i18n),
  );
  const resolvedLocale = locale ?? resolveOdysseyLocale(language);
  const resolvedColorScheme = colorScheme === "system" ? systemScheme : colorScheme;
  const resolved = useMemo(() => resolveOdysseyTheme(theme, resolvedColorScheme, density), [density, resolvedColorScheme, theme]);
  const runtimeTheme = useMemo<OdysseyRuntimeTheme>(
    () => ({ ...resolved, name: theme.name, colorScheme, resolvedColorScheme, tokens: resolvedThemeToTokens(resolved), root }),
    [colorScheme, resolved, resolvedColorScheme, theme.name],
  );
  const rootStyle = useMemo(
    () => ({ ...resolvedThemeToStyle(resolved), colorScheme: resolvedColorScheme, ...style }) as CSSProperties,
    [resolved, resolvedColorScheme, style],
  );

  const content = (
    <div
      ref={root}
      data-od-root=""
      data-od-color-scheme={colorScheme}
      data-od-resolved-color-scheme={resolvedColorScheme}
      data-od-theme={theme.name}
      data-od-density={density}
      dir={dir}
      style={rootStyle}
      {...interactionAttributes(resolved)}
      {...props}
    >
      <OdysseyLocaleContext.Provider value={resolvedLocale}>
        <OdysseyThemeContext.Provider value={runtimeTheme}>
          <OdysseyPortalContext.Provider value={portalContainer}>
            <DirectionProvider direction={direction}>
              {children}
              <div ref={portalContainer} data-od-portal-host="" />
            </DirectionProvider>
          </OdysseyPortalContext.Provider>
        </OdysseyThemeContext.Provider>
      </OdysseyLocaleContext.Provider>
    </div>
  );
  return i18n ? <I18nextProvider i18n={i18n}>{content}</I18nextProvider> : content;
}

export function useOdysseyPortalContainer() {
  return useContext(OdysseyPortalContext);
}

export function useOdysseyTheme(): OdysseyRuntimeTheme {
  const theme = useContext(OdysseyThemeContext);
  if (!theme) throw new Error("useOdysseyTheme must be used inside OdysseyProvider");
  return theme;
}

export function useOdysseyTokens(): OdysseyComputedTokens | null {
  return useContext(OdysseyThemeContext)?.tokens ?? null;
}

/** Canonical resolved Web tokens for design tooling and advanced adapters. */
export function useOdysseyResolvedTokens(): OdysseyResolvedTokens | null {
  const theme = useContext(OdysseyThemeContext);
  if (!theme) return null;
  const { seed, reference, semantic, components, resolvedColorScheme: colorScheme, density } = theme;
  return { seed, reference, semantic, components, colorScheme, density };
}
