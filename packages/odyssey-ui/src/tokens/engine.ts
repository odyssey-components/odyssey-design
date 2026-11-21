import { adjustOdysseyColor, odysseyColorWithAlpha, parseOdysseyColor, readableOdysseyForeground, serializeOdysseyColor, setOdysseyColorTone } from "./color";
import { expandSpaciousReference, expandSpaciousTokens } from "./density";
import { shadow } from "./elevation";
import { defaultOdysseyDesignSeed, defineOdysseyTokens } from "./schema";
import type {
  OdysseyColor,
  OdysseyComponentTokens,
  OdysseyDesignColorScheme,
  OdysseyDesignDensity,
  OdysseyDesignSeed,
  OdysseyDesignSeedPatch,
  OdysseyReferenceTokens,
  OdysseyResolvedTokenPatch,
  OdysseyResolvedTokens,
  OdysseySemanticTokens,
  OdysseyThemeAlgorithm,
} from "./types";

export { defaultOdysseyDesignSeed } from "./schema";

export function mergeOdysseyDesignSeed(base: OdysseyDesignSeed, patch?: OdysseyDesignSeedPatch): OdysseyDesignSeed {
  return defineOdysseyTokens({
    colors: { ...base.colors, ...patch?.colors },
    typography: { ...base.typography, ...patch?.typography },
    geometry: { ...base.geometry, ...patch?.geometry },
    motion: { ...base.motion, ...patch?.motion },
  });
}

const palette = (source: OdysseyColor): readonly OdysseyColor[] =>
  [-0.34, -0.24, -0.14, -0.07, 0, 0.07, 0.14, 0.24, 0.34].map((delta) => adjustOdysseyColor(source, delta, delta > 0 ? 0.82 : 1));

/**
 * The named type ramp, derived from the size, weight and leading scales.
 *
 * The roles are derived rather than seeded so a recipe that replaces the
 * scale carries the roles with it, and so the Go and Rust resolvers derive
 * the same numbers from the same seed.
 */
export function typographyRoles(
  size: { xs: string; sm: string; md: string; lg: string; xl: string },
  lineHeight: { tight: number; normal: number },
  weight: { regular: number; medium: number; semibold: number },
) {
  return {
    title: { size: size.xl, weight: weight.semibold, lineHeight: lineHeight.tight },
    body: { size: size.md, weight: weight.regular, lineHeight: lineHeight.normal },
    caption: { size: size.xs, weight: weight.regular, lineHeight: lineHeight.tight },
    label: { size: size.sm, weight: weight.medium, lineHeight: lineHeight.tight },
    mono: { size: size.sm, weight: weight.regular, lineHeight: lineHeight.tight },
  };
}

