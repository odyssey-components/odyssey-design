import source from "./catalog.json";

export type OdysseyPlatform = "mobile" | "desktop";
export type OdysseyComponentStatus = "experimental" | "beta" | "stable" | "deprecated";

export interface OdysseyCatalogItem {
  accessibility: string[];
  api: string[];
  category: "general" | "forms" | "navigation" | "feedback" | "overlay" | "layout";
  demoIds: string[];
  docId: string;
  name: string;
  platforms: OdysseyPlatform[];
  status: OdysseyComponentStatus;
  title: string;
  since: string;
  parts: string[];
  variants: string[];
  states: string[];
  tokens: string[];
  migration?: string;
}

export function defineOdysseyCatalog(items: OdysseyCatalogItem[]): readonly OdysseyCatalogItem[] {
  const names = new Set<string>();
  const demos = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`Duplicate Odyssey component: ${item.name}`);
    names.add(item.name);
    for (const demoId of item.demoIds) {
      if (demos.has(demoId)) throw new Error(`Duplicate Odyssey demo: ${demoId}`);
      demos.add(demoId);
    }
  }
  return items;
}

type CatalogSourceItem = Omit<OdysseyCatalogItem, "since" | "parts" | "variants" | "states" | "tokens">;
const anatomy: Record<string, string[]> = {
  button: ["button", "button-icon"],
  "toggle-button": ["toggle-button"],
  "toggle-group": ["toggle-group", "toggle-button"],
  link: ["link", "link-label", "link-leading-icon", "link-trailing-icon"],
  code: ["inline-code", "code-block"],
  collapsible: ["collapsible", "collapsible-trigger", "collapsible-content"],
  "app-shell": ["app-shell", "app-shell-sidebar", "app-shell-main", "app-shell-header", "app-shell-content"],
  stat: ["stat", "stat-label", "stat-value", "stat-description"],
  prose: ["prose"],
  card: ["card", "card-header", "card-title", "card-description", "card-action", "card-content", "card-footer"],
  stack: ["stack"],
  page: ["page", "page-header", "page-title", "page-description", "page-actions", "page-content"],
  "description-list": ["description-list", "description-item", "description-term", "description-detail"],
  input: ["input", "textarea"],
  field: [
    "field-set",
    "field-legend",
    "field-group",
    "field",
    "field-label",
    "field-control",
    "field-content",
    "field-title",
    "field-description",
    "field-error",
    "field-separator",
  ],
  "input-group": ["input-group", "input-group-addon", "input-group-text", "input-group-control", "input-group-button"],
  combobox: [
    "combobox-input",
    "combobox-trigger",
    "combobox-clear",
    "combobox-positioner",
    "combobox-content",
    "combobox-list",
    "combobox-item",
    "combobox-item-indicator",
    "combobox-group",
    "combobox-group-label",
    "combobox-status",
    "combobox-empty",
    "combobox-separator",
    "combobox-chips",
    "combobox-chip",
    "combobox-chip-remove",
    "combobox-chips-input",
  ],
  "number-field": [
    "number-field",
    "number-field-group",
    "number-field-input",
    "number-field-increment",
    "number-field-decrement",
    "number-field-scrub-area",
    "number-field-scrub-area-cursor",
  ],
  "otp-input": ["otp-input", "otp-group", "otp-slot", "otp-separator"],
  "color-picker": ["color-picker"],
  checkbox: ["checkbox-group", "checkbox", "checkbox-indicator"],
  "radio-group": ["radio-group", "radio-group-item", "radio-group-indicator", "radio-button", "radio-button-label"],
  pagination: ["pagination", "pagination-content", "pagination-item", "pagination-link", "pagination-button", "pagination-status", "pagination-ellipsis"],
  switch: ["switch", "switch-thumb"],
  select: [
    "select-trigger",
    "select-value",
    "select-icon",
    "select-positioner",
    "select-content",
    "select-list",
    "select-item",
    "select-item-indicator",
    "select-item-text",
    "select-group",
    "select-group-label",
  ],
  dialog: ["dialog-trigger", "dialog-overlay", "dialog-content", "dialog-header", "dialog-footer", "dialog-title", "dialog-description", "dialog-close"],
  popover: ["popover-trigger", "popover-positioner", "popover-content", "popover-arrow"],
  "dropdown-menu": [
    "dropdown-menu-trigger",
    "dropdown-menu-positioner",
    "dropdown-menu-content",
    "dropdown-menu-item",
    "dropdown-menu-separator",
    "dropdown-menu-radio-group",
    "dropdown-menu-radio-item",
  ],
  tooltip: ["tooltip-trigger", "tooltip-positioner", "tooltip-content"],
  tabs: ["tabs", "tabs-list", "tabs-tab", "tabs-indicator", "tabs-panel"],
  toast: ["toast-portal", "toast-viewport", "toast", "toast-content", "toast-title", "toast-description", "toast-action", "toast-close"],
  alert: ["alert", "alert-title", "alert-description", "alert-action"],
  skeleton: ["skeleton"],
  slider: ["slider", "slider-label", "slider-value", "slider-control", "slider-track", "slider-indicator", "slider-thumb"],
  drawer: [
    "drawer-trigger",
    "drawer-backdrop",
    "drawer-viewport",
    "drawer-popup",
    "drawer-header",
    "drawer-title",
    "drawer-description",
    "drawer-body",
    "drawer-close",
  ],
  "alert-dialog": [
    "alert-dialog-trigger",
    "alert-dialog-backdrop",
    "alert-dialog-popup",
    "alert-dialog-title",
    "alert-dialog-description",
    "alert-dialog-footer",
    "alert-dialog-close",
  ],
  "pro-select": [
    "pro-select",
    "pro-select-trigger",
    "pro-select-clear",
    "pro-select-positioner",
    "pro-select-content",
    "pro-select-status",
    "pro-select-empty",
    "pro-select-list",
    "pro-select-option",
    "pro-select-indicator",
  ],
  "pro-radio-group": ["pro-radio-group", "pro-radio-option", "radio-group-item", "radio-group-indicator", "radio-button"],
  "pro-checkbox-group": ["pro-checkbox-group", "pro-checkbox-option", "checkbox", "checkbox-indicator"],
  "pro-pagination": [
    "pro-pagination",
    "pro-pagination-content",
    "pro-pagination-item",
    "pro-pagination-action",
    "pro-pagination-status",
    "pro-pagination-ellipsis",
    "pro-pagination-controls",
    "pro-pagination-total",
    "pro-pagination-page-size",
    "pro-pagination-quick-jumper",
    "pro-pagination-quick-input",
    "pro-pagination-quick-button",
  ],
  "pro-count-badge": ["pro-count-badge", "pro-count-badge-anchor", "pro-count-badge-indicator"],
  "pro-form": [
    "pro-form",
    "pro-form-field",
    "pro-form-label",
    "pro-form-control",
    "pro-form-description",
    "pro-form-error",
    "pro-form-submit-error",
    "pro-form-actions",
    "pro-form-reset",
    "pro-form-submit",
  ],
  "pro-number-field": [
    "pro-number-field",
    "pro-number-field-label",
    "pro-number-field-control",
    "pro-number-field-group",
    "pro-number-field-input",
    "pro-number-field-increment",
    "pro-number-field-decrement",
    "pro-number-field-description",
    "pro-number-field-error",
  ],
  "pro-otp-field": [
    "pro-otp-field",
    "pro-otp-field-label",
    "pro-otp-field-control",
    "pro-otp-field-group",
    "pro-otp-field-slot",
    "pro-otp-field-separator",
    "pro-otp-field-description",
    "pro-otp-field-error",
  ],
  "pro-icon-picker": [
    "pro-icon-picker",
    "pro-icon-picker-content",
    "pro-icon-picker-search",
    "pro-icon-picker-grid",
    "pro-icon-picker-option",
    "pro-icon-picker-empty",
  ],
  "pro-admin-login": [
    "pro-admin-login",
    "pro-admin-login-card",
    "pro-admin-login-header",
    "pro-admin-login-title",
    "pro-admin-login-description",
    "pro-admin-login-form",
    "pro-admin-login-field",
    "pro-admin-login-error",
    "pro-admin-login-notice",
    "pro-admin-login-actions",
    "pro-admin-login-submit",
    "pro-admin-login-back",
  ],
  "pro-admin-shell": [
    "pro-admin-shell",
    "pro-admin-header",
    "pro-admin-header-leading",
    "pro-admin-header-actions",
    "pro-admin-desktop-navigation",
    "pro-admin-mobile-trigger",
    "pro-admin-mobile-drawer",
    "pro-admin-mobile-section",
    "pro-admin-navigation-label",
    "pro-admin-navigation",
    "pro-admin-navigation-item",
    "pro-admin-body",
    "pro-admin-sidebar",
    "pro-admin-content",
  ],
};

