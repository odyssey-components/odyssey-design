import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../../lib/cn";
import type { OdysseySize } from "../../types";

const fileInputVariants = cva(
  "box-border w-full rounded-[var(--od-input-radius)] border-[length:var(--od-line-width)] border-[var(--od-input)] bg-[var(--od-background)] p-[var(--od-space-1)] font-[inherit] text-[var(--od-foreground)] transition-[border-color,box-shadow] duration-[var(--od-duration-fast)] ease-[var(--od-ease-standard)] enabled:hover:border-[var(--od-primary-hover)] focus-visible:border-[var(--od-input-focus-border)] focus-visible:shadow-[var(--od-input-active-shadow)] focus-visible:outline-none disabled:bg-[var(--od-disabled)] disabled:text-[var(--od-disabled-foreground)] disabled:cursor-not-allowed disabled:opacity-[0.72] aria-[invalid=true]:border-[var(--od-destructive)] file:min-h-[calc(var(--od-control-height-md)-var(--od-space-2))] file:me-[var(--od-space-3)] file:rounded-[var(--od-radius-sm)] file:border-0 file:bg-[var(--od-secondary)] file:px-[var(--od-control-padding-sm)] file:font-[inherit] file:text-[var(--od-secondary-foreground)] file:cursor-pointer pointer-coarse:min-h-[max(var(--od-control-height-md),var(--od-interactive-target-min))]",
  {
    variants: {
      size: {
        sm: "min-h-[var(--od-control-height-sm)] text-[length:var(--od-font-size-sm)]",
        md: "min-h-[var(--od-control-height-md)]",
        lg: "min-h-[var(--od-control-height-lg)] text-[length:var(--od-font-size-lg)]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface FileInputProps extends Omit<ComponentPropsWithoutRef<typeof BaseInput>, "size" | "type"> {
  size?: OdysseySize & VariantProps<typeof fileInputVariants>["size"];
}
export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(function FileInput({ className, size = "md", ...props }, ref) {
  return <BaseInput ref={ref} type="file" data-od-slot="file-input" data-size={size} className={cn(fileInputVariants({ size }), className)} {...props} />;
});
