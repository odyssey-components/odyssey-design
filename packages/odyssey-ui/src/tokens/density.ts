import type { OdysseyReferenceTokens, OdysseyResolvedTokens } from "./types";

// Expand a resolved Standard recipe so every preset keeps its own proportions.
export function expandSpaciousReference(reference: OdysseyReferenceTokens, unit: number): OdysseyReferenceTokens {
  for (const key of [2, 3, 4] as const) reference.space[key] += unit;
  for (const key of [6, 8] as const) reference.space[key] += unit * 2;
  for (const key of ["heightSm", "heightMd", "heightLg"] as const) reference.control[key] += 4;
  for (const key of ["paddingSm", "paddingMd", "paddingLg", "gap"] as const) reference.control[key] += unit;
  reference.control.itemHeight += 8;
  reference.selection.controlSize += 2;
  reference.selection.switchHeight += 2;
  reference.selection.switchWidth += 4;
  return reference;
}

export function expandSpaciousTokens(tokens: OdysseyResolvedTokens): void {
  const unit = tokens.seed.geometry.spacingUnit;
  expandSpaciousReference(tokens.reference, unit);
  const c = tokens.components;
  for (const key of ["paddingInlineSm", "paddingInlineMd", "paddingInlineLg"] as const) c.button[key] += unit;
  c.selection.size += 2;
  c.selection.switchHeight += 2;
  c.selection.switchWidth += 4;
  c.menu.itemHeight += 8;
  c.menu.paddingInline += unit;
  c.table.rowHeight += 8;
  c.table.cellPaddingInline += unit;
  c.table.cellPaddingBlock += unit;
  c.tabs.itemHeight += 8;
  c.card.gap += unit * 2;
  if (c.card.headerPaddingBlockEnd > 0) c.card.headerPaddingBlockEnd += unit * 2;
  if (c.card.footerPaddingBlockStart > 0) c.card.footerPaddingBlockStart += unit * 2;
}