export function deriveOdysseyReferenceTokens(
  seed: OdysseyDesignSeed,
  colorScheme: OdysseyDesignColorScheme,
  density: OdysseyDesignDensity,
): OdysseyReferenceTokens {
  if (density === "spacious") {
    return expandSpaciousReference(deriveOdysseyReferenceTokens(seed, colorScheme, "standard"), seed.geometry.spacingUnit);
  }

  const compact = density === "compact";
  const dark = colorScheme === "dark";
  const unit = seed.geometry.spacingUnit;
  const height = seed.geometry.controlHeight - (compact ? 4 : 0);
  const radiusRem = seed.geometry.radius / 16;
  const duration = seed.motion.enabled ? seed.motion.duration : 0;
  const shadows = dark
    ? {
        xs: "0 1px 2px oklch(0 0 0 / 0.2)",
        sm: "0 2px 5px oklch(0 0 0 / 0.28)",
        md: "0 8px 24px oklch(0 0 0 / 0.32)",
        lg: "0 18px 50px oklch(0 0 0 / 0.45)",
      }
    : {
        xs: "0 1px 2px oklch(0.2 0.025 264 / 0.06)",
        sm: "0 1px 3px oklch(0.2 0.025 264 / 0.08), 0 1px 2px oklch(0.2 0.025 264 / 0.04)",
        md: "0 8px 24px oklch(0.2 0.025 264 / 0.12)",
        lg: "0 18px 50px oklch(0.2 0.025 264 / 0.18)",
      };
  return {
    color: {
      primary: palette(parseOdysseyColor(seed.colors.primary)),
      danger: palette(parseOdysseyColor(seed.colors.danger)),
      info: palette(parseOdysseyColor(seed.colors.info)),
      success: palette(parseOdysseyColor(seed.colors.success)),
      warning: palette(parseOdysseyColor(seed.colors.warning)),
      neutral: palette(parseOdysseyColor(seed.colors.neutral)),
    },
    typography: {
      fontSans: seed.typography.fontFamily,
      fontMono: seed.typography.fontFamilyCode,
      fontEditorial: 'Georgia, "Songti SC", "Noto Serif SC", serif',
      size: {
        xs: `${Math.max(10, seed.typography.fontSize - 2) / 16}rem`,
        sm: `${(seed.typography.fontSize - 1) / 16}rem`,
        md: `${seed.typography.fontSize / 16}rem`,
        lg: `${(seed.typography.fontSize + 2) / 16}rem`,
        xl: `${(seed.typography.fontSize + 6) / 16}rem`,
      },
      lineHeight: { tight: 1.25, normal: 1.5 },
      weight: { regular: 400, medium: 500, semibold: 600 },
      role: typographyRoles(
        {
          xs: `${Math.max(10, seed.typography.fontSize - 2) / 16}rem`,
          sm: `${(seed.typography.fontSize - 1) / 16}rem`,
          md: `${seed.typography.fontSize / 16}rem`,
          lg: `${(seed.typography.fontSize + 2) / 16}rem`,
          xl: `${(seed.typography.fontSize + 6) / 16}rem`,
        },
        { tight: 1.25, normal: 1.5 },
        { regular: 400, medium: 500, semibold: 600 },
      ),
    },
    space: {
      1: unit,
      2: unit * (compact ? 1 : 2),
      3: unit * (compact ? 2 : 3),
      4: unit * (compact ? 3 : 4),
      6: unit * (compact ? 4 : 6),
      8: unit * (compact ? 6 : 8),
    },
    radius: {
      base: `${radiusRem}rem`,
      // The extra-small step every theme carries, so the ordered radius rule
      // has a floor below the small step: base × 0.5.
      xs: `${radiusRem * 0.5}rem`,
      sm: `${radiusRem * 0.6}rem`,
      md: `${radiusRem}rem`,
      lg: `${radiusRem * 1.5}rem`,
      xl: `${radiusRem * 2}rem`,
      pill: "999px",
    },
    shadow: {
      xs: shadow(shadows.xs),
      sm: shadow(shadows.sm),
      md: shadow(shadows.md),
      lg: shadow(shadows.lg),
      emphasis: shadow(shadows.md),
    },
    motion: {
      fast: duration,
      normal: duration * 1.5,
      slow: duration * 2,
      standard: seed.motion.easing,
      emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
    },
    control: {
      heightSm: height - 4,
      heightMd: height,
      heightLg: height + 4,
      paddingSm: unit * (compact ? 2 : 3),
      paddingMd: unit * (compact ? 3 : 4),
      paddingLg: unit * (compact ? 4 : 6),
      gap: unit * (compact ? 1 : 2),
      itemHeight: compact ? 28 : 36,
    },
    selection: { controlSize: compact ? 18 : 20, switchHeight: compact ? 22 : 24, switchWidth: compact ? 40 : 44 },
    layer: { popover: 1000, dialog: 1100, toast: 1200 },
    geometry: { lineWidth: seed.geometry.lineWidth, focusRingWidth: 3, interactiveTargetMin: 44 },
  };
}

