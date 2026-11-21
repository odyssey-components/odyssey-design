import type { OdysseyElevation, OdysseyElevationLayer, OdysseyShadowToken } from "./types";

/**
 * The official Tailwind v4 shadow recipes.
 *
 * These are the single source of truth for the four elevation levels the
 * shadcn recipe paints: the CSS the stylesheet uses and the structured
 * elevation the contract compares are two readings of the same numbers.
 */
export const officialElevation = {
  xs: { layers: [[0, 1, 2, 0, 0, 0, 0, 0.05]] },
  sm: {
    layers: [
      [0, 1, 3, 0, 0, 0, 0, 0.1],
      [0, 1, 2, -1, 0, 0, 0, 0.1],
    ],
  },
  md: {
    layers: [
      [0, 4, 6, -1, 0, 0, 0, 0.1],
      [0, 2, 4, -2, 0, 0, 0, 0.1],
    ],
  },
  lg: {
    layers: [
      [0, 10, 15, -3, 0, 0, 0, 0.1],
      [0, 4, 6, -4, 0, 0, 0, 0.1],
    ],
  },
} as const satisfies Record<string, OdysseyElevation>;

export type OdysseyElevationLevel = keyof typeof officialElevation;

/** A CSS length: Tailwind writes a zero offset without a unit. */
const length = (value: number): string => (value === 0 ? "0" : `${value}px`);

const rgb = (layer: OdysseyElevationLayer): string =>
  `rgb(${Math.round(layer[4] * 255)} ${Math.round(layer[5] * 255)} ${Math.round(layer[6] * 255)} / ${layer[7]})`;

/**
 * Serializes an elevation into the CSS box-shadow the stylesheet paints.
 *
 * The output is the upstream recipe verbatim — `0 1px 3px 0 rgb(0 0 0 / 0.1),
 * 0 1px 2px -1px rgb(0 0 0 / 0.1)` — so the two readings of a shadow cannot
 * drift apart.
 */
export function elevationToCss(elevation: OdysseyElevation): string {
  if (!elevation.layers.length) return "none";
  return elevation.layers.map((layer) => `${length(layer[0])} ${length(layer[1])} ${length(layer[2])} ${length(layer[3])} ${rgb(layer)}`).join(", ");
}

/**
 * A shadow the theme declares.
 *
 * The CSS is what the stylesheet paints; the layers are what the contract
 * compares. A theme that declares no elevation leaves the layers out, and the
 * adapter then keeps the path native instead of inventing a value for it.
 */
export function shadow(css: string, layers: readonly OdysseyElevationLayer[] = []): OdysseyShadowToken {
  return { css, layers };
}

/** The elevation a shadow declares, in the shape the contract compares. */
export function shadowElevation(value: OdysseyShadowToken): OdysseyElevation {
  return { layers: value.layers ?? [] };
}
