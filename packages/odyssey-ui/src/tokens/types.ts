export type OdysseyDesignColorScheme = "light" | "dark";
export type OdysseyDesignDensity = "standard" | "compact" | "spacious";

export interface OdysseyDesignSeed {
  colors: { primary: string; neutral: string; danger: string; info: string; success: string; warning: string };
  typography: { fontFamily: string; fontFamilyCode: string; fontSize: number };
  geometry: { radius: number; spacingUnit: number; controlHeight: number; lineWidth: number };
  motion: { enabled: boolean; duration: number; easing: string };
}

export interface OdysseyColor {
  space: "oklch";
  lightness: number;
  chroma: number;
  hue: number;
  alpha: number;
}

/**
 * One shadow layer: `offsetX`, `offsetY`, `blur` and `spread` in pixels, then
 * `r`, `g`, `b` and `a` in the `0..1` range. The eight numbers are the
 * contract's elevation shape — the one the three stacks agree on.
 */
export type OdysseyElevationLayer = readonly [number, number, number, number, number, number, number, number];

/** The structured elevation of a shadow. */
export interface OdysseyElevation {
  layers: readonly OdysseyElevationLayer[];
}

/**
 * A shadow the theme declares.
 *
 * The CSS is what the stylesheet paints and the layers are what the contract
 * compares; both readings come from the same numbers so they cannot drift.
 */
export interface OdysseyShadowToken {
  /** The CSS-native box-shadow the stylesheet paints. */
  css: string;
  /** The elevation layers behind the shadow. Empty when the theme declares no elevation. */
  layers: readonly OdysseyElevationLayer[];
}

export interface OdysseyReferenceTokens {
  color: {
    primary: readonly OdysseyColor[];
    danger: readonly OdysseyColor[];
    info: readonly OdysseyColor[];
    success: readonly OdysseyColor[];
    warning: readonly OdysseyColor[];
    neutral: readonly OdysseyColor[];
  };
  typography: {
    fontSans: string;
    fontMono: string;
    fontEditorial: string;
    size: { xs: string; sm: string; md: string; lg: string; xl: string };
    lineHeight: { tight: number; normal: number };
    weight: { regular: number; medium: number; semibold: number };
    role: {
      title: OdysseyTypographyRole;
      body: OdysseyTypographyRole;
      caption: OdysseyTypographyRole;
      label: OdysseyTypographyRole;
      mono: OdysseyTypographyRole;
    };
  };
  space: { 1: number; 2: number; 3: number; 4: number; 6: number; 8: number };
  radius: { xs: string; base: string; sm: string; md: string; lg: string; xl: string; pill: string };
  shadow: { xs: OdysseyShadowToken; sm: OdysseyShadowToken; md: OdysseyShadowToken; lg: OdysseyShadowToken; emphasis: OdysseyShadowToken };
  motion: { fast: number; normal: number; slow: number; standard: string; emphasized: string };
  control: { heightSm: number; heightMd: number; heightLg: number; paddingSm: number; paddingMd: number; paddingLg: number; gap: number; itemHeight: number };
  selection: { controlSize: number; switchHeight: number; switchWidth: number };
  layer: { popover: number; dialog: number; toast: number };
  geometry: { lineWidth: number; focusRingWidth: number; interactiveTargetMin: number };
}

export interface OdysseySemanticTokens {
  color: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    destructiveHover: string;
    destructiveActive: string;
    info: string;
    infoForeground: string;
    success: string;
    successForeground: string;
    warning: string;
    warningForeground: string;
    border: string;
    input: string;
    ring: string;
    focusIndicator: string;
    focusRing: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
    sidebar: string;
    sidebarForeground: string;
    sidebarPrimary: string;
    sidebarPrimaryForeground: string;
    sidebarAccent: string;
    sidebarAccentForeground: string;
    sidebarBorder: string;
    sidebarRing: string;
    disabled: string;
    disabledForeground: string;
    backdrop: string;
  };
}

/**
 * The official focus treatment a capability carries.
 *
 * `focusShadow` is the halo the capability paints when it holds focus and
 * `focusBorder` is the border colour it takes with it. A capability that
 * paints neither declares no focus treatment, and the contract reports that
 * it draws no focus halo.
 */
export interface OdysseyFocusTreatment {
  focusShadow: OdysseyShadowToken;
  focusBorder: string;
}

