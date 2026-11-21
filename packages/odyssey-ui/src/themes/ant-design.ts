import { odysseyColorWithAlpha } from "../tokens/color";
import { shadow } from "../tokens/elevation";
import type { OdysseyThemeAlgorithm } from "../types";

/** Maps Ant Design's component and color defaults onto Odyssey's resolved token graph. */
export const antDesignThemeAlgorithm: OdysseyThemeAlgorithm = (tokens) => {
  const dark = tokens.colorScheme === "dark";
  const compact = tokens.density === "compact";
  const usesAntDefaultPrimary = tokens.seed.colors.primary === "oklch(0.56 0.21 255 / 1)";
  const primary = usesAntDefaultPrimary ? (dark ? "#1668dc" : "#1677ff") : tokens.semantic.color.primary;
  const primaryActive = usesAntDefaultPrimary ? (dark ? "#1554ad" : "#0958d9") : tokens.semantic.color.primaryActive;
  const focusHalo = `0 0 0 2px color-mix(in oklch, ${primary} 20%, transparent)`;
  const overlayShadow = dark
    ? "0 6px 16px oklch(0 0 0 / 0.48), 0 3px 6px -4px oklch(0 0 0 / 0.36)"
    : "0 6px 16px oklch(0.2 0.025 264 / 0.08), 0 3px 6px -4px oklch(0.2 0.025 264 / 0.12)";

  return {
    reference: {
      motion: { emphasized: "cubic-bezier(0.08, 0.82, 0.17, 1)" },
      shadow: { emphasis: shadow(overlayShadow) },
    },
    semantic: {
      color: {
        background: dark ? "#141414" : "#ffffff",
        foreground: dark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
        card: dark ? "#1f1f1f" : "#ffffff",
        cardForeground: dark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
        popover: dark ? "#1f1f1f" : "#ffffff",
        popoverForeground: dark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
        primary,
        primaryHover: usesAntDefaultPrimary ? (dark ? "#3c89e8" : "#4096ff") : tokens.semantic.color.primaryHover,
        primaryActive,
        primaryForeground: "#ffffff",
        secondary: dark ? "#1f1f1f" : "#ffffff",
        secondaryForeground: dark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
        muted: dark ? "rgba(255, 255, 255, 0.06)" : "#f0f0f0",
        mutedForeground: dark ? "rgba(255, 255, 255, 0.65)" : "rgba(0, 0, 0, 0.65)",
        accent: dark ? "#111a2c" : "#e6f4ff",
        accentForeground: dark ? "#e6f4ff" : usesAntDefaultPrimary ? primaryActive : tokens.semantic.color.accentForeground,
        border: dark ? "#424242" : "#d9d9d9",
        input: dark ? "#424242" : "#d9d9d9",
        ring: primary,
        focusIndicator: primary,
        // The halo follows the ring this preset paints, at half its opacity.
        focusRing: odysseyColorWithAlpha(primary, 0.5),
        disabled: dark ? "#1f1f1f" : "#f5f5f5",
        disabledForeground: dark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.25)",
      },
    },
    components: {
      button: {
        fontWeight: 400,
        shadow: shadow(`0 2px 0 color-mix(in oklch, ${primary} 10%, transparent)`),
        // The preset gives the button its own borders, so the focus border
        // of each variant follows them.
        focusBorder: dark ? "#424242" : "#d9d9d9",
        solidFocusBorder: primary,
        paddingInlineSm: 7,
        paddingInlineMd: 15,
        paddingInlineLg: 15,
      },
      input: {
        activeShadow: shadow(focusHalo),
        focusShadow: shadow(focusHalo),
        focusBorder: primary,
      },
      // The checkbox and the switch carry the same treatment the input does.
      checkbox: { focusShadow: shadow(focusHalo), focusBorder: dark ? "#424242" : "#d9d9d9" },
      switch: { focusShadow: shadow(focusHalo), focusBorder: dark ? "#424242" : "#d9d9d9" },
      menu: {
        itemHeight: compact ? tokens.reference.control.itemHeight : 40,
        paddingInline: compact ? tokens.reference.control.paddingMd : 16,
      },
      table: {
        rowHeight: tokens.reference.control.itemHeight,
        cellPaddingInline: 8,
        cellPaddingBlock: compact ? 8 : 12,
      },
      tabs: { gap: 0 },
      card: {
        radius: "8px",
        shadow: shadow("none"),
        gap: tokens.reference.space[2],
        headerDividerWidth: 1,
        footerDividerWidth: 1,
        headerPaddingBlockEnd: tokens.reference.space[6],
        footerPaddingBlockStart: tokens.reference.space[6],
      },
      // The surfaces that float above the page carry the preset's overlay
      // elevation. It is the dialog's own shadow, so the contract path that
      // publishes it is the path that paints it.
      dialog: { radius: "8px", shadow: shadow(overlayShadow) },
    },
  };
};
