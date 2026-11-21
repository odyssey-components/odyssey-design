const interactionRecipeBrand: unique symbol = Symbol("OdysseyInteractionRecipe");

/**
 * An opaque interaction policy. Recipes are selected by themes;
 * components and applications do not select individual visual effects.
 */
export interface OdysseyInteractionRecipe {
  readonly [interactionRecipeBrand]: true;
}

type FeedbackDriver = "outline-wave" | "radial-ripple";
type ActionSurface = "filled" | "outlined" | "plain";
type InteractionTarget = "action" | "selection" | "toggle";

interface InteractionRule {
  driver: FeedbackDriver;
  target: InteractionTarget;
  surfaces?: readonly ActionSurface[];
}

interface InternalInteractionRecipe extends OdysseyInteractionRecipe {
  readonly rules: readonly InteractionRule[];
}

function defineInteractionRecipe(rules: readonly InteractionRule[]): OdysseyInteractionRecipe {
  return Object.freeze({ [interactionRecipeBrand]: true, rules }) as InternalInteractionRecipe;
}

export const odysseyInteractionRecipes = Object.freeze({
  quiet: defineInteractionRecipe([]),
  antDesign: defineInteractionRecipe([
    { driver: "outline-wave", target: "action", surfaces: ["filled", "outlined"] },
    { driver: "outline-wave", target: "selection" },
    { driver: "outline-wave", target: "toggle" },
  ]),
  material: defineInteractionRecipe([{ driver: "radial-ripple", target: "action", surfaces: ["filled", "outlined", "plain"] }]),
});

export function getInteractionRules(recipe: OdysseyInteractionRecipe | undefined): readonly InteractionRule[] {
  return recipe ? (recipe as InternalInteractionRecipe).rules : [];
}
