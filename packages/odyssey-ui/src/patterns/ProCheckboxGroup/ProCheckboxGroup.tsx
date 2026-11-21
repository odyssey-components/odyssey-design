import { Checkbox, CheckboxGroup, type CheckboxGroupProps, CheckboxIndicator } from "@odyssey/ui/primitives/checkbox";
import { type CSSProperties, forwardRef, type ReactNode } from "react";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStatefulClassNames,
  mergeStatefulStyles,
  mergeStyles,
  type ProSemanticClassNames,
  type ProSemanticStyles,
} from "../semantic-parts";

export const proCheckboxGroupParts = defineProSemanticParts({
  root: "pro-checkbox-group",
  option: "pro-checkbox-option",
  control: "checkbox",
  indicator: "checkbox-indicator",
} as const);
export type ProCheckboxGroupPart = keyof typeof proCheckboxGroupParts;
export type ProCheckboxGroupClassNames = ProSemanticClassNames<ProCheckboxGroupPart>;
export type ProCheckboxGroupStyles = ProSemanticStyles<ProCheckboxGroupPart>;

export interface ProCheckboxOption {
  className?: string;
  disabled?: boolean;
  id?: string;
  label: ReactNode;
  readOnly?: boolean;
  required?: boolean;
  style?: CSSProperties;
  value: string;
}

export interface ProCheckboxGroupProps extends Omit<CheckboxGroupProps, "children"> {
  classNames?: ProCheckboxGroupClassNames;
  options: readonly ProCheckboxOption[];
  renderOption?: (option: ProCheckboxOption) => ReactNode;
  styles?: ProCheckboxGroupStyles;
}

export const ProCheckboxGroup = forwardRef<HTMLDivElement, ProCheckboxGroupProps>(function ProCheckboxGroup(
  { className, classNames, options, renderOption, style, styles, ...props },
  ref,
) {
  return (
    <CheckboxGroup
      ref={ref}
      data-od-slot="pro-checkbox-group"
      className={mergeStatefulClassNames(classNames?.root, className)}
      style={mergeStatefulStyles(styles?.root, style)}
      {...props}
    >
      {options.map((option) => (
        // Base UI supplies the hidden native input inside Checkbox.
        // biome-ignore lint/a11y/noLabelWithoutControl: the control is supplied by Checkbox.
        <label
          key={option.id ?? option.value}
          data-od-slot="pro-checkbox-option"
          className={mergeClassNames(classNames?.option, option.className)}
          style={mergeStyles(styles?.option, option.style)}
        >
          <Checkbox
            id={option.id}
            value={option.value}
            disabled={option.disabled}
            readOnly={option.readOnly}
            required={option.required}
            className={classNames?.control}
            style={styles?.control}
          >
            <CheckboxIndicator className={classNames?.indicator} style={styles?.indicator} />
          </Checkbox>{" "}
          {renderOption?.(option) ?? option.label}
        </label>
      ))}
    </CheckboxGroup>
  );
});
