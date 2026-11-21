import { odysseyColorWithAlpha } from "../tokens/color";
import { shadow } from "../tokens/elevation";
import { typographyRoles } from "../tokens/engine";
import type { OdysseyThemeAlgorithm } from "../types";

const fluentWebColors = {
  brand: {
    40: "#0c3b5e",
    70: "#115ea3",
    80: "#0f6cbd",
  },
  danger: { rest: "#c50f1f", hover: "#b10e1c", active: "#960b18" },
  success: "#107c10",
  warning: "#f7630c",
} as const;

const fluentLightColors = {
  background: "#ffffff",
  card: "#ffffff",
  popover: "#ffffff",
  foreground: "#242424",
  foregroundMuted: "#616161",
  secondary: "#f5f5f5",
  muted: "#fafafa",
  accent: "#f5f5f5",
  border: "#d1d1d1",
  input: "#d1d1d1",
  inputFocus: "#616161",
  disabled: "#f0f0f0",
  disabledForeground: "#6b6b6b",
  focus: "#000000",
  backdrop: "rgba(0, 0, 0, 0.4)",
} as const;

const fluentDarkColors = {
  background: "#292929",
  card: "#333333",
  popover: "#292929",
  foreground: "#ffffff",
  foregroundMuted: "#adadad",
  secondary: "#333333",
  muted: "#1f1f1f",
  accent: "#383838",
  border: "#666666",
  input: "#666666",
  inputFocus: "#adadad",
  disabled: "#141414",
  disabledForeground: "#939393",
  focus: "#ffffff",
  backdrop: "rgba(0, 0, 0, 0.5)",
} as const;

const fluentShadows = {
  xs: shadow("0 0 2px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.14)"),
  sm: shadow("0 0 2px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.14)"),
  md: shadow("0 0 2px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.14)"),
  emphasis: shadow("0 0 8px rgba(0, 0, 0, 0.12), 0 14px 28px rgba(0, 0, 0, 0.14)"),
  lg: shadow("0 0 8px rgba(0, 0, 0, 0.12), 0 32px 64px rgba(0, 0, 0, 0.14)"),
} as const;

const matches = (actual: string, expected: string) => actual.trim().toLowerCase() === expected;

