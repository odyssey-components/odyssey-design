import type { CSSProperties } from "react";
import { builtinThemeContract, builtinThemeContractDigest } from "./generated/builtin-theme-contract";
import { odysseyInteractionRecipes } from "./interaction-recipes";
import { resolveThemeAlgorithms } from "./theme-algorithms";
import { shadcnSchemes } from "./themes/shadcn-schemes";
import { type OdysseyComputedTokens, odysseyCssVariables } from "./token-contract";
import {
  defaultOdysseyDesignSeed,
  mergeOdysseyDesignSeed,
  mergeOdysseyTokenGraph,
  type OdysseyResolvedTokens,
  resolveOdysseyTokens,
  toOdysseyCssVariables,
  validateOdysseyTokenOverride,
} from "./tokens";
import { shadow } from "./tokens/elevation";
import type {
  DeepPartial,
  OdysseyBuiltinThemeId,
  OdysseyColorScheme,
  OdysseyDensity,
  OdysseySeedTokens,
  OdysseyThemeDefinition,
  OdysseyThemeInput,
  OdysseyThemePreset,
  OdysseyThemeTokenOverrides,
} from "./types";
import { odysseyBuiltinThemeIds } from "./types";

export type { OdysseyThemeAlgorithmDefinition } from "./theme-algorithms";

export const defaultSeed: OdysseySeedTokens = defaultOdysseyDesignSeed;
export { builtinThemeContractDigest };

const contractColor = (value: readonly number[]) => `oklch(${value[0]} ${value[1]} ${value[2]} / ${value[3]})`;
const contractSeed = (id: OdysseyBuiltinThemeId): OdysseyThemeInput["seed"] => {
  const seed = builtinThemeContract[id].seed;
  return {
    colors: {
      primary: contractColor(seed.primary),
      neutral: contractColor(seed.neutral),
      danger: contractColor(seed.danger),
      info: contractColor(seed.info),
      success: contractColor(seed.success),
      warning: contractColor(seed.warning),
    },
    typography: { fontFamily: seed.fontFamily, fontFamilyCode: seed.fontFamilyCode, fontSize: seed.fontSize },
    geometry: { radius: seed.radius, spacingUnit: seed.spacingUnit, controlHeight: seed.controlHeight, lineWidth: seed.lineWidth },
    motion: { enabled: seed.motionEnabled, duration: seed.motionDuration, easing: seed.motionEasing },
  };
};

const themeFoundation = createOdysseyTheme("foundation", { interactions: odysseyInteractionRecipes.quiet });

const builtinThemePresets: readonly OdysseyThemePreset[] = [
  {
    id: "shadcn",
    label: "Shadcn",
    theme: createOdysseyTheme(
      "shadcn",
      {
        interactions: odysseyInteractionRecipes.quiet,
        seed: contractSeed("shadcn"),
        algorithms: ["shadcn"],
        schemes: shadcnSchemes,
      },
      themeFoundation,
    ),
    tags: ["builtin", "shadcn"],
  },
  {
    id: "ant-design",
    label: "Ant Design",
    theme: createOdysseyTheme(
      "ant-design",
      {
        interactions: odysseyInteractionRecipes.antDesign,
        seed: contractSeed("ant-design"),
        algorithms: ["ant-design"],
      },
      themeFoundation,
    ),
    tags: ["builtin", "ant"],
  },
  {
    id: "material-design",
    label: "Material Design",
    theme: createOdysseyTheme(
      "material-design",
      {
        interactions: odysseyInteractionRecipes.material,
        seed: contractSeed("material-design"),
        algorithms: ["material-design"],
      },
      themeFoundation,
    ),
    tags: ["builtin", "material"],
  },
  {
    id: "fluent",
    label: "Fluent UI",
    description: "Fluent 2 Web visual preset adapted to Odyssey components.",
    theme: createOdysseyTheme(
      "fluent",
      {
        seed: contractSeed("fluent"),
        algorithms: ["fluent"],
        interactions: odysseyInteractionRecipes.quiet,
      },
      themeFoundation,
    ),
    tags: ["builtin", "fluent", "fluent-2", "web"],
  },
] as const;

