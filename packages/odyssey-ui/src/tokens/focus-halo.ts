import type { OdysseyResolvedTokens, OdysseyShadowToken } from "./types";

/**
 * The capabilities the contract reports the focus halo coverage for.
 *
 * The list is the capability set of the design system, not a table of
 * answers: whether a capability draws the official halo is read off the
 * focus treatment the capability actually paints.
 */
export const focusHaloCapabilities = [
  "Button",
  "IconButton",
  "TextInput",
  "Field",
  "Checkbox",
  "Switch",
  "Select",
  "Tabs",
  "Pagination",
  "Badge",
  "DropdownMenu",
  "Popover",
  "Tooltip",
  "Dialog",
  "Card",
  "Alert",
  "Skeleton",
  "Progress",
  "Divider",
  "EmptyState",
] as const;

export type OdysseyFocusHaloCapability = (typeof focusHaloCapabilities)[number];

/**
 * The surface a capability paints its focus treatment on.
 *
 * A capability that owns no focusable surface of its own carries the
 * treatment of the surface it is: the icon button is a button, the select
 * trigger is an input-shaped control, and the field's control is the control
 * the field hosts. The badge owns no focusable surface at all — it is
 * painted as a span — so it paints no halo.
 */
const capabilitySurfaces: Partial<Record<OdysseyFocusHaloCapability, (tokens: OdysseyResolvedTokens) => object>> = {
  Button: (tokens) => tokens.components.button,
  // The icon button is a button.
  IconButton: (tokens) => tokens.components.button,
  TextInput: (tokens) => tokens.components.input,
  // The field owns no focusable surface: the control it hosts paints the halo.
  Field: (tokens) => tokens.components.input,
  Checkbox: (tokens) => tokens.components.checkbox,
  Switch: (tokens) => tokens.components.switch,
  // The select trigger is an input-shaped control and carries the input's
  // treatment: the trigger paints the input's focus shadow, so the coverage
  // the contract reports is read off the shadow that is painted.
  Select: (tokens) => tokens.components.input,
  Tabs: (tokens) => tokens.components.tabs,
  Pagination: (tokens) => tokens.components.pagination,
  // The badge is painted as a span: it can never hold focus, so it paints no halo.
  Badge: (tokens) => tokens.components.badge,
};

/**
 * The halo a surface paints when it holds focus, if it paints one.
 *
 * A surface that owns no focusable surface paints nothing, and reads as no
 * halo at all.
 */
function focusShadowOf(surface: object): OdysseyShadowToken | undefined {
  const candidate = surface as { focusShadow?: OdysseyShadowToken };
  return candidate.focusShadow;
}

/**
 * The official focus halo: a spread ring of the focus ring width, painted in
 * the focus ring colour — the ring at half its opacity.
 */
export function officialFocusHalo(tokens: OdysseyResolvedTokens): string {
  return `0 0 0 ${tokens.reference.geometry.focusRingWidth}px ${tokens.semantic.color.focusRing}`;
}

/**
 * Whether the capability paints the official focus halo.
 *
 * The answer comes from the shadow the capability paints when it holds
 * focus, so a capability that stops drawing the halo is reported as one that
 * draws none.
 */
export function drawsFocusHalo(tokens: OdysseyResolvedTokens, capability: OdysseyFocusHaloCapability): boolean {
  const surface = capabilitySurfaces[capability];
  const halo = surface ? focusShadowOf(surface(tokens)) : undefined;
  return halo ? halo.css === officialFocusHalo(tokens) : false;
}

/** The contract path the capability's halo coverage is reported under. */
export function focusHaloPath(capability: OdysseyFocusHaloCapability): string {
  return `components.${capability.charAt(0).toLowerCase()}${capability.slice(1)}.focusHalo`;
}
