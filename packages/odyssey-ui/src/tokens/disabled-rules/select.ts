import { odysseyTokenVars } from "../web";
import { fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/** The fade the official recipe paints for the select trigger. */
export const selectDisabledFade: OdysseyDisabledFade = {
  capability: "select",
  presetOpacity: 0.72,
  rules: [
    {
      selector: ".od-Select-trigger[data-disabled]",
      declarations: surface(odysseyTokenVars.background, odysseyTokenVars.foreground, odysseyTokenVars.input),
    },
    {
      selector: '.od-Select-trigger[data-variant="ghost"][data-disabled]',
      declarations: surface("transparent", odysseyTokenVars.foreground, "transparent"),
    },
  ],
};

/** The rules the select trigger's stylesheet paints with. */
export const selectDisabledFadeRules = fadeRulesFor(selectDisabledFade);
