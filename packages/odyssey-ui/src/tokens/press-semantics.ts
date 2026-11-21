import { pressNudgePalettes } from "./press-rules";
import type { OdysseyResolvedTokens } from "./types";

/**
 * The press semantics the button paints.
 *
 * The contract publishes two facts about a press: whether it paints the
 * hover's own fill, and whether it paints a decoration of its own. The
 * answer is read off what the button paints with — the palette's press fill
 * and the rules the stylesheet applies — so a palette that grows a press
 * fill or a nudge is reported as one that has them.
 */
export interface OdysseyPressSemantics {
  /** A press paints the same fill as the hover. */
  matchesHover: boolean;
  /** A press paints a decoration of its own. */
  decoration: boolean;
}

/**
 * The press semantics the button paints under a theme.
 *
 * The official recipe declares no active state, so its press paints what its
 * hover paints and nothing else: the palette's active fill is the hover
 * fill's own value, and the palette is not one that nudges.
 */
export function pressSemantics(tokens: OdysseyResolvedTokens, themeId: string): OdysseyPressSemantics {
  const color = tokens.semantic.color;
  // A press paints the palette's press fill. The official palette owns none:
  // its active fill is the hover fill's own value, so the two states are one
  // value rather than two that happen to agree.
  const matchesHover = color.primaryActive === color.primaryHover && color.destructiveActive === color.destructiveHover;
  // A press paints a decoration of its own only where the palette asks for
  // one: the presets that own no press fill nudge the button instead, and a
  // palette that owns a press fill of its own already differs from its hover.
  const decoration = pressNudgePalettes.includes(themeId as (typeof pressNudgePalettes)[number]) || !matchesHover;
  return { matchesHover, decoration };
}
