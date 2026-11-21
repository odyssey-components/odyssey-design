import { Field as BaseField } from "@base-ui/react/field";
import { cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, forwardRef, type Ref, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const textareaStyles = cva(
  "box-border min-h-[var(--od-control-height-md)] w-full rounded-[var(--od-input-radius)] border-[length:var(--od-line-width)] border-[var(--od-input)] bg-[var(--od-background)] px-[var(--od-control-padding-sm)] py-[var(--od-control-gap)] font-[inherit] text-[length:var(--od-font-size-md)] leading-[var(--od-line-height-normal)] text-[var(--od-foreground)] transition-[border-color,box-shadow,background] duration-[var(--od-duration-fast)] ease-[var(--od-ease-standard)] enabled:hover:border-[var(--od-primary-hover)] focus-visible:border-[var(--od-input-focus-border)] focus-visible:shadow-[var(--od-input-active-shadow)] focus-visible:outline-none disabled:bg-[var(--od-disabled)] disabled:text-[var(--od-disabled-foreground)] disabled:cursor-not-allowed disabled:opacity-[0.72] placeholder:text-[var(--od-muted-foreground)] aria-[invalid=true]:border-[var(--od-destructive)] aria-[invalid=true]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--od-destructive)_18%,transparent)] pointer-coarse:min-h-[max(var(--od-control-height-md),var(--od-interactive-target-min))]",
);

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  const controlProps = { rows: 4, ...props } as unknown as ComponentPropsWithoutRef<typeof BaseField.Control>;
  return (
    <BaseField.Control
      ref={ref as Ref<HTMLElement>}
      render={<textarea />}
      data-od-slot="textarea"
      className={cn(textareaStyles(), className)}
      {...controlProps}
    />
  );
});
