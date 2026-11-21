import type { Toggle as BaseToggleTypes } from "@base-ui/react/toggle";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { type ForwardedRef, forwardRef, type ReactElement } from "react";
import { cn } from "../../lib/cn";
import type { ButtonProps } from "../Button";

const toggleButtonVariants = cva(
  "od-ToggleButton-control inline-flex min-h-[var(--od-control-height-md)] items-center justify-center gap-[var(--od-control-gap)] rounded-[var(--od-button-radius)] border border-[var(--od-border)] bg-[var(--od-background)] px-[var(--od-button-padding-inline-md)] font-[inherit] text-[length:var(--od-font-size-md)] text-[var(--od-foreground)] transition-[background,border-color,color,box-shadow] duration-[var(--od-duration-fast)] [transition-timing-function:var(--od-ease-standard)] hover:bg-[var(--od-accent)] hover:text-[var(--od-accent-foreground)] focus-visible:outline-none focus-visible:shadow-[0_0_0_var(--od-focus-ring-width)_var(--od-focus-ring)] data-[pressed]:border-[var(--od-primary)] data-[pressed]:bg-[var(--od-accent)] data-[pressed]:font-[var(--od-font-weight-semibold)] data-[pressed]:text-[var(--od-accent-foreground)] data-[pressed]:shadow-[inset_0_0_0_var(--od-line-width)_color-mix(in_srgb,var(--od-primary)_25%,transparent)] data-[pressed]:hover:border-[var(--od-primary-hover)] data-[pressed]:hover:bg-[color-mix(in_srgb,var(--od-primary)_8%,var(--od-accent))] data-[pressed]:active:border-[var(--od-primary-active)] data-[pressed]:active:bg-[color-mix(in_srgb,var(--od-primary)_14%,var(--od-accent))] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[0.72] pointer-coarse:min-h-[max(var(--od-control-height-md),var(--od-interactive-target-min))] motion-reduce:transition-none",
  {
    variants: {
      size: {
        sm: "text-[length:var(--od-font-size-sm)] min-h-[var(--od-control-height-sm)] px-[var(--od-button-padding-inline-sm)]",
        md: "",
        lg: "text-[length:var(--od-font-size-lg)] min-h-[var(--od-control-height-lg)] px-[var(--od-button-padding-inline-lg)]",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    defaultVariants: { size: "md", fullWidth: false },
  },
);

export interface ToggleButtonProps<Value extends string = string>
  extends Omit<ButtonProps, "disablePressFeedback" | "loading" | "tone" | "variant" | "className" | "size" | "fullWidth">,
    VariantProps<typeof toggleButtonVariants> {
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean, eventDetails: BaseToggleTypes.ChangeEventDetails) => void;
  pressed?: boolean;
  value?: Value;
  className?: string;
}

function ToggleButtonImplementation<Value extends string = string>(
  { className, fullWidth = false, size = "md", type = "button", ...props }: ToggleButtonProps<Value>,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseToggle
      ref={ref}
      data-od-slot="toggle-button"
      data-size={size}
      data-tone="neutral"
      data-variant="outline"
      data-full-width={fullWidth || undefined}
      className={cn(toggleButtonVariants({ size, fullWidth }), className)}
      type={type}
      {...props}
    />
  );
}

export const ToggleButton = forwardRef(ToggleButtonImplementation) as <Value extends string = string>(
  props: ToggleButtonProps<Value> & { ref?: ForwardedRef<HTMLButtonElement> },
) => ReactElement;