export function normalizeOdysseyBuiltinThemeId(value: unknown): OdysseyBuiltinThemeId {
  if (value === "material-ui") return "material-design";
  return builtinThemePresets.some((preset) => preset.id === value) ? (value as OdysseyBuiltinThemeId) : "shadcn";
}

const builtinPresetIds = new Set(builtinThemePresets.map((preset) => preset.id));
const odysseyThemeRegistry = new Map<string, OdysseyThemePreset>(builtinThemePresets.map((preset) => [preset.id, preset]));

export const odysseyThemePresets = Object.freeze([...builtinThemePresets]);

export function registerOdysseyThemePreset(preset: OdysseyThemePreset): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(preset.id)) throw new Error(`Theme preset id "${preset.id}" must contain only letters, numbers, underscores, or hyphens.`);
  if (odysseyThemeRegistry.has(preset.id) && builtinPresetIds.has(preset.id))
    throw new Error(`Theme preset "${preset.id}" is built-in and cannot be replaced.`);
  odysseyThemeRegistry.set(preset.id, preset);
}

export function unregisterOdysseyThemePreset(id: string): boolean {
  if (builtinPresetIds.has(id)) return false;
  return odysseyThemeRegistry.delete(id);
}

export function getOdysseyThemePreset(id: string): OdysseyThemePreset | undefined {
  return odysseyThemeRegistry.get(id);
}

export function getOdysseyThemePresets(): readonly OdysseyThemePreset[] {
  const builtins = odysseyBuiltinThemeIds.map((id) => odysseyThemeRegistry.get(id)).filter((preset): preset is OdysseyThemePreset => Boolean(preset));
  const extensions = [...odysseyThemeRegistry.values()].filter((preset) => !builtinPresetIds.has(preset.id));
  return [...builtins, ...extensions];
}

export const odysseyThemes = Object.freeze(
  Object.fromEntries(
    getOdysseyThemePresets()
      .filter((preset) => builtinPresetIds.has(preset.id))
      .map((preset) => [preset.id, preset.theme]),
  ) as Record<OdysseyBuiltinThemeId, OdysseyThemeDefinition>,
);

function mergeSeed(base: OdysseySeedTokens, patch?: DeepPartial<OdysseySeedTokens>): OdysseySeedTokens {
  return mergeOdysseyDesignSeed(base, patch) as OdysseySeedTokens;
}

function mergeTokenOverrides(base?: OdysseyThemeTokenOverrides, patch?: OdysseyThemeTokenOverrides): OdysseyThemeTokenOverrides | undefined {
  if (!base) return patch;
  if (!patch) return base;
  return mergeOdysseyTokenGraph(base, patch);
}

export interface OdysseyResolvedTheme extends OdysseyResolvedTokens {
  interactions: NonNullable<OdysseyThemeDefinition["interactions"]>;
}

