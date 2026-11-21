import { builtinThemeContractDigest, odysseyThemes, resolveOdysseyTheme } from "../src/theme";
import { disabledFadeCapabilities, disabledSemantics, drawsFocusHalo, focusHaloCapabilities, focusHaloPath, menuFocusSemantics, parseOdysseyColor, pressSemantics, type OdysseyColor } from "../src/tokens";
import type { OdysseyShadowToken } from "../src/tokens/types";

type Normalized = boolean | number | string | readonly number[] | { layers: readonly (readonly number[])[] };

const nativePaths = new Set([
  "seed.typography.fontFamily",
  "seed.typography.fontFamilyCode",
  "reference.typography.fontSans",
  "reference.typography.fontMono",
  "reference.typography.fontEditorial",
  "reference.shadow.emphasis",
  "reference.layer.popover",
  "reference.layer.dialog",
  "reference.layer.toast",
  "components.input.activeShadow",
  // The focus treatment of every capability but the input is the platform's
  // own: the contract reports the halo coverage, not the colours behind it.
  "components.button.focusBorder",
  "components.button.solidFocusBorder",
  "components.button.dangerSolidFocusBorder",
  "components.button.ghostFocusBorder",
  "components.iconButton.focusBorder",
  "components.field.focusBorder",
  "components.checkbox.focusBorder",
  "components.switch.focusBorder",
  "components.select.focusBorder",
  "components.tabs.focusBorder",
  "components.pagination.focusBorder",
]);

/**
 * The contract paths the shadcn theme alone declares.
 *
 * The elevation paths carry the official recipes and the two radius paths
 * pin the official surface geometry. The other three themes declare none of
 * them, so their path set stays exactly the one it always had.
 */
const shadcnOnlyPaths = new Set([
  "reference.shadow.xs",
  "reference.shadow.sm",
  "reference.shadow.md",
  "reference.shadow.lg",
  "components.button.shadow",
  "components.input.shadow",
  "components.switch.shadow",
  "components.tabs.triggerShadow",
  "components.card.shadow",
  "components.menu.shadow",
  "components.dialog.shadow",
  "components.alert.shadow",
  "components.badge.shadow",
  "components.skeleton.shadow",
  "components.tooltip.shadow",
  "components.table.radius",
  "components.iconButton.radius",
]);

function rgba(color: OdysseyColor): readonly number[] {
  const radians = (color.hue * Math.PI) / 180;
  const a = color.chroma * Math.cos(radians);
  const b = color.chroma * Math.sin(radians);
  const l = (color.lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const encode = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055;
  };
  return [
    encode(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    encode(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    encode(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
    color.alpha,
  ];
}

function colorValue(value: string): readonly number[] {
  const rgb = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/);
  if (rgb) return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255, rgb[4] === undefined ? 1 : Number(rgb[4])];
  const mix = value.match(/^color-mix\(in oklch, (oklch\(.+\)) ([\d.]+)%, transparent\)$/);
  if (!mix) return rgba(parseOdysseyColor(value));
  const result = [...rgba(parseOdysseyColor(mix[1]))];
  result[3] *= Number(mix[2]) / 100;
  return result;
}

function normalize(path: string, value: unknown): Normalized {
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (
      path.startsWith("seed.colors.") ||
      path.startsWith("semantic.color.") ||
      path.startsWith("components.switch.") ||
      path.endsWith(".focusBorder")
    )
      return colorValue(value);
    const length = value.match(/^([\d.]+)(rem|px)$/);
    if (length) return Number(length[1]) * (length[2] === "rem" ? 16 : 1);
    return value;
  }
  if (typeof value === "object" && value && "space" in value && value.space === "oklch") return rgba(value as OdysseyColor);
  throw new Error(`Unsupported token value at ${path}`);
}

/** A shadow the stylesheet paints: the contract compares the elevation of it. */
function isShadowToken(value: unknown): value is OdysseyShadowToken {
  return typeof value === "object" && value !== null && "css" in value && "layers" in value;
}

