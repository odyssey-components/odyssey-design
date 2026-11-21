import type { OdysseyColor } from "./types";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function parseOdysseyColor(value: string): OdysseyColor {
  const oklch = value.match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+)%?)?\s*\)$/i);
  if (oklch) {
    const percentLightness = value.match(/^oklch\(\s*[\d.]+%/i) !== null;
    const percentAlpha = oklch[4] !== undefined && value.match(/\/\s*[\d.]+%/) !== null;
    return {
      space: "oklch",
      lightness: clamp(Number(oklch[1]) / (percentLightness ? 100 : 1)),
      chroma: Math.max(0, Number(oklch[2])),
      hue: ((Number(oklch[3]) % 360) + 360) % 360,
      alpha: clamp(oklch[4] === undefined ? 1 : Number(oklch[4]) / (percentAlpha ? 100 : 1)),
    };
  }
  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (!hex || ![3, 4, 6, 8].includes(hex.length)) throw new Error(`Unsupported Odyssey seed color: ${value}`);
  const expanded = hex.length <= 4 ? [...hex].map((digit) => `${digit}${digit}`).join("") : hex;
  const [r, g, b] = [0, 2, 4].map((offset) => srgbToLinear(Number.parseInt(expanded.slice(offset, offset + 2), 16) / 255));
  const lr = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const mr = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const sr = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * lr + 0.793617785 * mr - 0.0040720468 * sr;
  const a = 1.9779984951 * lr - 2.428592205 * mr + 0.4505937099 * sr;
  const bb = 0.0259040371 * lr + 0.7827717662 * mr - 0.808675766 * sr;
  return {
    space: "oklch",
    lightness,
    chroma: Math.sqrt(a * a + bb * bb),
    hue: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
    alpha: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
  };
}

export function adjustOdysseyColor(color: OdysseyColor, lightness: number, chroma = 1): OdysseyColor {
  return { ...color, lightness: clamp(color.lightness + lightness, 0.08, 0.99), chroma: Math.max(0, color.chroma * chroma) };
}

export function setOdysseyColorTone(color: OdysseyColor, lightness: number, chroma = 1): OdysseyColor {
  return { ...color, lightness: clamp(lightness, 0.08, 1), chroma: Math.max(0, color.chroma * chroma) };
}

export function serializeOdysseyColor(color: OdysseyColor): string {
  const l = Number(color.lightness.toFixed(3));
  const c = Number(color.chroma.toFixed(3));
  const h = Number(color.hue.toFixed(1));
  return `oklch(${l} ${c} ${h}${color.alpha < 1 ? ` / ${Number(color.alpha.toFixed(3))}` : ""})`;
}

/** The same colour at another alpha, in the canonical oklch form. */
export function odysseyColorWithAlpha(value: string, alpha: number): string {
  return serializeOdysseyColor({ ...parseOdysseyColor(value), alpha: clamp(alpha, 0, 1) });
}

export function odysseyColorLuminance(color: OdysseyColor): number {
  const radians = (color.hue * Math.PI) / 180;
  const a = color.chroma * Math.cos(radians);
  const b = color.chroma * Math.sin(radians);
  const l = (color.lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (color.lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (color.lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const red = clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const green = clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const blue = clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function readableOdysseyForeground(background: OdysseyColor): OdysseyColor {
  const luminance = odysseyColorLuminance(background);
  return luminance > 0.197 ? parseOdysseyColor("oklch(0.19 0.01 264)") : parseOdysseyColor("oklch(0.99 0 0)");
}

export function odysseyContrastRatio(foreground: OdysseyColor, background: OdysseyColor): number {
  const first = odysseyColorLuminance(foreground);
  const second = odysseyColorLuminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
