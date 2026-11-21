import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { type ComponentPropsWithoutRef, type ComponentRef, type ForwardedRef, forwardRef, useRef } from "react";
import { useOutlineWave } from "../../internal/useOutlineWave";
import { cn } from "../../lib/cn";
import type { OdysseySize } from "../../types";

const styles = {
  switch: "od-Switch-switch",
  thumb: "od-Switch-thumb",
  outlineFeedbackLayer: "od-Switch-outlineFeedbackLayer",
  outlineWave: "od-Switch-outlineWave",
} as const;

export interface SwitchProps extends ComponentPropsWithoutRef<typeof BaseSwitch.Root> {
  disablePressFeedback?: boolean;
  size?: OdysseySize;
}
function setRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}
export const Switch = forwardRef<ComponentRef<typeof BaseSwitch.Root>, SwitchProps>(function Switch(
  { children, className, disabled = false, disablePressFeedback = false, readOnly = false, size = "md", ...props },
  ref,
) {
  const targetRef = useRef<ComponentRef<typeof BaseSwitch.Root>>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  useOutlineWave({
    className: styles.outlineWave,
    disabled: disabled || disablePressFeedback,
    effectSlot: "switch-feedback-effect",
    layerRef,
    targetRef,
  });
  return (
    <BaseSwitch.Root
      ref={(node) => {
        targetRef.current = node;
        setRef(ref, node);
      }}
      data-od-slot="switch"
      data-size={size}
      data-readonly={readOnly || undefined}
      className={cn(styles.switch, className)}
      disabled={disabled}
      readOnly={readOnly}
      {...props}
    >
      {children}
      <span ref={layerRef} data-od-slot="switch-outline-feedback" className={styles.outlineFeedbackLayer} aria-hidden="true" />
    </BaseSwitch.Root>
  );
});
export type SwitchThumbProps = ComponentPropsWithoutRef<typeof BaseSwitch.Thumb>;
export function SwitchThumb({ className, ...props }: SwitchThumbProps) {
  return <BaseSwitch.Thumb data-od-slot="switch-thumb" className={cn(styles.thumb, className)} {...props} />;
}
