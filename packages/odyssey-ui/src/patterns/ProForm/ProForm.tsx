import type { DeepKeys, DeepValue } from "@tanstack/react-form";
import { type ComponentPropsWithoutRef, type FormEvent, type ForwardedRef, forwardRef, type ReactElement, type ReactNode, useId, useState } from "react";
import * as z from "zod/v4";
import {
  Button,
  Checkbox,
  CheckboxIndicator,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  Form,
  Input,
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  OtpGroup,
  OtpInput,
  OtpSlot,
  RadioGroup,
  RadioGroupIndicator,
  RadioGroupItem,
  REGEXP_ONLY_DIGITS,
  Stack,
  Switch,
  SwitchThumb,
  Textarea,
} from "../../primitives";
import { useProLocale } from "../locale";
import { type ProOption, ProSelect } from "../ProSelect";
import { defineProSemanticParts, mergeClassNames, mergeStyles, type ProSemanticClassNames, type ProSemanticStyles, semanticPartProps } from "../semantic-parts";
import type { ProFormFieldBase } from "./ProForm.types";
import { type ProFormInstance, useProFieldContext, useProForm, useProFormContext, withProForm } from "./ProFormHook";

export interface ProFormTextField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  inputProps?: Omit<React.ComponentProps<typeof Input>, "ref">;
  placeholder?: string;
  type: "text" | "textarea";
}

export interface ProFormNumberField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  max?: number;
  min?: number;
  placeholder?: string;
  step?: number;
  type: "number";
}

export interface ProFormOtpField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  length?: number;
  mask?: boolean;
  pattern?: string;
  pasteTransformer?: (pasted: string) => string;
  type: "otp";
}

export interface ProFormChoiceField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  options: readonly ProOption<NonNullable<DeepValue<TInput, TName>>>[];
  placeholder?: string;
  type: "select" | "radio";
}

export interface ProFormToggleField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  type: "checkbox" | "switch";
}

export interface ProFormCustomField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>>
  extends ProFormFieldBase<TInput, TName> {
  render: (field: ProFormRenderField<TInput, TName>) => ReactNode;
  type: "custom";
}

export type ProFormFieldDefinition<TInput extends Record<string, unknown>> = {
  [TName in Extract<DeepKeys<TInput>, string>]:
    | ProFormTextField<TInput, TName>
    | ProFormNumberField<TInput, TName>
    | ProFormOtpField<TInput, TName>
    | ProFormChoiceField<TInput, TName>
    | ProFormToggleField<TInput, TName>
    | ProFormCustomField<TInput, TName>;
}[Extract<DeepKeys<TInput>, string>];

export interface ProFormRenderField<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>> {
  blur: () => void;
  errors: readonly unknown[];
  name: TName;
  setValue: (value: DeepValue<TInput, TName>) => void;
  touched: boolean;
  value: DeepValue<TInput, TName>;
}

export const proFormParts = defineProSemanticParts({
  root: "pro-form",
  field: "pro-form-field",
  label: "pro-form-label",
  control: "pro-form-control",
  description: "pro-form-description",
  error: "pro-form-error",
  summary: "pro-form-submit-error",
  actions: "pro-form-actions",
  reset: "pro-form-reset",
  submit: "pro-form-submit",
} as const);
export type ProFormPart = keyof typeof proFormParts;
export type ProFormClassNames = ProSemanticClassNames<ProFormPart>;
export type ProFormStyles = ProSemanticStyles<ProFormPart>;
export interface ProFormSlots<TInput extends Record<string, unknown>> {
  actions?: (actions: ReactNode) => ReactNode;
  control?: (control: ReactNode, field: ProFormFieldDefinition<TInput>) => ReactNode;
  field?: (field: ReactNode, config: ProFormFieldDefinition<TInput>) => ReactNode;
  summary?: (summary: ReactNode) => ReactNode;
}

interface ProFormInternalOptions<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>> {
  actions?: ReactNode;
  disabled?: boolean;
  fields?: readonly ProFormFieldDefinition<z.input<TSchema>>[];
  reset?: false | { label?: ReactNode; onReset?: () => void };
  submit?: false | { label?: ReactNode };
}