const variants: Record<string, string[]> = {
  alert: ["neutral", "info", "success", "warning", "danger", "with-action"],
  button: ["solid", "outline", "soft", "ghost", "link"],
  card: ["default", "hoverable"],
  stack: ["row", "column", "wrap"],
  page: ["default", "with-actions", "responsive"],
  "toggle-group": ["single", "multiple", "horizontal", "vertical", "joined", "spaced", "block", "sm", "md", "lg"],
  link: ["primary", "muted", "inherit"],
  "description-list": ["vertical", "horizontal", "responsive", "sm", "md", "lg"],
  field: ["vertical", "horizontal", "responsive"],
  "input-group": ["inline-start", "inline-end", "block-start", "block-end", "input", "textarea", "button"],
  combobox: ["single", "multiple", "chips", "trigger-width", "content-width", "custom-width"],
  select: ["trigger-width", "content-width", "custom-width"],
  "pro-select": ["single", "multiple", "searchable", "custom-popup-width"],
  "number-field": ["controlled", "uncontrolled", "formatted", "scrubbable"],
  "otp-input": ["numeric", "alphanumeric", "masked", "sm", "md", "lg"],
  "radio-group": ["radio", "button-outline", "button-solid", "horizontal", "vertical", "block", "sm", "md", "lg"],
  pagination: ["link", "button", "simple", "responsive", "sm", "md", "lg"],
  "pro-radio-group": ["radio", "button", "custom-option"],
  "pro-checkbox-group": ["options", "custom-option", "horizontal", "vertical"],
  "pro-pagination": ["controlled", "uncontrolled", "page-size", "quick-jumper", "total", "simple", "responsive"],
  "pro-count-badge": ["standalone", "anchored", "overflow", "dot"],
  skeleton: ["text", "rectangular", "circular", "wave", "pulse", "none"],
  toast: ["neutral", "info", "success", "warning", "danger"],
};

