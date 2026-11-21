import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const cardVariants = cva(
  "flex flex-col gap-[var(--od-card-gap)] border border-[var(--od-border)] bg-[var(--od-card)] py-[var(--od-space-6)] text-[var(--od-card-foreground)] rounded-[var(--od-card-radius)] shadow-[var(--od-card-shadow)] transition-[border-color,box-shadow,transform] duration-[var(--od-duration-fast)] ease-[var(--od-ease-standard)] [&:not(:has(>_[data-od-slot^=card-]))]:px-[var(--od-space-6)]",
  {
    variants: {
      hoverable: {
        true: "[@media(hover:hover)]:hover:border-[color-mix(in_oklch,var(--od-primary)_36%,var(--od-border))] [@media(hover:hover)]:hover:shadow-[var(--od-dialog-shadow)] [@media(hover:hover)]:hover:-translate-y-[2px] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        false: "",
      },
    },
    defaultVariants: { hoverable: false },
  },
);

const cardHeaderStyles =
  "grid grid-cols-[minmax(0,1fr)] grid-auto-rows-[min-content] items-start gap-[var(--od-space-2)] border-b-[length:var(--od-card-header-divider-width)] border-[var(--od-border)] px-[var(--od-space-6)] pb-[var(--od-card-header-padding-block-end)] last:border-b-0 has-[[data-od-slot=card-action]]:grid-cols-[minmax(0,1fr)_auto]";
const cardTitleStyles = "col-start-1 text-[length:var(--od-font-size-lg)] font-[var(--od-font-weight-semibold)] tracking-[-0.015em] leading-none";
const cardDescriptionStyles = "col-start-1 text-[length:var(--od-font-size-sm)] leading-[var(--od-line-height-normal)] text-[var(--od-muted-foreground)]";
const cardActionStyles = "col-start-2 row-span-2 self-start justify-self-end";
const cardContentStyles = "px-[var(--od-space-6)]";
const cardFooterStyles =
  "flex items-center gap-[var(--od-space-2)] border-t-[length:var(--od-card-footer-divider-width)] border-[var(--od-border)] px-[var(--od-space-6)] pt-[var(--od-card-footer-padding-block-start)]";

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, hoverable = false, ...props }, ref) {
  return <div ref={ref} data-od-slot="card" data-hoverable={hoverable || undefined} className={cn(cardVariants({ hoverable }), className)} {...props} />;
});

function cardPart(slot: string, className: string) {
  return forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardPart({ className: customClassName, ...props }, ref) {
    return <div ref={ref} data-od-slot={slot} className={cn(className, customClassName)} {...props} />;
  });
}

export const CardHeader = cardPart("card-header", cardHeaderStyles);
export const CardTitle = cardPart("card-title", cardTitleStyles);
export const CardDescription = cardPart("card-description", cardDescriptionStyles);
export const CardAction = cardPart("card-action", cardActionStyles);
export const CardContent = cardPart("card-content", cardContentStyles);
export const CardFooter = cardPart("card-footer", cardFooterStyles);
