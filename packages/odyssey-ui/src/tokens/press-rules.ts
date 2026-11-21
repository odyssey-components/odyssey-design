/**
 * The press rules the button paints with.
 *
 * The official shadcn recipe declares no active state: a press paints the
 * fill the hover paints, moves nothing, draws no outline and changes no
 * shadow. The presets that own no press fill of their own need another way
 * to tell a press from a hover, and the nudge is it — their outline, soft
 * and ghost buttons resolve the very fill their hover paints, so the nudge
 * is the only cue that says the pointer is down.
 *
 * The lists live here so the stylesheet and the contract read the same
 * fact: a palette that is added to the nudge list stops being one whose
 * press looks like its hover, and the contract reports that without anyone
 * remembering to change two places.
 */

/** The palettes whose press nudges the button. */
export const pressNudgePalettes = ["ant-design", "fluent", "material-design"] as const;

/** The variants the nudge applies to. */
export const pressNudgeVariants = ["outline", "soft", "ghost"] as const;

/**
 * The selectors that nudge a pressed button.
 *
 * The rule is scoped to the palettes that own a nudge: the official recipe
 * has no transform at all, so a shadcn press looks exactly like its hover.
 */
export function pressNudgeSelectors(classPrefix = "od-Button-") {
  return pressNudgePalettes.flatMap((palette) =>
    pressNudgeVariants.map((variant) => `[data-od-theme="${palette}"] &.${classPrefix}${variant}:active:not(:disabled)`),
  );
}