function flatten(value: unknown, path: string, output: Record<string, Normalized>, scoped: boolean): Record<string, Normalized> {
  if (nativePaths.has(path) || path === "colorScheme" || path === "density" || path === "interactions") return output;
  if (isShadowToken(value)) {
    // A shadow is painted by the stylesheet; only the paths the contract
    // declares are compared, and only in the theme that declares them.
    if (scoped && shadcnOnlyPaths.has(path)) output[path] = { layers: value.layers.map((layer) => [...layer]) };
    return output;
  }
  if (!scoped && shadcnOnlyPaths.has(path)) return output;
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${path}.${index}`, output, scoped));
  } else if (typeof value === "object" && value !== null && !("space" in value && value.space === "oklch")) {
    for (const [key, child] of Object.entries(value)) flatten(child, path ? `${path}.${key}` : key, output, scoped);
  } else {
    output[path] = normalize(path, value);
  }
  return output;
}

function modesFor(themeId: string, theme: (typeof odysseyThemes)[keyof typeof odysseyThemes]) {
  const scoped = themeId === "shadcn";
  return Object.fromEntries(((["light", "dark"] as const).flatMap((scheme) =>
    (["standard", "compact"] as const).map((density) => {
      const resolved = resolveOdysseyTheme(theme, scheme, density);
      const values = flatten(resolved, "", {}, scoped);
      // The focus halo coverage is read off the treatment every capability
      // paints, so a capability that stops drawing the halo is reported as
      // one that draws none.
      if (scoped)
        for (const capability of focusHaloCapabilities) values[focusHaloPath(capability)] = drawsFocusHalo(resolved, capability);
      // The press semantics the button paints: whether a press paints the
      // hover's own fill, and whether it paints a decoration of its own.
      // Both are read off the palette and the press rules, so the contract
      // states what the stack draws.
      if (scoped) {
        const press = pressSemantics(resolved, themeId);
        values["components.button.pressMatchesHover"] = press.matchesHover;
        values["components.button.pressDecoration"] = press.decoration;
        // The disabled semantics each control paints: the fraction the
        // disabled state keeps of its own colours, and whether those
        // colours are its own. Both are read off the disabled rules, so
        // the contract states what the stack draws.
        for (const capability of disabledFadeCapabilities) {
          const disabled = disabledSemantics(capability, themeId);
          values[`components.${capability}.disabledOpacity`] = disabled.opacity;
          values[`components.${capability}.disabledUsesOwnColors`] = disabled.usesOwnColors;
        }
        // The focus semantics a menu entry paints: whether the fill is the
        // accent surface, whether the ink is the accent ink, and whether the
        // entry wears an outline around itself. All three are read off the
        // rule the stylesheet paints.
        const menuFocus = menuFocusSemantics();
        values["components.dropdownMenu.focusUsesAccentFill"] = menuFocus.usesAccentFill;
        values["components.dropdownMenu.focusUsesAccentForeground"] = menuFocus.usesAccentForeground;
        values["components.dropdownMenu.focusDrawsOutline"] = menuFocus.drawsOutline;
      }
      return [`${scheme}.${density}`, values];
    }),
  )));
}


const symbols: Record<string, string> = {
  Button: "Button", IconButton: "IconButton", TextInput: "Input", Field: "Field",
  Checkbox: "Checkbox", Switch: "Switch", Select: "Select", Card: "Card",
  Divider: "Divider",
  Alert: "Alert", Badge: "Badge", EmptyState: "EmptyState",
  Progress: "Progress", Skeleton: "Skeleton", Dialog: "Dialog", Popover: "Popover",
  DropdownMenu: "DropdownMenu", Tooltip: "Tooltip", Tabs: "Tabs", Pagination: "Pagination",
  Toasts: "Toaster", Drawer: "Drawer",
};

const scenarioIds = ["a11y.name", "interaction.disabled", "keyboard.activate", "state.ownership", "focus.visible", "overlay.dismiss-restore", "motion.reduced", "layout.available-space", "layout.rtl", "state.matrix"];

const rtlWitness = "src/test/rtl.conformance.test.tsx";

// A capability claims a scenario only when a witness file really proves it.
// Every required scenario without a witness is registered as a precise,
// expiring debt entry in the contract instead of being papered over with a
// file that proves nothing.
const scenarioEvidence: Record<string, Record<string, string[]>> = {
  Toasts: {
    "a11y.name": ["src/primitives/Toast/Toast.test.tsx"],
  },
  Drawer: {
    "a11y.name": ["src/primitives/Drawer/Drawer.test.tsx"],
    "keyboard.activate": ["src/primitives/Drawer/Drawer.test.tsx"],
  },
  Button: {
    "a11y.name": ["src/primitives/Button/Button.test.tsx"],
    "interaction.disabled": ["src/primitives/Button/Button.test.tsx"],
    "focus.visible": ["src/primitives/Button/Button.test.tsx"],
    "keyboard.activate": ["src/primitives/Button/Button.test.tsx"],
    "state.matrix": ["src/primitives/Button/Button.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  IconButton: {
    "a11y.name": ["src/primitives/IconButton/IconButton.test.tsx"],
    "focus.visible": ["src/primitives/IconButton/IconButton.test.tsx"],
    "interaction.disabled": ["src/primitives/IconButton/IconButton.test.tsx"],
    "keyboard.activate": ["src/primitives/IconButton/IconButton.test.tsx"],
    "state.matrix": ["src/primitives/IconButton/IconButton.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  TextInput: {
    "a11y.name": ["src/primitives/Input/Input.test.tsx"],
    "interaction.disabled": ["src/primitives/Input/Input.test.tsx"],
    "keyboard.activate": ["src/primitives/Input/Input.test.tsx"],
    "state.matrix": ["src/primitives/Input/Input.test.tsx"],
    "state.ownership": ["src/primitives/Input/Input.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Field: {
    "a11y.name": ["src/primitives/Field/Field.test.tsx"],
    "interaction.disabled": ["src/primitives/Field/Field.test.tsx"],
    "state.matrix": ["src/primitives/Field/Field.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Checkbox: {
    "a11y.name": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "keyboard.activate": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "state.ownership": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "focus.visible": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "interaction.disabled": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "state.matrix": ["src/primitives/Checkbox/Checkbox.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Switch: {
    "a11y.name": ["src/primitives/Switch/Switch.test.tsx"],
    "focus.visible": ["src/primitives/Switch/Switch.test.tsx"],
    "interaction.disabled": ["src/primitives/Switch/Switch.test.tsx"],
    "keyboard.activate": ["src/primitives/Switch/Switch.test.tsx"],
    "state.matrix": ["src/primitives/Switch/Switch.test.tsx"],
    "state.ownership": ["src/primitives/Switch/Switch.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Select: {
    "layout.available-space": ["src/primitives/Select/Select.test.tsx"],
    "state.ownership": ["src/primitives/Select/Select.test.tsx"],
    "a11y.name": ["src/primitives/Select/Select.test.tsx"],
    "focus.visible": ["src/primitives/Select/Select.test.tsx"],
    "interaction.disabled": ["src/primitives/Select/Select.test.tsx"],
    "keyboard.activate": ["src/primitives/Select/Select.test.tsx"],
    "overlay.dismiss-restore": ["src/primitives/Select/Select.test.tsx"],
    "state.matrix": ["src/primitives/Select/Select.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Card: {
    "state.matrix": ["src/primitives/Card/Card.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Divider: {
    "layout.rtl": [rtlWitness],
  },
  Alert: {
    "a11y.name": ["src/primitives/Alert/Alert.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Badge: {
    "layout.rtl": [rtlWitness],
  },
  EmptyState: {
    "layout.rtl": [rtlWitness],
  },
  Progress: {
    "layout.rtl": [rtlWitness],
  },
  Skeleton: {
    "motion.reduced": ["src/primitives/Skeleton/Skeleton.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Dialog: {
    "a11y.name": ["src/primitives/Dialog/Dialog.test.tsx"],
    "overlay.dismiss-restore": ["src/primitives/Dialog/Dialog.test.tsx"],
    "keyboard.activate": ["src/primitives/Dialog/Dialog.test.tsx"],
    "state.matrix": ["src/primitives/Dialog/Dialog.test.tsx"],
    "state.ownership": ["src/primitives/Dialog/Dialog.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Popover: {
    "a11y.name": ["src/primitives/Popover/Popover.test.tsx"],
    "overlay.dismiss-restore": ["src/primitives/Popover/Popover.test.tsx"],
    "keyboard.activate": ["src/primitives/Popover/Popover.test.tsx"],
    "state.matrix": ["src/primitives/Popover/Popover.test.tsx"],
    "state.ownership": ["src/primitives/Popover/Popover.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  DropdownMenu: {
    "a11y.name": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "keyboard.activate": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "overlay.dismiss-restore": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "state.ownership": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "interaction.disabled": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "state.matrix": ["src/primitives/DropdownMenu/DropdownMenu.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Tooltip: {
    "a11y.name": ["src/primitives/Tooltip/Tooltip.test.tsx"],
    "keyboard.activate": ["src/primitives/Tooltip/Tooltip.test.tsx"],
    "state.matrix": ["src/primitives/Tooltip/Tooltip.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Tabs: {
    "a11y.name": ["src/primitives/Tabs/Tabs.test.tsx"],
    "focus.visible": ["src/primitives/Tabs/Tabs.test.tsx"],
    "interaction.disabled": ["src/primitives/Tabs/Tabs.test.tsx"],
    "keyboard.activate": ["src/primitives/Tabs/Tabs.test.tsx"],
    "state.matrix": ["src/primitives/Tabs/Tabs.test.tsx"],
    "state.ownership": ["src/primitives/Tabs/Tabs.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
  Pagination: {
    "a11y.name": ["src/primitives/Pagination/Pagination.test.tsx"],
    "interaction.disabled": ["src/primitives/Pagination/Pagination.test.tsx"],
    "state.matrix": ["src/primitives/Pagination/Pagination.test.tsx"],
    "focus.visible": ["src/primitives/Pagination/Pagination.test.tsx"],
    "keyboard.activate": ["src/primitives/Pagination/Pagination.test.tsx"],
    "layout.available-space": ["src/primitives/Pagination/Pagination.test.tsx"],
    "layout.rtl": [rtlWitness],
  },
};

for (const [id, evidence] of Object.entries(scenarioEvidence)) {
  for (const scenario of Object.keys(evidence)) {
    if (!scenarioIds.includes(scenario)) throw new Error(`design-system adapter: unknown scenario ${scenario} for ${id}`);
  }
}

const nativeEquivalence = nativePaths.size ? [{ id: "web.css-native-tokens", reason: "CSS font stacks, box shadows, and stacking contexts use browser-native representations.", tokenPaths: [...nativePaths] }] : [];

const extensions = [
  { id: "web.z-index", reason: "Browser stacking contexts require explicit CSS layer values." },
  { id: "Combobox", reason: "Registered as a non-core Web component until a later contract revision." },
  { id: "RadioGroup", reason: "Registered as a non-core Web component until a later contract revision." },
  { id: "DataTable", reason: "Registered as a non-core Web component until a later contract revision." },
  { id: "Toasts", reason: "Registered as a non-core Web component with demonstrated product consumers." },
  { id: "Drawer", reason: "Registered as a non-core Web component with demonstrated product consumers." },
];

const components = Object.fromEntries(
  Object.entries(symbols).map(([id, symbol]) => {
    const evidence = scenarioEvidence[id];
    if (!evidence) throw new Error(`design-system adapter: no scenario evidence declared for ${id}`);
    return [
      id,
      {
        symbol,
        tokenBindings:
          id === "Button" || id === "IconButton"
            ? ["components.button", "semantic.color.primary", "semantic.color.primaryForeground"]
            : ["semantic.color.foreground", "semantic.color.background"],
        scenarios: evidence,
      },
    ];
  }),
);

/** The adapter report the gate reads. */
export function buildAdapter() {
  return {
    schemaVersion: 2,
    platform: "web",
    themeContract: { schemaVersion: 2, sha256: builtinThemeContractDigest },
    themes: Object.fromEntries(Object.entries(odysseyThemes).map(([id, theme]) => [id, modesFor(id, theme)])),
    components,
    nativeEquivalence,
    extensions,
  };
}

// The report is printed when this script is the entry point; a test reads
// the builder instead of the printed report.
const isEntryPoint = (import.meta as ImportMeta & { main?: boolean }).main === true;
if (isEntryPoint) console.log(JSON.stringify(buildAdapter(), null, 2));
