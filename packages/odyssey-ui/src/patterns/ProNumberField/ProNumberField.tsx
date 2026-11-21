import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  type NumberFieldInputProps,
  type NumberFieldProps,
} from "../../primitives";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStyles,
  type ProSemanticClassNamesFor,
  type ProSemanticPart,
  type ProSemanticStylesFor,
  semanticPartProps,
} from "../semantic-parts";

export const proNumberFieldParts = defineProSemanticParts({
  root: "pro-number-field",
  label: "pro-number-field-label",
  control: "pro-number-field-control",
  group: "pro-number-field-group",
  input: "pro-number-field-input",
  increment: "pro-number-field-increment",
  decrement: "pro-number-field-decrement",
  description: "pro-number-field-description",
  error: "pro-number-field-error",
} as const);
export type ProNumberFieldPart = ProSemanticPart<typeof proNumberFieldParts>;
export type ProNumberFieldClassNames = ProSemanticClassNamesFor<typeof proNumberFieldParts>;
export type ProNumberFieldStyles = ProSemanticStylesFor<typeof proNumberFieldParts>;
export interface ProNumberFieldSlots {
  decrement?: ReactNode;
  increment?: ReactNode;
}
export type ProNumberFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> &
  Pick<
    NumberFieldProps,
    | "allowOutOfRange"
    | "allowWheelScrub"
    | "defaultValue"
    | "disabled"
    | "format"
    | "locale"
    | "max"
    | "min"
    | "name"
    | "onValueChange"
    | "readOnly"
    | "required"
    | "smallStep"
    | "largeStep"
    | "snapOnStep"
    | "step"
    | "value"
  > & {
    classNames?: ProNumberFieldClassNames;
    controlProps?: NumberFieldInputProps;
    description?: ReactNode;
    error?: ReactNode;
    label: ReactNode;
    slots?: ProNumberFieldSlots;
    styles?: ProNumberFieldStyles;
  };

export const ProNumberField = forwardRef<HTMLDivElement, ProNumberFieldProps>(function ProNumberField(
  {
    allowOutOfRange,
    allowWheelScrub,
    className,
    classNames,
    controlProps,
    defaultValue,
    description,
    disabled,
    error,
    format,
    label,
    largeStep,
    locale,
    max,
    min,
    name,
    onValueChange,
    readOnly,
    required,
    slots,
    smallStep,
    snapOnStep,
    step,
    style,
    styles,
    value,
    ...props
  },
  ref,
) {
  return (
    <Field
      {...props}
      ref={ref}
      invalid={Boolean(error)}
      disabled={disabled}
      className={mergeClassNames(classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
      data-od-slot={proNumberFieldParts.root}
    >
      <FieldLabel {...semanticPartProps("label", classNames, styles)} data-od-slot={proNumberFieldParts.label}>
        {label}
      </FieldLabel>
      <FieldContent {...semanticPartProps("control", classNames, styles)} data-od-slot={proNumberFieldParts.control}>
        <NumberField
          allowOutOfRange={allowOutOfRange}
          allowWheelScrub={allowWheelScrub}
          defaultValue={defaultValue}
          disabled={disabled}
          format={format}
          largeStep={largeStep}
          locale={locale}
          max={max}
          min={min}
          name={name}
          onValueChange={onValueChange}
          readOnly={readOnly}
          required={required}
          smallStep={smallStep}
          snapOnStep={snapOnStep}
          step={step}
          value={value}
        >
          <NumberFieldGroup {...semanticPartProps("group", classNames, styles)} data-od-slot={proNumberFieldParts.group}>
            <NumberFieldInput
              {...controlProps}
              className={mergeClassNames(classNames?.input, typeof controlProps?.className === "string" ? controlProps.className : undefined)}
              style={mergeStyles(styles?.input, typeof controlProps?.style === "object" ? controlProps.style : undefined)}
              aria-invalid={error ? true : controlProps?.["aria-invalid"]}
              data-od-slot={proNumberFieldParts.input}
            />
            <NumberFieldIncrement {...semanticPartProps("increment", classNames, styles)} data-od-slot={proNumberFieldParts.increment}>
              {slots?.increment ?? "+"}
            </NumberFieldIncrement>
            <NumberFieldDecrement {...semanticPartProps("decrement", classNames, styles)} data-od-slot={proNumberFieldParts.decrement}>
              {slots?.decrement ?? "−"}
            </NumberFieldDecrement>
          </NumberFieldGroup>
        </NumberField>
        {description ? (
          <FieldDescription {...semanticPartProps("description", classNames, styles)} data-od-slot={proNumberFieldParts.description}>
            {description}
          </FieldDescription>
        ) : null}
        {error ? (
          <FieldError {...semanticPartProps("error", classNames, styles)} data-od-slot={proNumberFieldParts.error}>
            {error}
          </FieldError>
        ) : null}
      </FieldContent>
    </Field>
  );
});
