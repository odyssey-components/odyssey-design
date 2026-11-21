import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { type ComponentPropsWithoutRef, type ComponentRef, createContext, type ForwardedRef, forwardRef, useContext, useRef } from "react";
import { useOutlineWave } from "../../internal/useOutlineWave";
import { cn } from "../../lib/cn";

const styles = {
  group:
    "od-Checkbox-group flex min-w-0 flex-col items-start gap-[var(--od-space-2)] data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:flex-wrap data-[orientation=horizontal]:items-center data-[disabled]:cursor-not-allowed",
  control:
    "od-Checkbox-control relative inline-grid aspect-square size-[var(--od-selection-control-size)] flex-none appearance-none place-items-center rounded-[var(--od-checkbox-radius)] border-[length:var(--od-line-width)] border-[var(--od-input)] bg-[var(--od-background)] p-0 align-[-0.1875em] transition-[background,border-color,box-shadow] duration-[var(--od-duration-fast)] [transition-timing-function:var(--od-ease-standard)] hover:not-data-[disabled]:border-[var(--od-primary-hover)] focus-visible:border-[var(--od-checkbox-focus-border)] focus-visible:shadow-[var(--od-checkbox-focus-shadow)] focus-visible:outline-none aria-[invalid=true]:border-[var(--od-destructive)] aria-[invalid=true]:shadow-[0_0_0_3px_color-mix(in_oklch,var(--od-destructive)_18%,transparent)] data-[readonly]:cursor-default data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[checked]:border-[var(--od-primary)] data-[checked]:bg-[var(--od-primary)] data-[checked]:text-[var(--od-primary-foreground)] pointer-coarse:before:absolute pointer-coarse:before:left-1/2 pointer-coarse:before:top-1/2 pointer-coarse:before:size-[max(100%,var(--od-interactive-target-min))] pointer-coarse:before:-translate-x-1/2 pointer-coarse:before:-translate-y-1/2 pointer-coarse:before:content-['']",
  indicator: "od-Checkbox-indicator pointer-events-none absolute inset-0 grid place-items-center text-[0.8rem] leading-none",
  outlineFeedbackLayer: "od-Checkbox-outlineFeedbackLayer pointer-events-none absolute inset-0 overflow-visible rounded-[inherit]",
  outlineWave: "od-Checkbox-outlineWave",
} as const;

export interface CheckboxGroupProps extends ComponentPropsWithoutRef<typeof BaseCheckboxGroup> {
  name?: string;
  orientation?: "horizontal" | "vertical";
}
const CheckboxGroupNameContext = createContext<string | undefined>(undefined);
export const CheckboxGroup = forwardRef<ComponentRef<typeof BaseCheckboxGroup>, CheckboxGroupProps>(function CheckboxGroup(
  { children, className, disabled = false, name, orientation = "vertical", ...props },
  ref,
) {
  return (
    <CheckboxGroupNameContext.Provider value={name}>
      <BaseCheckboxGroup
        ref={ref}
        data-od-slot="checkbox-group"
        data-orientation={orientation}
        className={cn(styles.group, className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </BaseCheckboxGroup>
    </CheckboxGroupNameContext.Provider>
  );
});

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof BaseCheckbox.Root> {
  disablePressFeedback?: boolean;
}
function setRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
export const Checkbox = forwardRef<ComponentRef<typeof BaseCheckbox.Root>, CheckboxProps>(function Checkbox(
  { children, className, disabled = false, disablePressFeedback = false, name, readOnly = false, ...props },
  ref,
) {
  const groupName = useContext(CheckboxGroupNameContext);
  const targetRef = useRef<ComponentRef<typeof BaseCheckbox.Root>>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  useOutlineWave({
    className: styles.outlineWave,
    disabled: disabled || disablePressFeedback,
    effectSlot: "checkbox-feedback-effect",
    layerRef,
    requireChecked: true,
    targetRef,
  });
  return (
    <BaseCheckbox.Root
      ref={(node) => {
        targetRef.current = node;
        setRef(ref, node);
      }}
      data-od-slot="checkbox"
      className={cn(styles.control, className)}
      disabled={disabled}
      name={name ?? groupName}
      readOnly={readOnly}
      data-readonly={readOnly || undefined}
      {...props}
    >
      {children}
      <span ref={layerRef} data-od-slot="checkbox-outline-feedback" className={styles.outlineFeedbackLayer} aria-hidden="true" />
    </BaseCheckbox.Root>
  );
});
export type CheckboxIndicatorProps = ComponentPropsWithoutRef<typeof BaseCheckbox.Indicator>;
export function CheckboxIndicator({ children = "✓", className, ...props }: CheckboxIndicatorProps) {
  return (
    <BaseCheckbox.Indicator aria-hidden="true" data-od-slot="checkbox-indicator" className={cn(styles.indicator, className)} {...props}>
      {children}
    </BaseCheckbox.Indicator>
  );
}
