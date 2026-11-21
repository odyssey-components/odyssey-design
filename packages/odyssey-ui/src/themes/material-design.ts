import type { OdysseyThemeAlgorithm } from "../types";

export const materialDesignThemeAlgorithm: OdysseyThemeAlgorithm = (tokens) => ({
  components: {
    button: { fontWeight: 500, shadow: tokens.reference.shadow.sm },
    card: { shadow: tokens.reference.shadow.sm },
  },
});
