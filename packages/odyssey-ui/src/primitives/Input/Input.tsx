import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { OdysseySize } from "../../types";

const inputVariants = cva(
  "box-border w-full rounded-[var(--od-input-radius)] border-[length:var(--od-line-width)] border-[var(--od-input)] bg-[var(--od-background)] px-[var(--od-control-padding-sm)] py-[var(--od-control-gap)] font-[inherit] text-[length:var(--od-font-size-md)] leading-[var(--od-line-height-normal)] text-[var(--od-foreground)] shadow-[var(--od-input-shadow)] transition-[border-color,box-shadow,background] duration-[var(--od-duration-fast)] ease-[var(--od-ease-standard)] enabled:hover:border-[var(--od-primary-hover)] focus-visible:border-[var(--od-input-focus-border)] focus-visible:shadow-[var(--od-input-focus-shadow)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-[0.72] disabled:bg-[var(--od-disabled)] disabled:text-[var(--od-disabled-foreground)] placeholder:text-[var(--od-muted-foreground)] aria-[invalid=true]:border-[var(--od-destructive)] aria-[invalid=true]:focus-visible:shadow-[0_0_0_3px_color-mix(in_oklch,var(--od-destructive)_18%,transparent)] pointer-coarse:min-h-[max(var(--od-control-height-md),var(--od-interactive-target-min))]",
  {
    variants: {
      size: {
        sm: "h-[var(--od-control-height-sm)] px-[var(--od-control-padding-sm)] text-[length:var(--od-font-size-sm)]",
        md: "h-[var(--od-control-height-md)]",
        lg: "h-[var(--od-control-height-lg)] px-[var(--od-control-padding-lg)] text-[length:var(--od-font-size-lg)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface InputProps extends Omit<ComponentPropsWithoutRef<typeof BaseInput>, "size"> {
  size?: OdysseySize & VariantProps<typeof inputVariants>["size"];
}
export const Input = forwardRef<ComponentRef<typeof BaseInput>, InputProps>(function Input({ className, size = "md", ...props }, ref) {
  return <BaseInput ref={ref} data-od-slot="input" data-size={size} className={cn("od-Input-field", inputVariants({ size }), className)} {...props} />;
});