export function resolveOdysseyTheme(
  definition: OdysseyThemeDefinition,
  colorScheme: Exclude<OdysseyColorScheme, "system">,
  density: OdysseyDensity,
  seedPatch?: DeepPartial<OdysseySeedTokens>,
  overrides?: OdysseyThemeTokenOverrides,
): OdysseyResolvedTheme {
  const seed = mergeSeed(mergeSeed(defaultSeed, definition.seed), seedPatch);
  const tokens = resolveOdysseyTokens(
    seed,
    colorScheme,
    density,
    resolveThemeAlgorithms(definition.algorithms),
    definition.tokens,
    definition.schemes?.[colorScheme],
    overrides,
  );
  const ring = colorScheme === "dark" ? "oklch(0.556 0 0)" : "oklch(0.708 0 0)";
  const focusRing = colorScheme === "dark" ? "oklch(0.556 0 0 / 50%)" : "oklch(0.708 0 0 / 50%)";
  // The official halo follows the ring the canonical preset paints, so it is
  // bound after the ring itself has settled.
  const halo = shadow(`0 0 0 ${tokens.reference.geometry.focusRingWidth}px ${focusRing}`);
  const focus = { focusShadow: halo, focusBorder: ring };
  const resolvedTokens =
    definition === odysseyThemes.shadcn
      ? {
          ...tokens,
          semantic: {
            ...tokens.semantic,
            color: {
              ...tokens.semantic.color,
              // Only the canonical preset uses upstream neutral ring values; brand themes stay seed-derived.
              ring,
              // The official halo is that ring at half its opacity.
              focusRing,
            },
          },
          components: {
            ...tokens.components,
            // The official focus treatment: the halo outside the control and
            // the ring colour on its border.
            button: {
              ...tokens.components.button,
              ...focus,
              // The official recipe swaps the border for the ring colour on
              // every variant; the border width is the one the variant has.
              solidFocusBorder: ring,
              dangerSolidFocusBorder: ring,
              ghostFocusBorder: ring,
            },
            iconButton: { ...tokens.components.iconButton, ...focus },
            input: {
              ...tokens.components.input,
              activeShadow: halo,
              ...focus,
            },
            checkbox: { ...tokens.components.checkbox, ...focus },
            switch: { ...tokens.components.switch, ...focus },
            tabs: { ...tokens.components.tabs, ...focus },
            pagination: { ...tokens.components.pagination, ...focus },
          },
        }
      : tokens;
  // Contract validation is deliberately unconditional so invalid production themes fail fast.
  toOdysseyCssVariables(resolvedTokens);
  return { ...resolvedTokens, interactions: definition.interactions ?? odysseyInteractionRecipes.quiet };
}

export function resolvedThemeToStyle(theme: OdysseyResolvedTheme): CSSProperties {
  return toOdysseyCssVariables(theme) as CSSProperties;
}

export function resolvedThemeToTokens(theme: OdysseyResolvedTheme): OdysseyComputedTokens {
  const variables = toOdysseyCssVariables(theme);
  return Object.fromEntries(Object.entries(odysseyCssVariables).map(([name, variable]) => [name, String(variables[variable])])) as OdysseyComputedTokens;
}

export function createOdysseyTheme(name: string, definition: OdysseyThemeInput = {}, base?: OdysseyThemeDefinition): OdysseyThemeDefinition {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error(`Theme name "${name}" must contain only letters, numbers, underscores, or hyphens.`);
  const theme: OdysseyThemeDefinition = {
    name,
    interactions: definition.interactions ?? base?.interactions,
    algorithms: [...(base?.algorithms ?? []), ...(definition.algorithms ?? [])],
    seed: {
      colors: { ...base?.seed?.colors, ...definition.seed?.colors },
      typography: { ...base?.seed?.typography, ...definition.seed?.typography },
      geometry: { ...base?.seed?.geometry, ...definition.seed?.geometry },
      motion: { ...base?.seed?.motion, ...definition.seed?.motion },
    },
    tokens: mergeTokenOverrides(base?.tokens, definition.tokens),
    schemes: {
      light: mergeTokenOverrides(base?.schemes?.light, definition.schemes?.light),
      dark: mergeTokenOverrides(base?.schemes?.dark, definition.schemes?.dark),
    },
  };
  resolveThemeAlgorithms(theme.algorithms);
  // Shape validation happens against the fully derived graph in resolveOdysseyTheme.
  return Object.freeze(theme);
}

export function assertOdysseyThemeOverride(tokens: OdysseyResolvedTokens, override: OdysseyThemeTokenOverrides): void {
  validateOdysseyTokenOverride(tokens, override);
}
