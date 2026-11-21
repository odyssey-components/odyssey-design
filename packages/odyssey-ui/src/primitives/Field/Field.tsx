import { Field as BaseField } from "@base-ui/react/field";
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  set: "od-Field-set",
  group: "od-Field-group",
  legend: "od-Field-legend",
  field: "od-Field-field",
  label: "od-Field-label",
  control: "od-Field-control",
  content: "od-Field-content",
  title: "od-Field-title",
  description: "od-Field-description",
  error: "od-Field-error",
  separator: "od-Field-separator",
} as const;

export const FieldSet = forwardRef<HTMLFieldSetElement, React.FieldsetHTMLAttributes<HTMLFieldSetElement>>(function FieldSet({ className, ...props }, ref) {
  return <fieldset ref={ref} data-od-slot="field-set" className={cn(styles.set, className)} {...props} />;
});

export interface FieldLegendProps extends React.HTMLAttributes<HTMLLegendElement> {
  variant?: "legend" | "label";
}
export const FieldLegend = forwardRef<HTMLLegendElement, FieldLegendProps>(function FieldLegend({ className, variant = "legend", ...props }, ref) {
  return <legend ref={ref} data-od-slot="field-legend" data-variant={variant} className={cn(styles.legend, className)} {...props} />;
});

export const FieldGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FieldGroup({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="field-group" className={cn(styles.group, className)} {...props} />;
});

export interface FieldProps extends ComponentPropsWithoutRef<typeof BaseField.Root> {
  orientation?: "vertical" | "horizontal" | "responsive";
}
export const Field = forwardRef<ComponentRef<typeof BaseField.Root>, FieldProps>(function Field({ className, orientation = "vertical", ...props }, ref) {
  return <BaseField.Root ref={ref} data-od-slot="field" data-orientation={orientation} className={cn(styles.field, className)} {...props} />;
});

export type FieldLabelProps = ComponentPropsWithoutRef<typeof BaseField.Label>;
export const FieldLabel = forwardRef<ComponentRef<typeof BaseField.Label>, FieldLabelProps>(function FieldLabel({ className, ...props }, ref) {
  return <BaseField.Label ref={ref} data-od-slot="field-label" className={cn(styles.label, className)} {...props} />;
});

export type FieldControlProps = ComponentPropsWithoutRef<typeof BaseField.Control>;
export const FieldControl = forwardRef<ComponentRef<typeof BaseField.Control>, FieldControlProps>(function FieldControl({ className, ...props }, ref) {
  return <BaseField.Control ref={ref} data-od-slot="field-control" className={cn(styles.control, className)} {...props} />;
});

export const FieldContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FieldContent({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="field-content" className={cn(styles.content, className)} {...props} />;
});

export const FieldTitle = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FieldTitle({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="field-title" className={cn(styles.title, className)} {...props} />;
});

export type FieldDescriptionProps = ComponentPropsWithoutRef<typeof BaseField.Description>;
export const FieldDescription = forwardRef<ComponentRef<typeof BaseField.Description>, FieldDescriptionProps>(function FieldDescription(
  { className, ...props },
  ref,
) {
  return <BaseField.Description ref={ref} data-od-slot="field-description" className={cn(styles.description, className)} {...props} />;
});

export type FieldErrorProps = ComponentPropsWithoutRef<typeof BaseField.Error>;
export const FieldError = forwardRef<ComponentRef<typeof BaseField.Error>, FieldErrorProps>(function FieldError(
  { className, match = true, role = "alert", ...props },
  ref,
) {
  return <BaseField.Error ref={ref} role={role} data-od-slot="field-error" className={cn(styles.error, className)} match={match} {...props} />;
});

export type FieldValidityProps = ComponentPropsWithoutRef<typeof BaseField.Validity>;
export function FieldValidity(props: FieldValidityProps) {
  return <BaseField.Validity {...props} />;
}

export const FieldSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function FieldSeparator({ className, ...props }, ref) {
  // biome-ignore lint/a11y/useSemanticElements: Keep the public div/ref contract stable.
  return <div ref={ref} role="separator" data-od-slot="field-separator" className={cn(styles.separator, className)} {...props} />;
});
