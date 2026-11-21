import { elevationToCss, type OdysseyElevationLevel, officialElevation, shadow } from "../tokens/elevation";
import type { OdysseyShadowToken } from "../tokens/types";
import type { OdysseyThemeAlgorithm } from "../types";

/** The official Tailwind v4 shadow levels the shadcn recipe paints. */
const officialShadow = (level: OdysseyElevationLevel): OdysseyShadowToken => {
  const elevation = officialElevation[level];
  return shadow(elevationToCss(elevation), elevation.layers);
};

/**
 * The official shadcn radius ladder.
 *
 * The generic ladder is `(base, 0.6·base, base, 1.5·base, 2·base)`, which
 * produces at most four different radii and resolves `md` to the base — the
 * official recipe needs five distinct steps and an `md` of its own. The
 * official CLI derives its ladder multiplicatively from `--radius`, so this
 * follows the same formula and reads the base from the seed: a contract that
 * moves the seed moves the ladder with it.
 */
const officialRadiusLadder = (base: number) => ({
  base: `${base / 16}rem`,
  xs: `${(base * 0.5) / 16}rem`,
  sm: `${(base * 0.75) / 16}rem`,
  md: `${(base * 0.875) / 16}rem`,
  lg: `${base / 16}rem`,
  xl: `${(base * 1.5) / 16}rem`,
  pill: "999px",
});

export const shadcnThemeAlgorithm: OdysseyThemeAlgorithm = (tokens) => {
  const radius = officialRadiusLadder(tokens.seed.geometry.radius);
  const xs = officialShadow("xs");
  const sm = officialShadow("sm");
  const md = officialShadow("md");
  const lg = officialShadow("lg");
  return {
    reference: {
      radius,
      shadow: { xs, sm, md, lg, emphasis: lg },
    },
    components: {
      // The official recipe has no outline variant, so no button carries a
      // shadow: only the official outline variant would have had one.
      button: { radius: radius.md, shadow: shadow("none") },
      input: { radius: radius.md, shadow: xs },
      switch: { shadow: xs },
      card: { radius: radius.xl, shadow: sm },
      dialog: { radius: radius.lg, shadow: lg },
      menu: { radius: radius.md, shadow: md },
      // The official tabs list and its trigger carry the recipe's own steps.
      tabs: { radius: radius.lg, triggerRadius: radius.md, triggerShadow: sm },
      // The official recipe paints no shadow on these four surfaces.
      alert: { radius: radius.lg, shadow: shadow("none") },
      badge: { radius: radius.pill, shadow: shadow("none") },
      skeleton: { radius: radius.md, shadow: shadow("none") },
      tooltip: { radius: radius.md, shadow: shadow("none") },
      // The icon button inherits the button's radius.
      iconButton: { radius: radius.md },
      // The official table container carries no radius of its own: it is a
      // plain `relative w-full overflow-x-auto` wrapper.
      table: { radius: "0px" },
      // The official checkbox is a fixed four pixels, not a ladder step.
      checkbox: { radius: "4px" },
    },
  };
};