const states: Record<string, string[]> = {
  alert: ["default", "with-action", "narrow"],
  button: ["default", "hover", "active", "focus-visible", "disabled", "loading"],
  card: ["default", "hoverable", "hover", "motion-reduced"],
  stack: ["default", "wrapped"],
  page: ["default", "narrow"],
  collapsible: ["closed", "open", "focus-visible"],
  "toggle-button": ["unpressed", "pressed", "hover", "active", "focus-visible", "disabled"],
  "toggle-group": ["unpressed", "pressed", "focus-visible", "disabled"],
  input: ["default", "hover", "focus", "invalid", "disabled"],
  field: ["default", "focused", "filled", "dirty", "touched", "invalid", "disabled"],
  "input-group": ["default", "focus-within", "invalid", "disabled"],
  combobox: ["closed", "open", "highlighted", "selected", "empty", "disabled"],
  "number-field": ["empty", "filled", "focused", "invalid", "disabled", "readonly", "scrubbing"],
  "otp-input": ["empty", "focused", "partial", "complete", "disabled", "invalid"],
  select: ["closed", "open", "highlighted", "selected", "disabled", "invalid"],
  dialog: ["closed", "open", "starting", "ending"],
  popover: ["closed", "open", "starting", "ending"],
  "dropdown-menu": ["closed", "open", "highlighted", "checked", "disabled"],
  tooltip: ["closed", "open", "starting", "ending"],
  tabs: ["default", "active", "focus-visible", "disabled"],
  toast: ["starting", "expanded", "limited", "swiping", "ending"],
  checkbox: ["unchecked", "checked", "indeterminate", "focus-visible", "disabled", "readonly", "invalid"],
  "radio-group": ["unchecked", "checked", "hover", "active", "focus-visible", "disabled", "readonly", "invalid"],
  "pro-radio-group": ["unchecked", "checked", "focus-visible", "disabled", "readonly", "invalid"],
  "pro-checkbox-group": ["unchecked", "checked", "indeterminate", "focus-visible", "disabled", "readonly", "invalid"],
  pagination: ["default", "current", "focus-visible", "disabled", "simple"],
  "pro-pagination": ["default", "current", "focus-visible", "disabled", "simple"],
  "pro-count-badge": ["hidden", "visible", "overflow", "dot"],
  switch: ["unchecked", "checked", "focus-visible", "disabled", "readonly", "invalid"],
  drawer: ["closed", "open", "swiping", "starting", "ending"],
  "alert-dialog": ["closed", "open", "starting", "ending"],
  skeleton: ["loading", "motion-reduced", "static"],
};

