import { odysseyTokenVars } from "../web";
import { fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/** The fade the official recipe paints for the checkbox. */
export const checkboxDisabledFade: OdysseyDisabledFade = {
  capability: "checkbox",
  presetOpacity: 0.72,
  rules: [
    {
      selector: ".od-Checkbox-control[data-disabled]",
      declarations: surface(odysseyTokenVars.background, odysseyTokenVars.foreground, odysseyTokenVars.input),
    },
    {
      selector: ".od-Checkbox-control[data-checked][data-disabled]",
      declarations: surface(odysseyTokenVars.primary, odysseyTokenVars.primaryForeground, odysseyTokenVars.primary),
    },
  ],
};

/** The rules the checkbox's stylesheet paints with. */
export const checkboxDisabledFadeRules = fadeRulesFor(checkboxDisabledFade);
