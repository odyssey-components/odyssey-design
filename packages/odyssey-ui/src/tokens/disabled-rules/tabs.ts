import { odysseyTokenVars } from "../web";
import { fadeRulesFor, type OdysseyDisabledFade, surface } from "./shared";

/** The fade the official recipe paints for the tab trigger. */
export const tabsDisabledFade: OdysseyDisabledFade = {
  capability: "tabs",
  presetOpacity: 0.72,
  rules: [
    {
      selector: ".od-Tabs-tab[data-disabled]",
      declarations: surface("transparent", odysseyTokenVars.mutedForeground, "transparent"),
    },
    {
      selector: ".od-Tabs-tab[data-active][data-disabled]",
      declarations: surface("transparent", odysseyTokenVars.foreground, "transparent"),
    },
  ],
};

/** The rules the tab trigger's stylesheet paints with. */
export const tabsDisabledFadeRules = fadeRulesFor(tabsDisabledFade);
