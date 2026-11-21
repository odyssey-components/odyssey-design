import type { OdysseyColor, OdysseyResolvedTokens, OdysseyShadowToken } from "./types";

export type OdysseyWebTokenGroup = "color" | "typography" | "space" | "radius" | "shadow" | "motion" | "density" | "layer" | "geometry" | "component";
export type OdysseyWebTokenKind = "color" | "dimension" | "duration" | "fontFamily" | "fontWeight" | "number" | "shadow" | "cubicBezier";
export type OdysseyDimension = Readonly<{ value: number; unit?: "px" | "rem" }>;
export type OdysseyDuration = Readonly<{ value: number; unit?: "ms" | "s" }>;
export type OdysseyCubicBezier = readonly [number, number, number, number];
export type OdysseyWebTokenValue = string | number | OdysseyColor | OdysseyDimension | OdysseyDuration | OdysseyCubicBezier;

type Definition = readonly [variable: `--od-${string}`, path: string, kind: OdysseyWebTokenKind, group: OdysseyWebTokenGroup, description: string];
const token = <const T extends Definition>(...definition: T) => definition;

/** Canonical Web contract: every public role owns its graph path, CSS name, serialization kind, and documentation metadata here. */
export const odysseyWebTokenContract = {
  background: token("--od-background", "semantic.color.background", "color", "color", "Page background color."),
  foreground: token("--od-foreground", "semantic.color.foreground", "color", "color", "Default foreground color."),
  card: token("--od-card", "semantic.color.card", "color", "color", "Card surface color."),
  cardForeground: token("--od-card-foreground", "semantic.color.cardForeground", "color", "color", "Card foreground color."),
  popover: token("--od-popover", "semantic.color.popover", "color", "color", "Popover surface color."),
  popoverForeground: token("--od-popover-foreground", "semantic.color.popoverForeground", "color", "color", "Popover foreground color."),
  primary: token("--od-primary", "semantic.color.primary", "color", "color", "Primary action color."),
  primaryForeground: token("--od-primary-foreground", "semantic.color.primaryForeground", "color", "color", "Primary action foreground color."),
  primaryHover: token("--od-primary-hover", "semantic.color.primaryHover", "color", "color", "Primary hover color."),
  primaryActive: token("--od-primary-active", "semantic.color.primaryActive", "color", "color", "Primary active color."),
  secondary: token("--od-secondary", "semantic.color.secondary", "color", "color", "Secondary surface color."),
  secondaryForeground: token("--od-secondary-foreground", "semantic.color.secondaryForeground", "color", "color", "Secondary foreground color."),
  muted: token("--od-muted", "semantic.color.muted", "color", "color", "Muted surface color."),
  mutedForeground: token("--od-muted-foreground", "semantic.color.mutedForeground", "color", "color", "Muted foreground color."),
  accent: token("--od-accent", "semantic.color.accent", "color", "color", "Accent surface color."),
  accentForeground: token("--od-accent-foreground", "semantic.color.accentForeground", "color", "color", "Accent foreground color."),
  destructive: token("--od-destructive", "semantic.color.destructive", "color", "color", "Destructive action color."),
  destructiveForeground: token("--od-destructive-foreground", "semantic.color.destructiveForeground", "color", "color", "Destructive foreground color."),
  destructiveHover: token("--od-destructive-hover", "semantic.color.destructiveHover", "color", "color", "Destructive hover color."),
  destructiveActive: token("--od-destructive-active", "semantic.color.destructiveActive", "color", "color", "Destructive active color."),
  info: token("--od-info", "semantic.color.info", "color", "color", "Informational status color."),
  infoForeground: token("--od-info-foreground", "semantic.color.infoForeground", "color", "color", "Informational foreground color."),
  success: token("--od-success", "semantic.color.success", "color", "color", "Success status color."),
  successForeground: token("--od-success-foreground", "semantic.color.successForeground", "color", "color", "Success foreground color."),
  warning: token("--od-warning", "semantic.color.warning", "color", "color", "Warning status color."),
  warningForeground: token("--od-warning-foreground", "semantic.color.warningForeground", "color", "color", "Warning foreground color."),
  border: token("--od-border", "semantic.color.border", "color", "color", "Default border color."),
  input: token("--od-input", "semantic.color.input", "color", "color", "Input border color."),
  ring: token("--od-ring", "semantic.color.ring", "color", "color", "Focus ring color."),
  focusIndicator: token("--od-focus-indicator", "semantic.color.focusIndicator", "color", "color", "Visible keyboard focus indicator color."),
  focusRing: token("--od-focus-ring", "semantic.color.focusRing", "color", "color", "Focus halo color."),
  chart1: token("--od-chart-1", "semantic.color.chart1", "color", "color", "Chart series 1 color."),
  chart2: token("--od-chart-2", "semantic.color.chart2", "color", "color", "Chart series 2 color."),
  chart3: token("--od-chart-3", "semantic.color.chart3", "color", "color", "Chart series 3 color."),
  chart4: token("--od-chart-4", "semantic.color.chart4", "color", "color", "Chart series 4 color."),
  chart5: token("--od-chart-5", "semantic.color.chart5", "color", "color", "Chart series 5 color."),
  sidebar: token("--od-sidebar", "semantic.color.sidebar", "color", "color", "Sidebar surface color."),
  sidebarForeground: token("--od-sidebar-foreground", "semantic.color.sidebarForeground", "color", "color", "Sidebar foreground color."),
  sidebarPrimary: token("--od-sidebar-primary", "semantic.color.sidebarPrimary", "color", "color", "Sidebar primary color."),
  sidebarPrimaryForeground: token(
    "--od-sidebar-primary-foreground",
    "semantic.color.sidebarPrimaryForeground",
    "color",
    "color",
    "Sidebar primary foreground color.",
  ),
  sidebarAccent: token("--od-sidebar-accent", "semantic.color.sidebarAccent", "color", "color", "Sidebar accent color."),
  sidebarAccentForeground: token(
    "--od-sidebar-accent-foreground",
    "semantic.color.sidebarAccentForeground",
    "color",
    "color",
    "Sidebar accent foreground color.",
  ),
  sidebarBorder: token("--od-sidebar-border", "semantic.color.sidebarBorder", "color", "color", "Sidebar border color."),
  sidebarRing: token("--od-sidebar-ring", "semantic.color.sidebarRing", "color", "color", "Sidebar focus ring color."),
  disabled: token("--od-disabled", "semantic.color.disabled", "color", "color", "Disabled surface color."),
  disabledForeground: token("--od-disabled-foreground", "semantic.color.disabledForeground", "color", "color", "Disabled foreground color."),
  overlayBackdrop: token("--od-overlay-backdrop", "semantic.color.backdrop", "color", "color", "Overlay backdrop color."),
  fontSans: token("--od-font-sans", "reference.typography.fontSans", "fontFamily", "typography", "Sans-serif font stack."),
  fontMono: token("--od-font-mono", "reference.typography.fontMono", "fontFamily", "typography", "Monospace font stack."),
  fontEditorial: token("--od-font-editorial", "reference.typography.fontEditorial", "fontFamily", "typography", "Editorial font stack."),
  fontSizeXs: token("--od-font-size-xs", "reference.typography.size.xs", "dimension", "typography", "Extra-small font size."),
  fontSizeSm: token("--od-font-size-sm", "reference.typography.size.sm", "dimension", "typography", "Small font size."),
  fontSizeMd: token("--od-font-size-md", "reference.typography.size.md", "dimension", "typography", "Default font size."),
  fontSizeLg: token("--od-font-size-lg", "reference.typography.size.lg", "dimension", "typography", "Large font size."),
  fontSizeXl: token("--od-font-size-xl", "reference.typography.size.xl", "dimension", "typography", "Extra-large font size."),
  lineHeightTight: token("--od-line-height-tight", "reference.typography.lineHeight.tight", "number", "typography", "Tight line height."),
  lineHeightNormal: token("--od-line-height-normal", "reference.typography.lineHeight.normal", "number", "typography", "Default line height."),
  fontWeightRegular: token("--od-font-weight-regular", "reference.typography.weight.regular", "fontWeight", "typography", "Regular font weight."),
  fontWeightMedium: token("--od-font-weight-medium", "reference.typography.weight.medium", "fontWeight", "typography", "Medium font weight."),
  fontWeightSemibold: token("--od-font-weight-semibold", "reference.typography.weight.semibold", "fontWeight", "typography", "Semibold font weight."),
  typeTitleSize: token("--od-type-title-size", "reference.typography.role.title.size", "dimension", "typography", "Title type role size."),
  typeTitleWeight: token("--od-type-title-weight", "reference.typography.role.title.weight", "fontWeight", "typography", "Title type role weight."),
  typeTitleLineHeight: token("--od-type-title-line-height", "reference.typography.role.title.lineHeight", "number", "typography", "Title type role leading."),
  typeBodySize: token("--od-type-body-size", "reference.typography.role.body.size", "dimension", "typography", "Body type role size."),
  typeBodyWeight: token("--od-type-body-weight", "reference.typography.role.body.weight", "fontWeight", "typography", "Body type role weight."),
  typeBodyLineHeight: token("--od-type-body-line-height", "reference.typography.role.body.lineHeight", "number", "typography", "Body type role leading."),
  typeCaptionSize: token("--od-type-caption-size", "reference.typography.role.caption.size", "dimension", "typography", "Caption type role size."),
  typeCaptionWeight: token("--od-type-caption-weight", "reference.typography.role.caption.weight", "fontWeight", "typography", "Caption type role weight."),
  typeCaptionLineHeight: token(
    "--od-type-caption-line-height",
    "reference.typography.role.caption.lineHeight",
    "number",
    "typography",
    "Caption type role leading.",
  ),
  typeLabelSize: token("--od-type-label-size", "reference.typography.role.label.size", "dimension", "typography", "Label type role size."),
  typeLabelWeight: token("--od-type-label-weight", "reference.typography.role.label.weight", "fontWeight", "typography", "Label type role weight."),
  typeLabelLineHeight: token("--od-type-label-line-height", "reference.typography.role.label.lineHeight", "number", "typography", "Label type role leading."),
  typeMonoSize: token("--od-type-mono-size", "reference.typography.role.mono.size", "dimension", "typography", "Mono type role size."),
  typeMonoWeight: token("--od-type-mono-weight", "reference.typography.role.mono.weight", "fontWeight", "typography", "Mono type role weight."),
  typeMonoLineHeight: token("--od-type-mono-line-height", "reference.typography.role.mono.lineHeight", "number", "typography", "Mono type role leading."),
  space1: token("--od-space-1", "reference.space.1", "dimension", "space", "First spacing step."),
  space2: token("--od-space-2", "reference.space.2", "dimension", "space", "Second spacing step."),
  space3: token("--od-space-3", "reference.space.3", "dimension", "space", "Third spacing step."),
  space4: token("--od-space-4", "reference.space.4", "dimension", "space", "Fourth spacing step."),
  space6: token("--od-space-6", "reference.space.6", "dimension", "space", "Sixth spacing step."),
  space8: token("--od-space-8", "reference.space.8", "dimension", "space", "Eighth spacing step."),
  radius: token("--od-radius", "reference.radius.base", "dimension", "radius", "Base radius."),
  radiusXs: token("--od-radius-xs", "reference.radius.xs", "dimension", "radius", "Extra-small radius."),
  radiusSm: token("--od-radius-sm", "reference.radius.sm", "dimension", "radius", "Small radius."),
  radiusMd: token("--od-radius-md", "reference.radius.md", "dimension", "radius", "Medium radius."),
  radiusLg: token("--od-radius-lg", "reference.radius.lg", "dimension", "radius", "Large radius."),
  radiusXl: token("--od-radius-xl", "reference.radius.xl", "dimension", "radius", "Extra-large radius."),
  shadowXs: token("--od-shadow-xs", "reference.shadow.xs", "shadow", "shadow", "Extra-small shadow."),
  shadowSm: token("--od-shadow-sm", "reference.shadow.sm", "shadow", "shadow", "Small shadow."),
  shadowMd: token("--od-shadow-md", "reference.shadow.md", "shadow", "shadow", "Medium shadow."),
  shadowLg: token("--od-shadow-lg", "reference.shadow.lg", "shadow", "shadow", "Large shadow."),
  durationFast: token("--od-duration-fast", "reference.motion.fast", "duration", "motion", "Fast motion duration."),
  durationNormal: token("--od-duration-normal", "reference.motion.normal", "duration", "motion", "Normal motion duration."),
  durationSlow: token("--od-duration-slow", "reference.motion.slow", "duration", "motion", "Slow motion duration."),
  easeStandard: token("--od-ease-standard", "reference.motion.standard", "cubicBezier", "motion", "Standard easing curve."),
  easeEmphasized: token("--od-ease-emphasized", "reference.motion.emphasized", "cubicBezier", "motion", "Emphasized easing curve."),
  controlHeightSm: token("--od-control-height-sm", "reference.control.heightSm", "dimension", "density", "Small control height."),
  controlHeightMd: token("--od-control-height-md", "reference.control.heightMd", "dimension", "density", "Default control height."),
  controlHeightLg: token("--od-control-height-lg", "reference.control.heightLg", "dimension", "density", "Large control height."),
  controlPaddingSm: token("--od-control-padding-sm", "reference.control.paddingSm", "dimension", "density", "Small control padding."),
  controlPaddingMd: token("--od-control-padding-md", "reference.control.paddingMd", "dimension", "density", "Default control padding."),
  controlPaddingLg: token("--od-control-padding-lg", "reference.control.paddingLg", "dimension", "density", "Large control padding."),
  controlGap: token("--od-control-gap", "reference.control.gap", "dimension", "density", "Control content gap."),
  itemHeight: token("--od-item-height", "reference.control.itemHeight", "dimension", "density", "Repeated item height."),
  selectionControlSize: token("--od-selection-control-size", "components.selection.size", "dimension", "component", "Selection control size."),
  switchHeight: token("--od-switch-height", "components.selection.switchHeight", "dimension", "component", "Switch height."),
  switchWidth: token("--od-switch-width", "components.selection.switchWidth", "dimension", "component", "Switch width."),
  switchTrackOn: token("--od-switch-track-on", "components.switch.trackOn", "color", "component", "Switch checked track color."),
  switchTrackOff: token("--od-switch-track-off", "components.switch.trackOff", "color", "component", "Switch unchecked track color."),
  zPopover: token("--od-z-popover", "reference.layer.popover", "number", "layer", "Popover layer."),
  zDialog: token("--od-z-dialog", "reference.layer.dialog", "number", "layer", "Dialog layer."),
  zToast: token("--od-z-toast", "reference.layer.toast", "number", "layer", "Toast layer."),
  focusRingWidth: token("--od-focus-ring-width", "reference.geometry.focusRingWidth", "dimension", "geometry", "Focus ring width."),
  shadowEmphasis: token("--od-shadow-emphasis", "reference.shadow.emphasis", "shadow", "shadow", "Emphasized shadow."),
  lineWidth: token("--od-line-width", "reference.geometry.lineWidth", "dimension", "geometry", "Default line width."),
  interactiveTargetMin: token(
    "--od-interactive-target-min",
    "reference.geometry.interactiveTargetMin",
    "dimension",
    "geometry",
    "Minimum coarse-pointer target.",
  ),
  buttonRadius: token("--od-button-radius", "components.button.radius", "dimension", "component", "Button radius."),
  buttonFontWeight: token("--od-button-font-weight", "components.button.fontWeight", "fontWeight", "component", "Button font weight."),
  buttonShadow: token("--od-button-shadow", "components.button.shadow", "shadow", "component", "Button shadow."),
  buttonPaddingInlineSm: token("--od-button-padding-inline-sm", "components.button.paddingInlineSm", "dimension", "component", "Small button inline padding."),
  buttonPaddingInlineMd: token("--od-button-padding-inline-md", "components.button.paddingInlineMd", "dimension", "component", "Medium button inline padding."),
  buttonPaddingInlineLg: token("--od-button-padding-inline-lg", "components.button.paddingInlineLg", "dimension", "component", "Large button inline padding."),
  inputRadius: token("--od-input-radius", "components.input.radius", "dimension", "component", "Input radius."),
  inputActiveShadow: token("--od-input-active-shadow", "components.input.activeShadow", "shadow", "component", "Input active shadow."),
  inputFocusBorder: token("--od-input-focus-border", "components.input.focusBorder", "color", "component", "Input focus border color."),
  badgeRadius: token("--od-badge-radius", "components.badge.radius", "dimension", "component", "Badge radius."),
  tooltipRadius: token("--od-tooltip-radius", "components.tooltip.radius", "dimension", "component", "Tooltip radius."),
  checkboxRadius: token("--od-checkbox-radius", "components.checkbox.radius", "dimension", "component", "Checkbox radius."),
  alertRadius: token("--od-alert-radius", "components.alert.radius", "dimension", "component", "Alert radius."),
  skeletonRadius: token("--od-skeleton-radius", "components.skeleton.radius", "dimension", "component", "Skeleton radius."),
  menuItemHeight: token("--od-menu-item-height", "components.menu.itemHeight", "dimension", "component", "Menu item height."),
  menuPaddingInline: token("--od-menu-padding-inline", "components.menu.paddingInline", "dimension", "component", "Menu item inline padding."),
  menuRadius: token("--od-menu-radius", "components.menu.radius", "dimension", "component", "Floating surface radius."),
  tableRowHeight: token("--od-table-row-height", "components.table.rowHeight", "dimension", "component", "Table row height."),
  tableCellPaddingInline: token("--od-table-cell-padding-inline", "components.table.cellPaddingInline", "dimension", "component", "Table cell inline padding."),
  tableCellPaddingBlock: token("--od-table-cell-padding-block", "components.table.cellPaddingBlock", "dimension", "component", "Table cell block padding."),
  tabsItemHeight: token("--od-tabs-item-height", "components.tabs.itemHeight", "dimension", "component", "Tabs item height."),
  tabsGap: token("--od-tabs-gap", "components.tabs.gap", "dimension", "component", "Tabs item gap."),
  tabsRadius: token("--od-tabs-radius", "components.tabs.radius", "dimension", "component", "Tabs list radius."),
  tabsTriggerRadius: token("--od-tabs-trigger-radius", "components.tabs.triggerRadius", "dimension", "component", "Tabs trigger radius."),
  cardRadius: token("--od-card-radius", "components.card.radius", "dimension", "component", "Card radius."),
  cardShadow: token("--od-card-shadow", "components.card.shadow", "shadow", "component", "Card shadow."),
  cardGap: token("--od-card-gap", "components.card.gap", "dimension", "component", "Card section gap."),
  cardHeaderDividerWidth: token("--od-card-header-divider-width", "components.card.headerDividerWidth", "dimension", "component", "Card header divider width."),
  cardFooterDividerWidth: token("--od-card-footer-divider-width", "components.card.footerDividerWidth", "dimension", "component", "Card footer divider width."),
  cardHeaderPaddingBlockEnd: token(
    "--od-card-header-padding-block-end",
    "components.card.headerPaddingBlockEnd",
    "dimension",
    "component",
    "Card header end padding.",
  ),
  cardFooterPaddingBlockStart: token(
    "--od-card-footer-padding-block-start",
    "components.card.footerPaddingBlockStart",
    "dimension",
    "component",
    "Card footer start padding.",
  ),
  dialogRadius: token("--od-dialog-radius", "components.dialog.radius", "dimension", "component", "Dialog radius."),
  dialogMaxWidth: token("--od-dialog-max-width", "components.dialog.maxWidth", "dimension", "component", "Dialog maximum width."),
  // The two overlay elevations are the contract paths that publish them: the
  // floating surfaces wear the menu's shadow, the surfaces that float above
  // the page wear the dialog's.
  menuShadow: token("--od-menu-shadow", "components.menu.shadow", "shadow", "component", "Floating surface shadow."),
  dialogShadow: token("--od-dialog-shadow", "components.dialog.shadow", "shadow", "component", "Overlay surface shadow."),
  overlayEnterScale: token("--od-overlay-enter-scale", "components.overlay.enterScale", "number", "component", "Overlay entry scale."),
  inputShadow: token("--od-input-shadow", "components.input.shadow", "shadow", "component", "Input shadow."),
  switchShadow: token("--od-switch-shadow", "components.switch.shadow", "shadow", "component", "Switch shadow."),
  tabsTriggerShadow: token("--od-tabs-trigger-shadow", "components.tabs.triggerShadow", "shadow", "component", "Active tab trigger shadow."),
  tableRadius: token("--od-table-radius", "components.table.radius", "dimension", "component", "Table container radius."),
  iconButtonRadius: token("--od-icon-button-radius", "components.iconButton.radius", "dimension", "component", "Icon button radius."),
  buttonFocusShadow: token("--od-button-focus-shadow", "components.button.focusShadow", "shadow", "component", "Button focus halo."),
  buttonFocusBorder: token("--od-button-focus-border", "components.button.focusBorder", "color", "component", "Button focus border colour."),
  buttonSolidFocusBorder: token(
    "--od-button-solid-focus-border",
    "components.button.solidFocusBorder",
    "color",
    "component",
    "Solid button focus border colour.",
  ),
  buttonDangerSolidFocusBorder: token(
    "--od-button-danger-solid-focus-border",
    "components.button.dangerSolidFocusBorder",
    "color",
    "component",
    "Destructive solid button focus border colour.",
  ),
  buttonGhostFocusBorder: token(
    "--od-button-ghost-focus-border",
    "components.button.ghostFocusBorder",
    "color",
    "component",
    "Ghost button focus border colour.",
  ),
  inputFocusShadow: token("--od-input-focus-shadow", "components.input.focusShadow", "shadow", "component", "Text input focus halo."),
  checkboxFocusShadow: token("--od-checkbox-focus-shadow", "components.checkbox.focusShadow", "shadow", "component", "Checkbox focus halo."),
  checkboxFocusBorder: token("--od-checkbox-focus-border", "components.checkbox.focusBorder", "color", "component", "Checkbox focus border colour."),
  switchFocusShadow: token("--od-switch-focus-shadow", "components.switch.focusShadow", "shadow", "component", "Switch focus halo."),
  switchFocusBorder: token("--od-switch-focus-border", "components.switch.focusBorder", "color", "component", "Switch focus border colour."),
  tabsFocusShadow: token("--od-tabs-focus-shadow", "components.tabs.focusShadow", "shadow", "component", "Tab trigger focus halo."),
  tabsFocusBorder: token("--od-tabs-focus-border", "components.tabs.focusBorder", "color", "component", "Tab trigger focus border colour."),
  paginationFocusShadow: token("--od-pagination-focus-shadow", "components.pagination.focusShadow", "shadow", "component", "Pagination item focus halo."),
  paginationFocusBorder: token(
    "--od-pagination-focus-border",
    "components.pagination.focusBorder",
    "color",
    "component",
    "Pagination item focus border colour.",
  ),
} as const;