/** Maps Fluent 2 Web aliases onto Odyssey's canonical resolved graph. */
export const fluentThemeAlgorithm: OdysseyThemeAlgorithm = (tokens) => {
  const compact = tokens.density === "compact";
  const dark = tokens.colorScheme === "dark";
  const colors = dark ? fluentDarkColors : fluentLightColors;
  const defaultBrand = matches(tokens.seed.colors.primary, "oklch(0.526301 0.149311 251.625264 / 1)");
  const defaultDanger = matches(tokens.seed.colors.danger, fluentWebColors.danger.rest);
  const defaultInfo = matches(tokens.seed.colors.info, fluentWebColors.brand[80]);
  const defaultSuccess = matches(tokens.seed.colors.success, fluentWebColors.success);
  const defaultWarning = matches(tokens.seed.colors.warning, fluentWebColors.warning);
  const primary = defaultBrand ? (dark ? fluentWebColors.brand[70] : fluentWebColors.brand[80]) : tokens.semantic.color.primary;
  const primaryHover = defaultBrand ? (dark ? fluentWebColors.brand[80] : fluentWebColors.brand[70]) : tokens.semantic.color.primaryHover;
  const primaryActive = defaultBrand ? fluentWebColors.brand[40] : tokens.semantic.color.primaryActive;
  const radiusIsDefault = tokens.seed.geometry.radius === 4;
  const radius = radiusIsDefault
    ? { base: "0.25rem", xs: "0.125rem", sm: "0.125rem", md: "0.25rem", lg: "0.375rem", xl: "0.5rem", pill: "625rem" }
    : tokens.reference.radius;
  const duration = tokens.seed.motion.enabled ? 1 : 0;

  return {
    reference: {
      typography: {
        fontSans: `'Segoe UI', 'Segoe UI Web (West European)', -apple-system, BlinkMacSystemFont, Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif`,
        fontMono: "Consolas, 'Courier New', Courier, monospace",
        size: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem", lg: "1rem", xl: "1.25rem" },
        lineHeight: { tight: 1.25, normal: 20 / 14 },
        weight: { regular: 400, medium: 500, semibold: 600 },
        role: typographyRoles(
          { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem", lg: "1rem", xl: "1.25rem" },
          { tight: 1.25, normal: 20 / 14 },
          { regular: 400, medium: 500, semibold: 600 },
        ),
      },
      ...(radiusIsDefault ? { radius } : {}),
      shadow: fluentShadows,
      motion: {
        fast: 100 * duration,
        normal: 200 * duration,
        slow: 300 * duration,
        standard: "cubic-bezier(0.33, 0, 0.67, 1)",
        emphasized: "cubic-bezier(0.1, 0.9, 0.2, 1)",
      },
      control: {
        heightSm: compact ? 24 : 28,
        heightMd: compact ? 28 : 32,
        heightLg: compact ? 36 : 40,
        itemHeight: compact ? 28 : 32,
      },
      geometry: { focusRingWidth: 2 },
    },
    semantic: {
      color: {
        background: colors.background,
        foreground: colors.foreground,
        card: colors.card,
        cardForeground: colors.foreground,
        popover: colors.popover,
        popoverForeground: colors.foreground,
        primary,
        primaryForeground: defaultBrand ? "#ffffff" : tokens.semantic.color.primaryForeground,
        primaryHover,
        primaryActive,
        secondary: colors.secondary,
        secondaryForeground: colors.foreground,
        muted: colors.muted,
        mutedForeground: colors.foregroundMuted,
        accent: colors.accent,
        accentForeground: colors.foreground,
        destructive: defaultDanger ? fluentWebColors.danger.rest : tokens.semantic.color.destructive,
        destructiveForeground: defaultDanger ? "#ffffff" : tokens.semantic.color.destructiveForeground,
        destructiveHover: defaultDanger ? fluentWebColors.danger.hover : tokens.semantic.color.destructiveHover,
        destructiveActive: defaultDanger ? fluentWebColors.danger.active : tokens.semantic.color.destructiveActive,
        info: defaultInfo ? (dark ? fluentWebColors.brand[70] : fluentWebColors.brand[80]) : tokens.semantic.color.info,
        infoForeground: defaultInfo ? "#ffffff" : tokens.semantic.color.infoForeground,
        success: defaultSuccess ? fluentWebColors.success : tokens.semantic.color.success,
        successForeground: defaultSuccess ? "#ffffff" : tokens.semantic.color.successForeground,
        warning: defaultWarning ? fluentWebColors.warning : tokens.semantic.color.warning,
        warningForeground: defaultWarning ? "#242424" : tokens.semantic.color.warningForeground,
        border: colors.border,
        input: colors.input,
        ring: primary,
        focusIndicator: colors.focus,
        // The halo follows the ring this preset paints, at half its opacity.
        focusRing: odysseyColorWithAlpha(primary, 0.5),
        disabled: colors.disabled,
        disabledForeground: colors.disabledForeground,
        backdrop: colors.backdrop,
      },
    },
    components: {
      // The switch carries the same treatment the input does.
      switch: { trackOn: primary, trackOff: colors.input, focusShadow: shadow(`inset 0 -2px 0 ${primary}`), focusBorder: colors.border },
      button: {
        radius: radius.md,
        fontWeight: 600,
        shadow: fluentShadows.xs,
        // The recipe gives the button its own borders, so the focus border
        // of each variant follows them.
        focusBorder: colors.border,
        solidFocusBorder: primary,
        paddingInlineSm: 8,
        paddingInlineMd: 12,
        paddingInlineLg: 16,
      },
      input: {
        radius: radius.md,
        activeShadow: shadow(`inset 0 -2px 0 ${primary}`),
        focusShadow: shadow(`inset 0 -2px 0 ${primary}`),
        focusBorder: colors.inputFocus,
      },
      selection: {
        size: compact ? 18 : 20,
        switchHeight: compact ? 18 : 20,
        switchWidth: compact ? 36 : 40,
      },
      menu: { itemHeight: compact ? 28 : 32, paddingInline: 8, radius: radius.lg },
      table: { rowHeight: compact ? 36 : 44, cellPaddingInline: compact ? 8 : 12, cellPaddingBlock: compact ? 4 : 8 },
      tabs: { itemHeight: compact ? 28 : 32, gap: 4 },
      card: { radius: radius.md, shadow: fluentShadows.sm, gap: 12 },
      // The surfaces that float above the page carry the recipe's overlay
      // elevation. It is the dialog's own shadow, so the contract path that
      // publishes it is the path that paints it.
      dialog: { radius: radius.xl, shadow: fluentShadows.lg },
      // The recipe replaces the ladder, so every surface that reads a step of
      // it reads the recipe's own ladder.
      badge: { radius: radius.sm },
      tooltip: { radius: radius.sm },
      // The checkbox carries the same treatment the input does.
      checkbox: { radius: radius.sm, focusShadow: shadow(`inset 0 -2px 0 ${primary}`), focusBorder: colors.input },
      alert: { radius: radius.md },
      skeleton: { radius: radius.sm },
    },
  };
};
