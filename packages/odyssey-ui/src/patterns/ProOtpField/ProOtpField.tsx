import { forwardRef, type HTMLAttributes, type ReactNode, useId } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  OtpGroup,
  OtpInput,
  type OtpInputProps,
  OtpSeparator,
  OtpSlot,
  REGEXP_ONLY_DIGITS,
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

export const proOtpFieldParts = defineProSemanticParts({
  root: "pro-otp-field",
  label: "pro-otp-field-label",
  control: "pro-otp-field-control",
  group: "pro-otp-field-group",
  slot: "pro-otp-field-slot",
  separator: "pro-otp-field-separator",
  description: "pro-otp-field-description",
  error: "pro-otp-field-error",
} as const);
export type ProOtpFieldPart = ProSemanticPart<typeof proOtpFieldParts>;
export type ProOtpFieldClassNames = ProSemanticClassNamesFor<typeof proOtpFieldParts>;
export type ProOtpFieldStyles = ProSemanticStylesFor<typeof proOtpFieldParts>;
export interface ProOtpFieldSlots {
  separator?: (index: number) => ReactNode;
}
export type ProOtpFieldProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  classNames?: ProOtpFieldClassNames;
  description?: ReactNode;
  error?: ReactNode;
  label: ReactNode;
  length?: number;
  mask?: boolean;
  maxLength?: number;
  controlProps?: Omit<OtpInputProps, "children" | "maxLength" | "onChange" | "render" | "value">;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onChange?: (value: string) => unknown;
  pasteTransformer?: (pasted: string) => string;
  pattern?: string;
  slots?: ProOtpFieldSlots;
  styles?: ProOtpFieldStyles;
  value?: string;
};

export const ProOtpField = forwardRef<HTMLDivElement, ProOtpFieldProps>(function ProOtpField(
  {
    className,
    classNames,
    controlProps,
    defaultValue,
    description,
    disabled,
    error,
    label,
    length,
    mask = false,
    maxLength,
    name,
    onChange,
    pasteTransformer,
    pattern = REGEXP_ONLY_DIGITS,
    slots,
    style,
    styles,
    value,
    ...props
  },
  ref,
) {
  const count = length ?? maxLength ?? 6;
  const generatedId = useId();
  const inputId = controlProps?.id ?? generatedId;
  return (
    <Field
      {...props}
      ref={ref}
      invalid={Boolean(error)}
      className={mergeClassNames(classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
      data-od-slot={proOtpFieldParts.root}
    >
      <FieldLabel htmlFor={inputId} {...semanticPartProps("label", classNames, styles)} data-od-slot={proOtpFieldParts.label}>
        {label}
      </FieldLabel>
      <FieldContent {...semanticPartProps("control", classNames, styles)} data-od-slot={proOtpFieldParts.control}>
        <OtpInput
          {...controlProps}
          id={inputId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
          maxLength={count}
          pattern={pattern}
          pasteTransformer={pasteTransformer}
          aria-invalid={error ? true : controlProps?.["aria-invalid"]}
        >
          <OtpGroup {...semanticPartProps("group", classNames, styles)} data-od-slot={proOtpFieldParts.group}>
            {Array.from({ length: count }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: OTP positions are fixed, identity is the slot index.
              <span key={index} style={{ display: "contents" }}>
                {index > 0 && slots?.separator ? (
                  <OtpSeparator {...semanticPartProps("separator", classNames, styles)} data-od-slot={proOtpFieldParts.separator}>
                    {slots.separator(index)}
                  </OtpSeparator>
                ) : null}
                <OtpSlot index={index} mask={mask} {...semanticPartProps("slot", classNames, styles)} data-od-slot={proOtpFieldParts.slot} />
              </span>
            ))}
          </OtpGroup>
        </OtpInput>
        {description ? (
          <FieldDescription {...semanticPartProps("description", classNames, styles)} data-od-slot={proOtpFieldParts.description}>
            {description}
          </FieldDescription>
        ) : null}
        {error ? (
          <FieldError {...semanticPartProps("error", classNames, styles)} data-od-slot={proOtpFieldParts.error}>
            {error}
          </FieldError>
        ) : null}
      </FieldContent>
    </Field>
  );
});