export type OdysseyWebTokenName = keyof typeof odysseyWebTokenContract;
export type OdysseyCssVariable = (typeof odysseyWebTokenContract)[OdysseyWebTokenName][0];
export type OdysseyCssVariableValues = Readonly<Record<OdysseyCssVariable, string | number>>;
export type OdysseyWebTokenValues = Readonly<Record<OdysseyWebTokenName, OdysseyWebTokenValue>>;

export const odysseyCssVariables = Object.freeze(
  Object.fromEntries(Object.entries(odysseyWebTokenContract).map(([role, [variable]]) => [role, variable])),
) as Readonly<{ [Role in OdysseyWebTokenName]: (typeof odysseyWebTokenContract)[Role][0] }>;

export const odysseyTokenVars = Object.freeze(
  Object.fromEntries(Object.entries(odysseyCssVariables).map(([role, variable]) => [role, `var(${variable})`])),
) as Readonly<{ [Role in OdysseyWebTokenName]: `var(${(typeof odysseyCssVariables)[Role]})` }>;

export const odysseyWebTokenMetadata = Object.freeze(
  (Object.entries(odysseyWebTokenContract) as Array<[OdysseyWebTokenName, Definition]>).map(([role, [name, path, kind, group, description]]) => ({
    name,
    role,
    path,
    group,
    kind,
    description,
  })),
);