const color = (value: OdysseyColor) => serializeOdysseyColor(value);
const adjusted = (value: string, delta: number, chroma = 1) => color(adjustOdysseyColor(parseOdysseyColor(value), delta, chroma));
const tone = (value: string, lightness: number, chroma = 1) => color(setOdysseyColorTone(parseOdysseyColor(value), lightness, chroma));
const foreground = (value: string) => color(readableOdysseyForeground(parseOdysseyColor(value)));

function deriveSemantic(seed: OdysseyDesignSeed, colorScheme: OdysseyDesignColorScheme): OdysseySemanticTokens {
  const dark = colorScheme === "dark";
  const primary = dark ? adjusted(seed.colors.primary, 0.14, 0.82) : seed.colors.primary;
  const destructive = dark ? adjusted(seed.colors.danger, 0.15, 0.82) : seed.colors.danger;
  const neutral = seed.colors.neutral;
  const backgroundColor = tone(neutral, dark ? 0.19 : 1, dark ? 0.6 : 0);
  const foregroundColor = tone(neutral, dark ? 0.97 : 0.2, dark ? 0.24 : 1);
  const cardColor = tone(neutral, dark ? 0.23 : 1, dark ? 0.72 : 0);
  const popoverColor = tone(neutral, dark ? 0.23 : 1, dark ? 0.72 : 0);
  const primaryForegroundColor = foreground(primary);
  const accentColor = dark ? adjusted(primary, -0.38, 0.42) : adjusted(primary, 0.38, 0.18);
  const accentForegroundColor = dark ? "oklch(0.94 0.025 264)" : adjusted(primary, -0.25, 0.7);
  const borderColor = tone(neutral, dark ? 0.35 : 0.9, dark ? 0.88 : 0.4);
  const ringColor = adjusted(primary, dark ? 0.32 : 0.1, 0.8);
  return {
    color: {
      background: backgroundColor,
      foreground: foregroundColor,
      card: cardColor,
      cardForeground: foregroundColor,
      popover: popoverColor,
      popoverForeground: foregroundColor,
      primary,
      primaryForeground: primaryForegroundColor,
      primaryHover: adjusted(primary, dark ? 0.06 : -0.05),
      primaryActive: adjusted(primary, dark ? -0.06 : -0.1),
      secondary: tone(neutral, dark ? 0.29 : 0.955, dark ? 0.8 : 0.24),
      secondaryForeground: tone(neutral, dark ? 0.96 : 0.2, dark ? 0.24 : 1),
      muted: tone(neutral, dark ? 0.26 : 0.985, dark ? 0.72 : 0.12),
      mutedForeground: tone(neutral, dark ? 0.73 : 0.47, dark ? 0.8 : 1),
      accent: accentColor,
      accentForeground: accentForegroundColor,
      destructive,
      destructiveForeground: foreground(destructive),
      destructiveHover: adjusted(seed.colors.danger, dark ? 0.21 : -0.05),
      destructiveActive: adjusted(seed.colors.danger, dark ? 0.09 : -0.1),
      info: dark ? adjusted(seed.colors.info, 0.14, 0.82) : seed.colors.info,
      infoForeground: foreground(dark ? adjusted(seed.colors.info, 0.14, 0.82) : seed.colors.info),
      success: dark ? adjusted(seed.colors.success, 0.14, 0.82) : seed.colors.success,
      successForeground: foreground(dark ? adjusted(seed.colors.success, 0.14, 0.82) : seed.colors.success),
      warning: dark ? adjusted(seed.colors.warning, 0.08, 0.86) : seed.colors.warning,
      warningForeground: foreground(dark ? adjusted(seed.colors.warning, 0.08, 0.86) : seed.colors.warning),
      border: borderColor,
      input: tone(neutral, dark ? 0.4 : 0.85, dark ? 1 : 0.56),
      ring: ringColor,
      focusIndicator: ringColor,
      // The official focus halo: the ring at half its opacity.
      focusRing: odysseyColorWithAlpha(ringColor, 0.5),
      // The official chart ramp reads the seed's own five colours: the brand
      // hue, then the four status hues.
      chart1: seed.colors.primary,
      chart2: seed.colors.info,
      chart3: seed.colors.success,
      chart4: seed.colors.warning,
      chart5: seed.colors.danger,
      // The sidebar mirrors the surfaces the page already has.
      sidebar: cardColor,
      sidebarForeground: foregroundColor,
      sidebarPrimary: primary,
      sidebarPrimaryForeground: primaryForegroundColor,
      sidebarAccent: accentColor,
      sidebarAccentForeground: accentForegroundColor,
      sidebarBorder: borderColor,
      sidebarRing: ringColor,
      disabled: tone(neutral, dark ? 0.27 : 0.955, dark ? 0.72 : 0.24),
      disabledForeground: tone(neutral, dark ? 0.65 : 0.52, 0.8),
      backdrop: `color-mix(in oklch, ${tone(neutral, dark ? 0.08 : 0.12, 0.5)} 52%, transparent)`,
    },
  };
}

