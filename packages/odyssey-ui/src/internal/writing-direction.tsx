import { DirectionProvider } from "@base-ui/react/direction-provider";
import type { ReactNode } from "react";

export type WritingDirection = "ltr" | "rtl";

/** Reads the direction declared on the document element. */
export function documentDirection(): WritingDirection {
  if (typeof document === "undefined") return "ltr";
  return document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
}

/**
 * Resolves the direction declared by the closest `[dir]` ancestor of `element`,
 * falling back to the document element.
 */
export function inheritedDirection(element: Element | null): WritingDirection {
  const declared = element?.closest("[dir]")?.getAttribute("dir");
  if (declared === "rtl" || declared === "ltr") return declared;
  return documentDirection();
}

/**
 * Overrides the ambient writing direction for a subtree when the caller declares
 * an explicit `dir`. Without an explicit `dir` the ambient direction is kept, so
 * Base UI composite widgets keep mirroring their arrow keys consistently.
 */
export function WritingDirectionOverride({ dir, children }: { dir?: string; children: ReactNode }) {
  if (dir !== "rtl" && dir !== "ltr") return <>{children}</>;
  return <DirectionProvider direction={dir}>{children}</DirectionProvider>;
}
