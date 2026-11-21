import { odysseyTokenVars } from "../web";
import { fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/**
 * The button's own variants.
 *
 * The base `od-Button-button` class is carried by every button, so its rule
 * comes first and the variants that follow take over from it. The outline
 * variant carries no paint of its own — it rests on the base fill, ink and
 * border — so the base rule covers it.
 */
const buttonVariants: readonly {
  selector: string;
  fill: string;
  ink: string;
  border: string;
}[] = [
  {
    selector: "od-Button-button",
    fill: odysseyTokenVars.background,
    ink: odysseyTokenVars.foreground,
    border: odysseyTokenVars.border,
  },
  {
    selector: "od-Button-solid",
    fill: odysseyTokenVars.primary,
    ink: odysseyTokenVars.primaryForeground,
    border: odysseyTokenVars.primary,
  },
  {
    selector: "od-Button-soft",
    fill: odysseyTokenVars.accent,
    ink: odysseyTokenVars.accentForeground,
    border: "transparent",
  },
  {
    selector: "od-Button-ghost",
    fill: "transparent",
    ink: odysseyTokenVars.foreground,
    border: "transparent",
  },
  {
    selector: "od-Button-link",
    fill: "transparent",
    ink: odysseyTokenVars.primary,
    border: "transparent",
  },
  {
    selector: "od-Button-danger:not(.od-Button-solid)",
    fill: "transparent",
    ink: odysseyTokenVars.destructive,
    border: odysseyTokenVars.border,
  },
  {
    selector: "od-Button-danger.od-Button-solid",
    fill: odysseyTokenVars.destructive,
    ink: odysseyTokenVars.destructiveForeground,
    border: odysseyTokenVars.destructive,
  },
];

/** The fade the official recipe paints for the button. */
export const buttonDisabledFade: OdysseyDisabledFade = {
  capability: "button",
  presetOpacity: 0.72,
  rules: buttonVariants.map((variant) => ({
    selector: `.${variant.selector}:disabled`,
    declarations: surface(variant.fill, variant.ink, variant.border),
  })),
};

/** The rules the button's stylesheet paints with. */
export const buttonDisabledFadeRules = fadeRulesFor(buttonDisabledFade);