function readPath(source: unknown, path: string): unknown {
  let current = source;
  for (const segment of path.split(".")) {
    if (typeof current !== "object" || current === null || !(segment in current)) throw new Error(`Unknown Odyssey token contract path: ${path}`);
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function serialize(kind: OdysseyWebTokenKind, value: unknown, role: string): string | number {
  if (kind === "shadow") {
    const token = value as OdysseyShadowToken;
    if (typeof token?.css !== "string") throw new Error(`Invalid Odyssey shadow token value: ${role}`);
    return token.css;
  }
  if (typeof value === "string") {
    if (kind === "color" && !/^(?:#[\da-f]{3,8}|(?:oklch|oklab|lch|lab|rgb|rgba|hsl|hsla|color|color-mix)\(|transparent$|currentColor$)/i.test(value.trim())) {
      throw new Error(`Invalid Odyssey color token value: ${role}`);
    }
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error(`Invalid Odyssey token value: ${role}`);
    if (kind === "dimension") return `${value}px`;
    if (kind === "duration") return `${value}ms`;
    return value;
  }
  throw new Error(`Invalid Odyssey ${kind} token value: ${role}`);
}

export function toOdysseyWebTokenValues(tokens: OdysseyResolvedTokens): OdysseyWebTokenValues {
  return Object.freeze(
    Object.fromEntries(
      (Object.entries(odysseyWebTokenContract) as Array<[OdysseyWebTokenName, Definition]>).map(([role, [, path]]) => {
        const value = readPath(tokens, path);
        return [role, value];
      }),
    ),
  ) as OdysseyWebTokenValues;
}

/** Serializes the canonical resolved graph to the stable public CSS Variable contract. */
export function toOdysseyCssVariables(tokens: OdysseyResolvedTokens): OdysseyCssVariableValues {
  const duplicateVariables = Object.values(odysseyCssVariables).filter((variable, index, all) => all.indexOf(variable) !== index);
  if (duplicateVariables.length) throw new Error(`Duplicate Odyssey CSS Variable: ${duplicateVariables.join(", ")}`);
  return Object.freeze(
    Object.fromEntries(
      (Object.entries(odysseyWebTokenContract) as Array<[OdysseyWebTokenName, Definition]>).map(([role, [variable, path, kind]]) => [
        variable,
        serialize(kind, readPath(tokens, path), role),
      ]),
    ),
  ) as OdysseyCssVariableValues;
}
