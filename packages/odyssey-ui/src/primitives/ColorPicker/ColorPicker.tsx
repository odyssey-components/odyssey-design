import { Input as BaseInput } from "@base-ui/react/input";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../../lib/cn";
export interface ColorPickerProps extends Omit<ComponentPropsWithoutRef<typeof BaseInput>, "type"> {
  label?: string;
  allowAlpha?: boolean;
}
export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker({ label, allowAlpha = false, className, ...props }, ref) {
  return (
    <BaseInput
      ref={ref}
      type="color"
      aria-label={label}
      data-od-slot="color-picker"
      data-allow-alpha={allowAlpha || undefined}
      className={cn(
        "h-9 w-[3.25rem] cursor-pointer rounded-md border border-input bg-background p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
