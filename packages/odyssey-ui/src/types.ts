import type { CSSProperties } from "react";
import type { OdysseyInteractionRecipe } from "./interaction-recipes";
import type {
  OdysseyThemeAlgorithm as CanonicalThemeAlgorithm,
  OdysseyDeepPartial,
  OdysseyDesignSeed,
  OdysseyResolvedTokenPatch,
  OdysseyResolvedTokens,
} from "./tokens";

export type OdysseySize = "sm" | "md" | "lg";
export type OdysseyTone = "neutral" | "accent" | "danger";
export type OdysseyFeedbackTone = "neutral" | "info" | "success" | "warning" | "danger";
export type OdysseyColorScheme = "light" | "dark" | "system";
export type OdysseyDensity = "standard" | "compact" | "spacious";
export const odysseyBuiltinThemeIds = ["shadcn", "ant-design", "fluent", "material-design"] as const;
export type OdysseyBuiltinThemeId = (typeof odysseyBuiltinThemeIds)[number];

export interface OdysseySeedTokens extends OdysseyDesignSeed {}
export type DeepPartial<T> = OdysseyDeepPartial<T>;
export type OdysseyThemeAlgorithm = CanonicalThemeAlgorithm;
export type OdysseyThemeAlgorithmOrName = OdysseyThemeAlgorithm | string;
export type OdysseyThemeTokenOverrides = OdysseyResolvedTokenPatch;

export interface OdysseyThemeInput {
  /** Complete interaction policy reused by this theme. Individual effects are intentionally not configurable. */
  interactions?: OdysseyInteractionRecipe;
  seed?: DeepPartial<OdysseySeedTokens>;
  tokens?: OdysseyThemeTokenOverrides;
  algorithms?: readonly OdysseyThemeAlgorithmOrName[];
  schemes?: { light?: OdysseyThemeTokenOverrides; dark?: OdysseyThemeTokenOverrides };
}

export interface OdysseyThemePreset {
  id: string;
  label: string;
  theme: OdysseyThemeDefinition;
  description?: string;
  tags?: readonly string[];
}

export interface OdysseyThemeDefinition extends OdysseyThemeInput {
  name: string;
}

export type { OdysseyResolvedTokens };

export interface StyleProps {
  className?: string;
  style?: CSSProperties;
}
