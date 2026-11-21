import { odysseyTokenVars } from "../web";
import { fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/** The fade the official recipe paints for the text input. */
export const textInputDisabledFade: OdysseyDisabledFade = {
  capability: "textInput",
  presetOpacity: 0.72,
  rules: [
    {
      selector: ".od-Input-field:disabled",
      declarations: surface(odysseyTokenVars.background, odysseyTokenVars.foreground, odysseyTokenVars.input),
    },
  ],
};

/** The rules the text input's stylesheet paints with. */
export const textInputDisabledFadeRules = fadeRulesFor(textInputDisabledFade);
