import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../Button/Button";

const iconButtonVariants = cva(
  "od-IconButton-iconButton h-[var(--_od-icon-button-size)] w-[var(--_od-icon-button-size)] flex-[0_0_auto] p-0 [&>svg]:shrink-0 pointer-coarse:size-[max(var(--_od-icon-button-size),var(--od-interactive-target-min))]",
  {
    variants: {
      size: {
        sm: "[--_od-icon-button-size:var(--od-control-height-sm)]",
        md: "[--_od-icon-button-size:var(--od-control-height-md)]",
        lg: "[--_od-icon-button-size:var(--od-control-height-lg)]",
      },
      shape: {
        rounded: "rounded-[var(--od-icon-button-radius)]",
        circular: "rounded-full",
      },
    },
    defaultVariants: { size: "md", shape: "rounded" },
  },
);

export interface IconButtonProps extends Omit<ButtonProps, "children" | "size">, VariantProps<typeof iconButtonVariants> {
  /** Accessible label describing the icon action. */
  "aria-label": string;
  children: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ className, shape = "rounded", size = "md", ...props }, ref) {
  const controlSize = size ?? "md";
  return (
    <Button
      ref={ref}
      data-od-slot="icon-button"
      data-shape={shape}
      size={controlSize}
      className={cn(iconButtonVariants({ size: controlSize, shape }), className)}
      {...props}
    />
  );
});