const tokens: Record<string, string[]> = {
  alert: ["--od-background", "--od-border", "--od-muted-foreground"],
  button: [
    "--od-button-radius",
    "--od-button-font-weight",
    "--od-button-shadow",
    "--od-button-padding-inline-sm",
    "--od-button-padding-inline-md",
    "--od-button-padding-inline-lg",
    "--od-focus-indicator",
  ],
  "toggle-button": ["--od-primary", "--od-primary-hover", "--od-primary-active", "--od-accent", "--od-background", "--od-border"],
  "toggle-group": ["--od-button-radius", "--od-border", "--od-focus-indicator"],
  input: ["--od-input-radius", "--od-input-active-shadow", "--od-input-focus-border", "--od-focus-indicator"],
  "input-group": ["--od-input-radius", "--od-input-active-shadow", "--od-input-focus-border", "--od-focus-indicator"],
  combobox: ["--od-menu-item-height", "--od-menu-padding-inline", "--od-overlay-shadow"],
  select: ["--od-menu-item-height", "--od-menu-padding-inline", "--od-overlay-shadow"],
  "dropdown-menu": ["--od-menu-item-height", "--od-menu-padding-inline", "--od-overlay-shadow"],
  card: ["--od-card-radius", "--od-card-shadow", "--od-card-gap"],
  stack: ["--od-space-1", "--od-space-2", "--od-space-3", "--od-space-4", "--od-space-6", "--od-space-8"],
  page: ["--od-space-2", "--od-space-4", "--od-space-6", "--od-space-8"],
  "pro-count-badge": ["--od-destructive", "--od-destructive-foreground"],
  dialog: ["--od-dialog-radius", "--od-dialog-max-width"],
  tabs: ["--od-tabs-item-height", "--od-tabs-gap"],
  toast: ["--od-z-toast", "--od-overlay-shadow"],
  "radio-group": ["--od-selection-control-size", "--od-primary", "--od-primary-hover", "--od-primary-active", "--od-focus-indicator"],
  pagination: ["--od-button-radius", "--od-primary", "--od-accent", "--od-focus-indicator", "--od-interactive-target-min"],
  checkbox: ["--od-selection-control-size", "--od-primary", "--od-primary-hover", "--od-focus-indicator"],
  switch: ["--od-switch-height", "--od-switch-width", "--od-primary", "--od-focus-indicator"],
  collapsible: ["--od-border", "--od-focus-indicator"],
  "description-list": ["--od-muted-foreground"],
  skeleton: ["--od-muted", "--od-background"],
};

export const odysseyCatalog = defineOdysseyCatalog(
  (source as CatalogSourceItem[]).map((item) => ({
    ...item,
    since: ["pro-checkbox-group", "pro-count-badge", "pro-pagination"].includes(item.name)
      ? "0.5.0"
      : item.name.startsWith("pro-")
        ? "0.3.0"
        : ["number-field", "otp-input"].includes(item.name)
          ? "0.10.0"
          : ["input-group", "combobox"].includes(item.name)
            ? "0.9.0"
            : ["alert", "slider", "drawer", "alert-dialog", "dropdown-menu"].includes(item.name)
              ? "0.6.0"
              : ["link", "code", "color-picker"].includes(item.name)
                ? "0.8.0"
                : item.name === "field"
                  ? "0.3.0"
                  : "0.1.0",
    parts: anatomy[item.name] ?? [item.name],
    variants: variants[item.name] ?? [],
    states: states[item.name] ?? ["default"],
    tokens: tokens[item.name] ?? [],
    migration:
      item.name === "pro-count-badge"
        ? undefined
        : ["pro-checkbox-group", "pro-pagination"].includes(item.name)
          ? "1-getting-started/v0-12-migration"
          : item.name.startsWith("pro-")
            ? ["pro-number-field", "pro-otp-field"].includes(item.name)
              ? "1-getting-started/pro-v0-5-migration"
              : item.name === "pro-form"
                ? "1-getting-started/pro-v0-4-migration"
                : "1-getting-started/pro-v0-3-migration"
            : ["radio-group", "toggle-button", "toggle-group", "checkbox", "input-group", "otp-input", "switch", "pagination"].includes(item.name)
              ? "1-getting-started/v0-12-migration"
              : ["dialog", "popover", "select", "tabs", "tooltip", "checkbox", "switch"].includes(item.name)
                ? "1-getting-started/v0-3-migration"
                : item.name === "card"
                  ? "1-getting-started/v0-4-migration"
                  : ["field", "toast"].includes(item.name)
                    ? "1-getting-started/v0-9-migration"
                    : undefined,
  })),
);

export const odysseyCatalogByDemoId = new Map(odysseyCatalog.flatMap((item) => item.demoIds.map((demoId) => [demoId, item] as const)));