export interface OdysseyComponentTokens {
  button: {
    radius: string;
    fontWeight: number;
    shadow: OdysseyShadowToken;
    focusShadow: OdysseyShadowToken;
    /**
     * The border a focused button takes. The variants own different borders —
     * the default and the outline variant wear the theme's border, the solid
     * variant the brand colour, the destructive solid variant the
     * destructive colour, and the soft, the ghost and the link variants no
     * border of their own — so each carries its own focus border and the
     * border width never changes.
     */
    focusBorder: string;
    solidFocusBorder: string;
    dangerSolidFocusBorder: string;
    ghostFocusBorder: string;
    paddingInlineSm: number;
    paddingInlineMd: number;
    paddingInlineLg: number;
  };
  /** The icon button inherits the button's radius and its focus treatment. */
  iconButton: { radius: string };
  input: { radius: string; activeShadow: OdysseyShadowToken; focusBorder: string; shadow: OdysseyShadowToken } & OdysseyFocusTreatment;
  selection: { size: number; switchHeight: number; switchWidth: number };
  switch: { trackOn: string; trackOff: string; shadow: OdysseyShadowToken } & OdysseyFocusTreatment;
  /**
   * The radius of the floating surfaces — the menu, the popover, the dropdown
   * and the select list. It belongs to the theme, not to the style layer: the
   * official recipe gives the shadcn theme the medium step while the other
   * themes keep the large step of their own ladder.
   */
  menu: { itemHeight: number; paddingInline: number; radius: string; shadow: OdysseyShadowToken };
  table: { rowHeight: number; cellPaddingInline: number; cellPaddingBlock: number; radius: string };
  /** The tab list carries no radius of its own outside the official theme. */
  tabs: { itemHeight: number; gap: number; radius: string; triggerRadius: string; triggerShadow: OdysseyShadowToken } & OdysseyFocusTreatment;
  /**
   * The badge owns no focusable surface: it is painted as a span, so it
   * carries no focus treatment at all.
   */
  badge: { radius: string; shadow: OdysseyShadowToken };
  tooltip: { radius: string; shadow: OdysseyShadowToken };
  checkbox: { radius: string } & OdysseyFocusTreatment;
  alert: { radius: string; shadow: OdysseyShadowToken };
  skeleton: { radius: string; shadow: OdysseyShadowToken };
  card: {
    radius: string;
    shadow: OdysseyShadowToken;
    gap: number;
    headerDividerWidth: number;
    footerDividerWidth: number;
    headerPaddingBlockEnd: number;
    footerPaddingBlockStart: number;
  };
  dialog: { radius: string; maxWidth: string; shadow: OdysseyShadowToken };
  /**
   * The overlay group keeps only the entry motion.
   *
   * The two elevation levels live in the contract paths that paint them: the
   * floating surfaces in `menu.shadow`, the surfaces that float above the
   * page in `dialog.shadow`. A second name for the same elevation is how the
   * published path and the painted one drift apart.
   */
  overlay: { enterScale: number };
  /** A pagination item is a button or a link of its own. */
  pagination: OdysseyFocusTreatment;
}

/** The single resolved Web token graph used by algorithms, adapters, and tooling. */
/** One named role in the type ramp. */
export interface OdysseyTypographyRole {
  /** The role's size, as a CSS length. */
  size: string;
  /** The role's weight, as the CSS number a stylesheet uses. */
  weight: number;
  /** The role's leading, as a multiple of its size. */
  lineHeight: number;
}

export interface OdysseyResolvedTokens {
  seed: OdysseyDesignSeed;
  reference: OdysseyReferenceTokens;
  semantic: OdysseySemanticTokens;
  components: OdysseyComponentTokens;
  colorScheme: OdysseyDesignColorScheme;
  density: OdysseyDesignDensity;
}

export type OdysseyDeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? OdysseyDeepPartial<T[K]> : T[K];
};

export type OdysseyResolvedTokenPatch = OdysseyDeepPartial<Pick<OdysseyResolvedTokens, "reference" | "semantic" | "components">>;
export type OdysseyThemeAlgorithm = (tokens: Readonly<OdysseyResolvedTokens>) => OdysseyResolvedTokenPatch;

export type OdysseyDesignSeedPatch = {
  [K in keyof OdysseyDesignSeed]?: Partial<OdysseyDesignSeed[K]>;
};