function deriveComponents(reference: OdysseyReferenceTokens, semantic: OdysseySemanticTokens): OdysseyComponentTokens {
  // The official halo: a spread ring of the focus ring width, painted in the
  // focus ring colour — the ring at half its opacity.
  const halo = `0 0 0 ${reference.geometry.focusRingWidth}px ${semantic.color.focusRing}`;
  return {
    button: {
      radius: reference.radius.md,
      fontWeight: 500,
      shadow: shadow(reference.shadow.xs.css),
      focusShadow: shadow(halo),
      // A focused button keeps its own border unless the theme asks for the
      // ring: the official recipe swaps the border for the ring colour. Each
      // variant carries the border it already wears. A theme that gives its
      // own border or brand colour states the baseline of the variants in
      // its own recipe, because the derivation above runs before it.
      focusBorder: semantic.color.border,
      solidFocusBorder: semantic.color.primary,
      dangerSolidFocusBorder: semantic.color.destructive,
      ghostFocusBorder: "transparent",
      paddingInlineSm: reference.control.paddingSm,
      paddingInlineMd: reference.control.paddingMd,
      paddingInlineLg: reference.control.paddingLg,
    },
    iconButton: {
      // The icon button inherits the button's radius.
      radius: reference.radius.md,
    },
    input: {
      radius: reference.radius.md,
      // The official halo: the ring at half its opacity, painted as a spread
      // ring so a focused control is distinguishable without colour.
      activeShadow: shadow(halo),
      focusBorder: semantic.color.primary,
      shadow: shadow("none"),
      focusShadow: shadow(halo),
    },
    selection: { size: reference.selection.controlSize, switchHeight: reference.selection.switchHeight, switchWidth: reference.selection.switchWidth },
    switch: {
      trackOn: semantic.color.primary,
      trackOff: semantic.color.input,
      shadow: shadow("none"),
      focusShadow: shadow(halo),
      focusBorder: semantic.color.border,
    },
    // The per-surface radii belong to the theme rather than to the style
    // layer: the official recipe gives each surface its own step, and writing
    // those steps into the stylesheet would leak them onto the themes that
    // never asked for them. The steps below are the baseline every theme
    // carries, resolved against that theme's own ladder; a theme that has its
    // own recipe replaces them.
    menu: {
      itemHeight: reference.control.itemHeight,
      paddingInline: reference.control.paddingMd,
      radius: reference.radius.lg,
      shadow: reference.shadow.md,
    },
    table: {
      rowHeight: reference.control.itemHeight,
      cellPaddingInline: reference.space[3],
      cellPaddingBlock: reference.space[2],
      radius: reference.radius.md,
    },
    tabs: {
      itemHeight: reference.control.itemHeight,
      gap: reference.space[1],
      radius: "0px",
      triggerRadius: "0px",
      triggerShadow: shadow("none"),
      focusShadow: shadow("none"),
      focusBorder: "transparent",
    },
    badge: {
      radius: reference.radius.sm,
      shadow: shadow("none"),
    },
    tooltip: { radius: reference.radius.sm, shadow: shadow("none") },
    checkbox: {
      radius: reference.radius.sm,
      focusShadow: shadow(halo),
      focusBorder: semantic.color.input,
    },
    alert: { radius: reference.radius.md, shadow: shadow("none") },
    skeleton: { radius: reference.radius.sm, shadow: shadow("none") },
    card: {
      radius: reference.radius.lg,
      shadow: reference.shadow.sm,
      gap: reference.space[6],
      headerDividerWidth: 0,
      footerDividerWidth: 0,
      headerPaddingBlockEnd: 0,
      footerPaddingBlockStart: 0,
    },
    dialog: { radius: reference.radius.lg, maxWidth: "30rem", shadow: reference.shadow.lg },
    // The dialog body floats above the page and carries the overlay
    // elevation; the floating surfaces that sit over the content they belong
    // to carry the level one step below it. Both levels are the contract
    // paths that paint them, so the overlay group keeps only the motion.
    overlay: { enterScale: 0.98 },
    pagination: { focusShadow: shadow(halo), focusBorder: "transparent" },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateOdysseyTokenOverride(base: unknown, patch: unknown, path = "tokens"): void {
  if (!isRecord(patch) || !isRecord(base)) throw new Error(`Invalid Odyssey token override at ${path}.`);
  for (const [key, value] of Object.entries(patch)) {
    if (!(key in base)) throw new Error(`Unknown Odyssey token override: ${path}.${key}`);
    const current = base[key];
    if (isRecord(current)) {
      validateOdysseyTokenOverride(current, value, `${path}.${key}`);
    } else if (Array.isArray(current)) {
      if (!Array.isArray(value)) throw new Error(`Invalid Odyssey token override type at ${path}.${key}.`);
    } else if (typeof current !== typeof value) {
      throw new Error(`Invalid Odyssey token override type at ${path}.${key}.`);
    }
  }
}

export function mergeOdysseyTokenGraph<T>(base: T, patch: unknown): T {
  if (!isRecord(base) || !isRecord(patch)) return patch as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) result[key] = mergeOdysseyTokenGraph(result[key], value);
  return result as T;
}

export function resolveOdysseyTokens(
  seed: OdysseyDesignSeed = defaultOdysseyDesignSeed,
  colorScheme: OdysseyDesignColorScheme = "light",
  density: OdysseyDesignDensity = "standard",
  algorithms: readonly OdysseyThemeAlgorithm[] = [],
  ...overrides: Array<OdysseyResolvedTokenPatch | undefined>
): OdysseyResolvedTokens {
  defineOdysseyTokens(seed);
  const reference = deriveOdysseyReferenceTokens(seed, colorScheme, density === "spacious" ? "standard" : density);
  let resolved: OdysseyResolvedTokens = {
    seed,
    reference,
    semantic: deriveSemantic(seed, colorScheme),
    components: {} as OdysseyComponentTokens,
    colorScheme,
    density,
  };
  resolved = { ...resolved, components: deriveComponents(resolved.reference, resolved.semantic) };
  for (const algorithm of algorithms) {
    const patch = algorithm(resolved);
    validateOdysseyTokenOverride(resolved, patch);
    resolved = mergeOdysseyTokenGraph(resolved, patch);
  }
  if (density === "spacious") expandSpaciousTokens(resolved);
  for (const patch of overrides) {
    if (!patch) continue;
    validateOdysseyTokenOverride(resolved, patch);
    resolved = mergeOdysseyTokenGraph(resolved, patch);
  }
  return resolved;
}
