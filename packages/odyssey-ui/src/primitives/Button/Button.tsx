import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, type ForwardedRef, forwardRef, type HTMLAttributes, useRef } from "react";
import { cn } from "../../lib/cn";
import type { OdysseySize, OdysseyTone } from "../../types";
import { buttonClasses } from "./Button.classes";
import { usePressFeedback } from "./PressFeedback";

const buttonVariants = cva(
  "od-Button-control isolate relative inline-flex min-h-[var(--od-control-height-md)] items-center justify-center gap-[var(--od-control-gap)] border-[length:var(--od-line-width)] border-[var(--od-border)] px-[var(--od-button-padding-inline-md)] font-[inherit] text-[length:var(--od-font-size-md)] leading-[var(--od-line-height-tight)] transition-[background,border-color,color,box-shadow,transform] duration-[var(--od-duration-fast)] [transition-timing-function:var(--od-ease-standard)] [--_od-outline-wave-color:var(--od-primary)] [--_od-radial-ripple-color:currentColor] focus-visible:shadow-[var(--od-button-focus-shadow)] focus-visible:outline-none disabled:cursor-not-allowed pointer-coarse:min-h-[max(var(--od-control-height-md),var(--od-interactive-target-min))]",
  {
    variants: {
      variant: {
        outline:
          "od-Button-outline rounded-[var(--od-button-radius)] [--_od-button-background:var(--od-background)] [--_od-button-ink:var(--od-foreground)] [--_od-button-border:var(--od-border)] bg-[var(--_od-button-background)] text-[var(--_od-button-ink)] shadow-[var(--od-button-shadow)] cursor-pointer font-[var(--od-button-font-weight)] hover:bg-[var(--od-accent)] hover:text-[var(--od-accent-foreground)] focus-visible:border-[var(--od-button-focus-border)] disabled:bg-[color-mix(in_oklch,var(--_od-button-background)_50%,transparent)] disabled:text-[color-mix(in_oklch,var(--_od-button-ink)_50%,transparent)] disabled:border-[color-mix(in_oklch,var(--_od-button-border)_50%,transparent)]",
        solid:
          "od-Button-solid rounded-[var(--od-button-radius)] [--_od-button-background:var(--od-primary)] [--_od-button-ink:var(--od-primary-foreground)] [--_od-button-border:var(--od-primary)] border-[var(--_od-button-border)] bg-[var(--_od-button-background)] text-[var(--_od-button-ink)] shadow-[var(--od-button-shadow)] cursor-pointer font-[var(--od-button-font-weight)] hover:border-[var(--od-primary-hover)] hover:bg-[var(--od-primary-hover)] active:border-[var(--od-primary-active)] active:bg-[var(--od-primary-active)] focus-visible:border-[var(--od-button-solid-focus-border)] disabled:bg-[color-mix(in_oklch,var(--_od-button-background)_50%,transparent)] disabled:text-[color-mix(in_oklch,var(--_od-button-ink)_50%,transparent)] disabled:border-[color-mix(in_oklch,var(--_od-button-border)_50%,transparent)]",
        soft: "od-Button-soft rounded-[var(--od-button-radius)] [--_od-button-background:var(--od-accent)] [--_od-button-ink:var(--od-accent-foreground)] [--_od-button-border:transparent] border-transparent bg-[var(--_od-button-background)] text-[var(--_od-button-ink)] shadow-none cursor-pointer font-[var(--od-button-font-weight)] hover:bg-[color-mix(in_oklch,var(--od-secondary)_80%,transparent)] focus-visible:border-[var(--od-button-ghost-focus-border)] disabled:bg-[color-mix(in_oklch,var(--_od-button-background)_50%,transparent)] disabled:text-[color-mix(in_oklch,var(--_od-button-ink)_50%,transparent)] disabled:border-transparent",
        ghost:
          "od-Button-ghost rounded-[var(--od-button-radius)] [--_od-button-background:transparent] [--_od-button-ink:var(--od-foreground)] [--_od-button-border:transparent] border-transparent bg-[var(--_od-button-background)] text-[var(--_od-button-ink)] shadow-none cursor-pointer font-[var(--od-button-font-weight)] hover:bg-[var(--od-accent)] hover:text-[var(--od-accent-foreground)] focus-visible:border-[var(--od-button-ghost-focus-border)] disabled:bg-transparent disabled:text-[color-mix(in_oklch,var(--_od-button-ink)_50%,transparent)] disabled:border-transparent",
        link: "od-Button-link rounded-none [--_od-button-background:transparent] [--_od-button-ink:var(--od-primary)] [--_od-button-border:transparent] border-transparent bg-[var(--_od-button-background)] px-[var(--od-space-1)] text-[var(--_od-button-ink)] shadow-none cursor-pointer font-[var(--od-button-font-weight)] underline-offset-[0.25em] hover:underline focus-visible:border-[var(--od-button-ghost-focus-border)] disabled:bg-transparent disabled:text-[color-mix(in_oklch,var(--_od-button-ink)_50%,transparent)] disabled:border-transparent",
      },
      size: {
        sm: "od-Button-sm min-h-[var(--od-control-height-sm)] px-[var(--od-button-padding-inline-sm)] text-[length:var(--od-font-size-sm)] [--_od-button-icon-size:0.875rem]",
        md: "od-Button-md",
        lg: "od-Button-lg min-h-[var(--od-control-height-lg)] px-[var(--od-button-padding-inline-lg)] text-[length:var(--od-font-size-lg)] [--_od-button-icon-size:1.125rem]",
      },
      tone: {
        neutral: "",
        accent:
          "od-Button-accent [--_od-button-background:var(--od-accent)] [--_od-button-ink:var(--od-accent-foreground)] [--_od-button-border:var(--od-border)] text-[var(--_od-button-ink)] hover:border-[var(--od-primary-hover)]",
        danger:
          "od-Button-danger [--_od-button-ink:var(--od-destructive)] text-[var(--_od-button-ink)] [--_od-outline-wave-color:var(--od-destructive)] disabled:text-[color-mix(in_oklch,var(--od-destructive)_50%,transparent)]",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [
      {
        variant: "solid",
        tone: "danger",
        className:
          "od-Button-solid-danger [--_od-button-background:var(--od-destructive)] [--_od-button-ink:var(--od-destructive-foreground)] [--_od-button-border:var(--od-destructive)] border-[var(--_od-button-border)] bg-[var(--_od-button-background)] text-[var(--_od-button-ink)] [--_od-radial-ripple-color:var(--od-destructive-foreground)] hover:border-[var(--od-destructive-hover)] hover:bg-[var(--od-destructive-hover)] active:border-[var(--od-destructive-active)] active:bg-[var(--od-destructive-active)] focus-visible:border-[var(--od-button-danger-solid-focus-border)]",
      },
    ],
    defaultVariants: { variant: "outline", size: "md", tone: "neutral", fullWidth: false },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual treatment. @defaultValue "outline" */
  variant?: "solid" | "outline" | "soft" | "ghost" | "link";
  /** Control size. @defaultValue "md" */
  size?: OdysseySize & VariantProps<typeof buttonVariants>["size"];
  /** Semantic color. @defaultValue "neutral" */
  tone?: OdysseyTone & VariantProps<typeof buttonVariants>["tone"];
  /** Shows progress and prevents interaction. @defaultValue false */
  loading?: boolean;
  /** Expands to the available width. @defaultValue false */
  fullWidth?: boolean;
  /** Disables the interaction feedback selected by the active preset. @defaultValue false */
  disablePressFeedback?: boolean;
}

export interface ButtonIconProps extends HTMLAttributes<HTMLSpanElement> {}

export const ButtonIcon = forwardRef<HTMLSpanElement, ButtonIconProps>(function ButtonIcon({ "aria-hidden": ariaHidden = true, className, ...props }, ref) {
  return (
    <span
      ref={ref}
      aria-hidden={ariaHidden}
      data-od-slot="button-icon"
      className={cn("inline-flex flex-[0_0_auto] items-center justify-center [&>svg]:size-[var(--_od-button-icon-size)] [&>svg]:shrink-0", className)}
      {...props}
    />
  );
});

function setForwardedRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    disablePressFeedback = false,
    fullWidth = false,
    loading = false,
    size = "md",
    tone = "neutral",
    variant = "outline",
    ...props
  },
  ref,
) {
  const targetRef = useRef<HTMLButtonElement>(null);
  const outlineLayerRef = useRef<HTMLSpanElement>(null);
  const rippleLayerRef = useRef<HTMLSpanElement>(null);
  const interactionDisabled = Boolean(disabled || loading || disablePressFeedback || variant === "link");
  usePressFeedback({ disabled: interactionDisabled, outlineLayerRef, rippleLayerRef, targetRef });

  return (
    <button
      ref={(node) => {
        targetRef.current = node;
        setForwardedRef(ref, node);
      }}
      data-od-slot="button"
      data-size={size}
      data-tone={tone}
      data-variant={variant}
      className={cn(buttonVariants({ size, tone, variant, fullWidth }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className={buttonClasses.spinner} aria-hidden="true" />}
      {children}
      <span ref={outlineLayerRef} data-od-slot="button-outline-feedback" className={buttonClasses.feedbackLayer} aria-hidden="true" />
      <span
        ref={rippleLayerRef}
        data-od-slot="button-radial-feedback"
        className={cn(buttonClasses.feedbackLayer, buttonClasses.rippleLayer)}
        aria-hidden="true"
      />
    </button>
  );
});
