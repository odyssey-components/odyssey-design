import { odysseyTokenVars } from "../web";
import { faded, fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/** The fade the official recipe paints for the switch. */
export const switchDisabledFade: OdysseyDisabledFade = {
  capability: "switch",
  presetOpacity: 0.5,
  rules: [
    {
      selector: ".od-Switch-switch[data-disabled]",
      declarations: surface(odysseyTokenVars.switchTrackOff, odysseyTokenVars.foreground, odysseyTokenVars.border),
    },
    {
      selector: ".od-Switch-switch[data-checked][data-disabled]",
      declarations: surface(odysseyTokenVars.switchTrackOn, odysseyTokenVars.foreground, odysseyTokenVars.switchTrackOn),
    },
    {
      selector: ".od-Switch-switch[data-disabled] .od-Switch-thumb",
      declarations: `background:${faded(odysseyTokenVars.background)};`,
    },
    {
      selector: ".od-Switch-switch[data-checked][data-disabled] .od-Switch-thumb",
      declarations: `background:${faded(odysseyTokenVars.primaryForeground)};`,
    },
  ],
};

/** The rules the switch's stylesheet paints with. */
export const switchDisabledFadeRules = fadeRulesFor(switchDisabledFade);
