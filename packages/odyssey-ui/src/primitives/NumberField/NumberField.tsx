import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef } from "react";
import { cn } from "../../lib/cn";

const styles = {
  root: "od-NumberField-root",
  group: "od-NumberField-group",
  input: "od-NumberField-input",
  increment: "od-NumberField-increment",
  decrement: "od-NumberField-decrement",
  scrubArea: "od-NumberField-scrubArea",
  scrubAreaCursor: "od-NumberField-scrubAreaCursor",
} as const;

export type NumberFieldProps = ComponentPropsWithoutRef<typeof BaseNumberField.Root>;
export const NumberField = forwardRef<ComponentRef<typeof BaseNumberField.Root>, NumberFieldProps>(function NumberField({ className, ...props }, ref) {
  return <BaseNumberField.Root ref={ref} data-od-slot="number-field" className={cn(styles.root, className)} {...props} />;
});
export type NumberFieldGroupProps = ComponentPropsWithoutRef<typeof BaseNumberField.Group>;
export const NumberFieldGroup = forwardRef<ComponentRef<typeof BaseNumberField.Group>, NumberFieldGroupProps>(function NumberFieldGroup(
  { className, ...props },
  ref,
) {
  return <BaseNumberField.Group ref={ref} data-od-slot="number-field-group" className={cn(styles.group, className)} {...props} />;
});
export type NumberFieldInputProps = ComponentPropsWithoutRef<typeof BaseNumberField.Input>;
export const NumberFieldInput = forwardRef<ComponentRef<typeof BaseNumberField.Input>, NumberFieldInputProps>(function NumberFieldInput(
  { className, ...props },
  ref,
) {
  return <BaseNumberField.Input ref={ref} data-od-slot="number-field-input" inputMode="decimal" className={cn(styles.input, className)} {...props} />;
});
export type NumberFieldIncrementProps = ComponentPropsWithoutRef<typeof BaseNumberField.Increment>;
export const NumberFieldIncrement = forwardRef<ComponentRef<typeof BaseNumberField.Increment>, NumberFieldIncrementProps>(function NumberFieldIncrement(
  { className, children = "+", ...props },
  ref,
) {
  return (
    <BaseNumberField.Increment ref={ref} data-od-slot="number-field-increment" className={cn(styles.increment, className)} {...props}>
      {children}
    </BaseNumberField.Increment>
  );
});
export type NumberFieldDecrementProps = ComponentPropsWithoutRef<typeof BaseNumberField.Decrement>;
export const NumberFieldDecrement = forwardRef<ComponentRef<typeof BaseNumberField.Decrement>, NumberFieldDecrementProps>(function NumberFieldDecrement(
  { className, children = "−", ...props },
  ref,
) {
  return (
    <BaseNumberField.Decrement ref={ref} data-od-slot="number-field-decrement" className={cn(styles.decrement, className)} {...props}>
      {children}
    </BaseNumberField.Decrement>
  );
});
export type NumberFieldScrubAreaProps = ComponentPropsWithoutRef<typeof BaseNumberField.ScrubArea>;
export const NumberFieldScrubArea = forwardRef<ComponentRef<typeof BaseNumberField.ScrubArea>, NumberFieldScrubAreaProps>(function NumberFieldScrubArea(
  { className, ...props },
  ref,
) {
  return <BaseNumberField.ScrubArea ref={ref} data-od-slot="number-field-scrub-area" className={cn(styles.scrubArea, className)} {...props} />;
});
export type NumberFieldScrubAreaCursorProps = ComponentPropsWithoutRef<typeof BaseNumberField.ScrubAreaCursor>;
export const NumberFieldScrubAreaCursor = forwardRef<ComponentRef<typeof BaseNumberField.ScrubAreaCursor>, NumberFieldScrubAreaCursorProps>(
  function NumberFieldScrubAreaCursor({ className, ...props }, ref) {
    return (
      <BaseNumberField.ScrubAreaCursor ref={ref} data-od-slot="number-field-scrub-area-cursor" className={cn(styles.scrubAreaCursor, className)} {...props} />
    );
  },
);
