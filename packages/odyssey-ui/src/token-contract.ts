export type { OdysseyCssVariable, OdysseyWebTokenGroup, OdysseyWebTokenKind } from "./tokens";
export {
  odysseyCssVariables,
  odysseyTokenVars,
  odysseyWebTokenContract as odysseyTokenContract,
  odysseyWebTokenMetadata,
} from "./tokens";

import type { odysseyCssVariables } from "./tokens";

export type OdysseyTokenName = keyof typeof odysseyCssVariables;
export type OdysseyTokenVars = Readonly<{
  [Name in OdysseyTokenName]: `var(${(typeof odysseyCssVariables)[Name]})`;
}>;
export type OdysseyComputedTokens = Readonly<Record<OdysseyTokenName, string>>;
export type OdysseyTokenKey = typeof import("./tokens").odysseyWebTokenMetadata[number]["path"];