export type ProFormOptions<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>> = ProFormInternalOptions<TSchema> &
  (
    | { defaultValues: z.input<TSchema>; form?: never; onSubmit: (value: z.output<TSchema>) => void | Promise<void>; schema: TSchema }
    | { defaultValues?: never; form: ProFormInstance<TSchema>; onSubmit?: never; schema?: never }
  );
export interface ProFormRootProps extends Omit<ComponentPropsWithoutRef<typeof Form>, "children" | "onSubmit"> {}
export type ProFormProps<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>> = ProFormRootProps & {
  options: ProFormOptions<TSchema>;
};

function errorText(errors: readonly unknown[]) {
  return errors
    .flatMap((error) => {
      if (typeof error === "string") return [error];
      if (error && typeof error === "object" && "message" in error) return [String(error.message)];
      return [];
    })
    .join("；");
}

function ProFormImplementation<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>>(
  { options, className, style, ...props }: ProFormProps<TSchema>,
  ref: ForwardedRef<HTMLFormElement>,
) {
  const { actions, defaultValues, disabled = false, fields = [], form: boundForm, onSubmit, reset = {}, schema, submit: submitOptions = {} } = options;
  const children = undefined;
  const classNames: ProFormClassNames = {};
  const slots: ProFormSlots<z.input<TSchema>> = {};
  const styles: ProFormStyles = {};
  const locale = useProLocale();
  const [submitError, setSubmitError] = useState<ReactNode>(null);
  const formId = useId();
  const ownedForm = useProForm({
    defaultValues: (defaultValues ?? {}) as z.input<TSchema>,
    schema: (schema ?? z.object({})) as TSchema,
    onSubmit: onSubmit ?? (() => undefined),
    onSubmitError: (error) => setSubmitError(error instanceof Error ? error.message : locale.form.submitFailed),
  });
  const form = boundForm ? (boundForm as typeof ownedForm) : ownedForm;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    void form.handleSubmit();
  }
  return (
    <Form
      {...props}
      ref={ref}
      className={mergeClassNames(classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
      data-od-slot="pro-form"
      onSubmit={submit}
    >
      <form.AppForm>
        {fields.map((config) => (
          <form.Field key={config.name} name={config.name}>
            {(field) => {
              const value = field.state.value;
              const errors = field.state.meta.errors;
              const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
              const change = <TValue,>(next: TValue) => field.handleChange(next as never);
              const common = {
                "aria-invalid": invalid || undefined,
                disabled: disabled || config.disabled,
                name: field.name,
                onBlur: field.handleBlur,
              };
              const controlId = `${formId}-${String(field.name).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
              let control: ReactNode;
              if (config.type === "textarea") {
                control = (
                  <Textarea {...common} placeholder={config.placeholder} value={String(value ?? "")} onChange={(event) => change(event.currentTarget.value)} />
                );
              } else if (config.type === "number") {
                control = (
                  <NumberField
                    value={typeof value === "number" ? value : null}
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    disabled={common.disabled}
                    onValueChange={(next) => change(next)}
                  >
                    <NumberFieldGroup>
                      <NumberFieldInput name={common.name} onBlur={common.onBlur} placeholder={config.placeholder} aria-invalid={common["aria-invalid"]} />
                      <NumberFieldIncrement />
                      <NumberFieldDecrement />
                    </NumberFieldGroup>
                  </NumberField>
                );
              } else if (config.type === "otp") {
                const length = config.length ?? 6;
                control = (
                  <OtpInput
                    id={controlId}
                    name={common.name}
                    onBlur={common.onBlur}
                    value={String(value ?? "")}
                    onChange={(next) => change(next)}
                    maxLength={length}
                    pattern={config.pattern ?? REGEXP_ONLY_DIGITS}
                    pasteTransformer={config.pasteTransformer}
                    disabled={common.disabled}
                    aria-invalid={common["aria-invalid"]}
                  >
                    <OtpGroup>
                      {Array.from({ length }, (_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: OTP positions are fixed, identity is the slot index.
                        <OtpSlot key={index} index={index} mask={config.mask} />
                      ))}
                    </OtpGroup>
                  </OtpInput>
                );
              } else if (config.type === "text") {
                control = (
                  <Input
                    {...common}
                    {...config.inputProps}
                    placeholder={config.placeholder}
                    value={String(value ?? "")}
                    onChange={(event) => change(event.currentTarget.value)}
                  />
                );
              } else if (config.type === "select") {
                control = (
                  <ProSelect
                    label={String(config.label)}
                    options={config.options}
                    placeholder={config.placeholder}
                    value={value == null ? undefined : value}
                    disabled={common.disabled}
                    onValueChange={(next) => change(next)}
                  />
                );
              } else if (config.type === "radio") {
                control = (
                  <RadioGroup value={String(value ?? "")} onValueChange={(next) => change(next)} disabled={common.disabled}>
                    {config.options.map((option) => (
                      <span key={String(option.value)}>
                        <RadioGroupItem aria-label={String(option.label)} value={option.value} disabled={option.disabled}>
                          <RadioGroupIndicator />
                        </RadioGroupItem>{" "}
                        {option.label}
                      </span>
                    ))}
                  </RadioGroup>
                );
              } else if (config.type === "checkbox") {
                control = (
                  <Checkbox checked={Boolean(value)} onCheckedChange={(next) => change(Boolean(next))} disabled={common.disabled}>
                    <CheckboxIndicator />
                  </Checkbox>
                );
              } else if (config.type === "switch") {
                control = (
                  <Switch checked={Boolean(value)} onCheckedChange={(next) => change(Boolean(next))} disabled={common.disabled}>
                    <SwitchThumb />
                  </Switch>
                );
              } else if (config.type === "custom") {
                control = config.render({
                  blur: field.handleBlur,
                  errors,
                  name: field.name,
                  setValue: change,
                  touched: field.state.meta.isTouched,
                  value,
                });
              } else control = null;
              const fieldContent = (
                <>
                  <FieldLabel
                    htmlFor={config.type === "otp" ? controlId : undefined}
                    {...semanticPartProps("label", classNames, styles)}
                    data-od-slot="pro-form-label"
                  >
                    {config.label}
                  </FieldLabel>
                  <FieldContent {...semanticPartProps("control", classNames, styles)} data-od-slot="pro-form-control">
                    {slots?.control?.(control, config) ?? control}
                    {config.description && (
                      <FieldDescription {...semanticPartProps("description", classNames, styles)} data-od-slot="pro-form-description">
                        {config.description}
                      </FieldDescription>
                    )}
                    {invalid && (
                      <FieldError {...semanticPartProps("error", classNames, styles)} data-od-slot="pro-form-error">
                        {errorText(errors)}
                      </FieldError>
                    )}
                  </FieldContent>
                </>
              );
              return (
                <Field
                  {...semanticPartProps("field", classNames, styles)}
                  data-od-slot="pro-form-field"
                  data-field-name={field.name}
                  invalid={invalid}
                  disabled={common.disabled}
                >
                  {slots?.field?.(fieldContent, config) ?? fieldContent}
                </Field>
              );
            }}
          </form.Field>
        ))}
        {children}
        {submitError && (
          <div role="alert" {...semanticPartProps("summary", classNames, styles)} data-od-slot="pro-form-submit-error">
            {slots?.summary?.(submitError) ?? submitError}
          </div>
        )}
        <Stack {...semanticPartProps("actions", classNames, styles)} data-od-slot="pro-form-actions" direction="row" gap={2} justify="end">
          {slots?.actions?.(actions) ?? actions}
          {reset !== false ? (
            <Button
              {...semanticPartProps("reset", classNames, styles)}
              data-od-slot="pro-form-reset"
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => {
                setSubmitError(null);
                form.reset();
                reset.onReset?.();
              }}
            >
              {reset.label ?? locale.form.reset}
            </Button>
          ) : null}
          {submitOptions !== false ? (
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  {...semanticPartProps("submit", classNames, styles)}
                  data-od-slot="pro-form-submit"
                  type="submit"
                  variant="solid"
                  disabled={disabled || !canSubmit || isSubmitting}
                  loading={isSubmitting}
                >
                  {submitOptions.label ?? locale.form.submit}
                </Button>
              )}
            </form.Subscribe>
          ) : null}
        </Stack>
      </form.AppForm>
    </Form>
  );
}

export const ProForm = forwardRef(ProFormImplementation) as <TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>>(
  props: ProFormProps<TSchema> & { ref?: ForwardedRef<HTMLFormElement> },
) => ReactElement;

export type { ProFormInstance };
export { useProFieldContext, useProForm, useProFormContext, withProForm };
