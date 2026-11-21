import { Radio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { type ComponentPropsWithoutRef, type ComponentRef, type ForwardedRef, forwardRef, type ReactElement, useRef } from "react";
import { useOutlineWave } from "../../internal/useOutlineWave";
import { WritingDirectionOverride } from "../../internal/writing-direction";
import { cn } from "../../lib/cn";

const styles = {
  group: "od-RadioGroup-group",
  control: "od-RadioGroup-control",
  button: "od-RadioGroup-button",
  buttonLabel: "od-RadioGroup-buttonLabel",
  indicator: "od-RadioGroup-indicator",
  outlineFeedbackLayer: "od-RadioGroup-outlineFeedbackLayer",
  outlineWave: "od-RadioGroup-outlineWave",
} as const;

export interface RadioGroupProps<Value = unknown>
  extends Omit<ComponentPropsWithoutRef<typeof BaseRadioGroup<Value>>, "value" | "defaultValue" | "onValueChange"> {
  block?: boolean;
  buttonStyle?: "outline" | "solid";
  defaultValue?: Value;
  onValueChange?: ComponentPropsWithoutRef<typeof BaseRadioGroup<Value>>["onValueChange"];
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  value?: Value;
}
function RadioGroupImplementation<Value = unknown>(
  { block = false, buttonStyle = "outline", className, dir, orientation = "vertical", size = "md", ...props }: RadioGroupProps<Value>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <WritingDirectionOverride dir={dir}>
      <BaseRadioGroup
        ref={ref}
        data-od-slot="radio-group"
        data-block={block || undefined}
        data-button-style={buttonStyle}
        data-orientation={orientation}
        data-size={size}
        dir={dir}
        className={cn(styles.group, className)}
        {...(props as ComponentPropsWithoutRef<typeof BaseRadioGroup>)}
      />
    </WritingDirectionOverride>
  );
}
export const RadioGroup = forwardRef(RadioGroupImplementation) as <Value = unknown>(
  props: RadioGroupProps<Value> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;

export interface RadioGroupItemProps<Value = unknown> extends Omit<ComponentPropsWithoutRef<typeof Radio.Root<Value>>, "value"> {
  disablePressFeedback?: boolean;
  value: Value;
}
function setRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
export const RadioGroupItem = forwardRef<ComponentRef<typeof Radio.Root>, RadioGroupItemProps>(function RadioGroupItem(
  { children, className, disabled = false, disablePressFeedback = false, ...props },
  ref,
) {
  const targetRef = useRef<ComponentRef<typeof Radio.Root>>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  useOutlineWave({
    className: styles.outlineWave,
    disabled: disabled || disablePressFeedback,
    effectSlot: "radio-group-item-feedback-effect",
    layerRef,
    requireChecked: true,
    targetRef,
  });
  return (
    <Radio.Root
      ref={(node) => {
        targetRef.current = node;
        setRef(ref, node);
      }}
      data-od-slot="radio-group-item"
      className={cn(styles.control, className)}
      disabled={disabled}
      {...props}
    >
      {children}
      <span ref={layerRef} data-od-slot="radio-group-item-outline-feedback" className={styles.outlineFeedbackLayer} aria-hidden="true" />
    </Radio.Root>
  );
});
export type RadioGroupIndicatorProps = ComponentPropsWithoutRef<typeof Radio.Indicator>;
export function RadioGroupIndicator({ className, ...props }: RadioGroupIndicatorProps) {
  return (
    <Radio.Indicator aria-hidden="true" data-od-slot="radio-group-indicator" className={cn(styles.indicator, className)} {...props}>
      <span />
    </Radio.Indicator>
  );
}

export interface RadioButtonProps<Value = unknown> extends Omit<ComponentPropsWithoutRef<typeof Radio.Root<Value>>, "value"> {
  disablePressFeedback?: boolean;
  value: Value;
}
export const RadioButton = forwardRef<ComponentRef<typeof Radio.Root>, RadioButtonProps>(function RadioButton(
  { children, className, disabled = false, disablePressFeedback = false, ...props },
  ref,
) {
  const targetRef = useRef<ComponentRef<typeof Radio.Root>>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  useOutlineWave({
    className: styles.outlineWave,
    disabled: disabled || disablePressFeedback,
    effectSlot: "radio-button-feedback-effect",
    layerRef,
    requireChecked: true,
    targetRef,
  });
  return (
    <Radio.Root
      ref={(node) => {
        targetRef.current = node;
        setRef(ref, node);
      }}
      data-od-slot="radio-button"
      className={cn(styles.button, className)}
      disabled={disabled}
      {...props}
    >
      <span data-od-slot="radio-button-label" className={styles.buttonLabel}>
        {children}
      </span>
      <span ref={layerRef} data-od-slot="radio-button-outline-feedback" className={styles.outlineFeedbackLayer} aria-hidden="true" />
    </Radio.Root>
  );
});
