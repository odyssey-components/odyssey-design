import { RadioButton, RadioGroup, RadioGroupIndicator, RadioGroupItem, type RadioGroupProps } from "@odyssey/ui/primitives/radio-group";
import { type CSSProperties, type ForwardedRef, forwardRef, type ReactElement, type ReactNode } from "react";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStatefulClassNames,
  mergeStatefulStyles,
  mergeStyles,
  type ProSemanticClassNames,
  type ProSemanticStyles,
} from "../semantic-parts";

export const proRadioGroupParts = defineProSemanticParts({
  root: "pro-radio-group",
  option: "pro-radio-option",
  control: "radio-group-item",
  indicator: "radio-group-indicator",
  button: "radio-button",
} as const);
export type ProRadioGroupPart = keyof typeof proRadioGroupParts;
export type ProRadioGroupClassNames = ProSemanticClassNames<ProRadioGroupPart>;
export type ProRadioGroupStyles = ProSemanticStyles<ProRadioGroupPart>;

export interface ProRadioOption<Value> {
  className?: string;
  disabled?: boolean;
  id?: string;
  label: ReactNode;
  readOnly?: boolean;
  required?: boolean;
  style?: CSSProperties;
  value: Value;
}

export interface ProRadioGroupProps<Value = unknown> extends Omit<RadioGroupProps<Value>, "children"> {
  classNames?: ProRadioGroupClassNames;
  options: readonly ProRadioOption<Value>[];
  optionType?: "radio" | "button";
  renderOption?: (option: ProRadioOption<Value>) => ReactNode;
  styles?: ProRadioGroupStyles;
}

function ProRadioGroupImplementation<Value = unknown>(
  { className, classNames, options, optionType = "radio", renderOption, style, styles, ...props }: ProRadioGroupProps<Value>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <RadioGroup<Value>
      ref={ref}
      data-od-slot="pro-radio-group"
      className={mergeStatefulClassNames(classNames?.root, className)}
      style={mergeStatefulStyles(styles?.root, style)}
      {...props}
    >
      {options.map((option, index) => {
        const content = renderOption?.(option) ?? option.label;
        if (optionType === "button") {
          return (
            <RadioButton
              key={option.id ?? index}
              value={option.value}
              id={option.id}
              className={mergeStatefulClassNames(classNames?.button, option.className)}
              style={mergeStatefulStyles(styles?.button, option.style)}
              disabled={option.disabled}
              readOnly={option.readOnly}
              required={option.required}
            >
              {content}
            </RadioButton>
          );
        }
        return (
          // The Base UI radio renders its hidden native input inside this label at runtime.
          // biome-ignore lint/a11y/noLabelWithoutControl: the control is supplied by RadioGroupItem.
          <label
            key={option.id ?? index}
            data-od-slot="pro-radio-option"
            className={mergeClassNames(classNames?.option, option.className)}
            style={mergeStyles(styles?.option, option.style)}
          >
            <RadioGroupItem
              value={option.value}
              id={option.id}
              className={classNames?.control}
              style={styles?.control}
              disabled={option.disabled}
              readOnly={option.readOnly}
              required={option.required}
            >
              <RadioGroupIndicator className={classNames?.indicator} style={styles?.indicator} />
            </RadioGroupItem>{" "}
            {content}
          </label>
        );
      })}
    </RadioGroup>
  );
}

export const ProRadioGroup = forwardRef(ProRadioGroupImplementation) as <Value = unknown>(
  props: ProRadioGroupProps<Value> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
