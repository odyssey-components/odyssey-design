import { OVERLAY_RTL_CASES } from "./rtl-cases-overlays";
import { PRIMITIVE_RTL_CASES } from "./rtl-cases-primitives";
import type { RtlCase } from "./rtl-harness";

/** Every capability the contract requires on the Web platform, with the elements that carry them. */
export const RTL_CASES: RtlCase[] = [...PRIMITIVE_RTL_CASES, ...OVERLAY_RTL_CASES];
