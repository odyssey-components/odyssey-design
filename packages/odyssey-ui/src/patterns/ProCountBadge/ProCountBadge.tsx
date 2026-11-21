import { Badge, type BadgeProps } from "@odyssey/ui/primitives/badge";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  defineProSemanticParts,
  mergeStyles,
  type ProSemanticClassNamesFor,
  type ProSemanticPart,
  type ProSemanticStylesFor,
  semanticPartProps,
} from "../semantic-parts";

export const proCountBadgeParts = defineProSemanticParts({
  root: "pro-count-badge",
  anchor: "pro-count-badge-anchor",
  indicator: "pro-count-badge-indicator",
} as const);
export type ProCountBadgePart = ProSemanticPart<typeof proCountBadgeParts>;
export type ProCountBadgeClassNames = ProSemanticClassNamesFor<typeof proCountBadgeParts>;
export type ProCountBadgeStyles = ProSemanticStylesFor<typeof proCountBadgeParts>;

export interface ProCountBadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: ReactNode;
  classNames?: ProCountBadgeClassNames;
  count: number;
  dot?: boolean;
  label?: string;
  overflowCount?: number;
  renderCount?: (count: number, displayValue: string) => ReactNode;
  showZero?: boolean;
  styles?: ProCountBadgeStyles;
  tone?: BadgeProps["tone"];
}

function normalizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

export const ProCountBadge = forwardRef<HTMLSpanElement, ProCountBadgeProps>(function ProCountBadge(
  { children, className, classNames, count, dot = false, label, overflowCount = 99, renderCount, showZero = false, style, styles, tone = "danger", ...props },
  ref,
) {
  const resolvedCount = normalizeCount(count);
  const resolvedOverflow = normalizeCount(overflowCount);
  const displayValue = resolvedCount > resolvedOverflow ? `${resolvedOverflow}+` : String(resolvedCount);
  const visible = resolvedCount > 0 || showZero;
  const hasAnchor = children !== undefined && children !== null;

  return (
    <span
      ref={ref}
      data-od-slot={proCountBadgeParts.root}
      data-has-anchor={hasAnchor || undefined}
      className={cn("relative inline-flex max-w-full align-middle", classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
      {...props}
    >
      {hasAnchor && (
        <span
          {...semanticPartProps("anchor", classNames, styles)}
          data-od-slot={proCountBadgeParts.anchor}
          className={cn("inline-flex min-w-0 max-w-full", classNames?.anchor)}
        >
          {children}
        </span>
      )}
      {visible && (
        <Badge
          {...semanticPartProps("indicator", classNames, styles)}
          aria-hidden={dot && !label ? true : undefined}
          aria-label={label ?? (dot ? undefined : displayValue)}
          data-dot={dot || undefined}
          data-od-slot={proCountBadgeParts.indicator}
          tone={tone}
          className={cn(
            "min-w-[1.375rem] justify-center",
            hasAnchor && "absolute end-0 top-0 z-[1] -translate-y-1/2 translate-x-1/2 rtl:-translate-x-1/2",
            dot && "h-2.5 min-h-2.5 min-w-2.5 rounded-full p-0",
            classNames?.indicator,
            (semanticPartProps("indicator", classNames, styles) as { className?: string }).className,
          )}
        >
          {dot ? null : (renderCount?.(resolvedCount, displayValue) ?? displayValue)}
        </Badge>
      )}
    </span>
  );
});
