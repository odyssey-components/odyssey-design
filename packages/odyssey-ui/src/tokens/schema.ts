import { parseOdysseyColor } from "./color";
import type { OdysseyDesignSeed } from "./types";

function assertPositiveNumber(value: number, path: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${path} must be a positive finite number.`);
}

/** Defines a complete, strongly typed Odyssey seed without an intermediate schema or generated artifact. */
export function defineOdysseyTokens<const TSeed extends OdysseyDesignSeed>(seed: TSeed): Readonly<TSeed> {
  for (const [name, value] of Object.entries(seed.colors)) {
    parseOdysseyColor(value);
    if (!value.trim()) throw new Error(`colors.${name} must not be empty.`);
  }
  if (!seed.typography.fontFamily.trim() || !seed.typography.fontFamilyCode.trim()) {
    throw new Error("Typography font families must not be empty.");
  }
  assertPositiveNumber(seed.typography.fontSize, "typography.fontSize");
  for (const [name, value] of Object.entries(seed.geometry)) assertPositiveNumber(value, `geometry.${name}`);
  if (!Number.isFinite(seed.motion.duration) || seed.motion.duration < 0) throw new Error("motion.duration must be a non-negative finite number.");
  if (!/^cubic-bezier\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)$/.test(seed.motion.easing)) {
    throw new Error("motion.easing must be a cubic-bezier() value.");
  }
  return Object.freeze(seed);
}

export const defaultOdysseyDesignSeed = defineOdysseyTokens({
  colors: {
    primary: "oklch(0.56 0.19 275)",
    neutral: "oklch(0.2 0.025 264)",
    danger: "oklch(0.55 0.22 25)",
    info: "oklch(0.52 0.17 245)",
    success: "oklch(0.52 0.14 155)",
    warning: "oklch(0.72 0.16 75)",
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif',
    fontFamilyCode: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 14,
  },
  geometry: { radius: 8, spacingUnit: 4, controlHeight: 36, lineWidth: 1 },
  motion: { enabled: true, duration: 120, easing: "cubic-bezier(0.2, 0, 0, 1)" },
} satisfies OdysseyDesignSeed);
