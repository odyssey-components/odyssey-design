import { type OTPInputProps as InputOtpProps, OTPInput, OTPInputContext } from "input-otp";
import { type ComponentPropsWithoutRef, forwardRef, type HTMLAttributes, useContext } from "react";
import { cn } from "../../lib/cn";
import type { OdysseySize } from "../../types";

const styles = {
  input: "od-OtpInput-input",
  container: "od-OtpInput-container",
  group: "od-OtpInput-group",
  slot: "od-OtpInput-slot",
  separator: "od-OtpInput-separator",
  caret: "od-OtpInput-caret",
} as const;

type WithoutNativeSize<Props> = Props extends unknown ? Omit<Props, "size"> : never;
export type OtpInputProps = WithoutNativeSize<InputOtpProps> & { invalid?: boolean; size?: OdysseySize };
export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(function OtpInput(
  {
    className,
    containerClassName,
    autoComplete = "one-time-code",
    disabled,
    inputMode = "numeric",
    invalid = false,
    size = "md",
    spellCheck = false,
    ...props
  },
  ref,
) {
  return (
    <OTPInput
      ref={ref}
      data-od-slot="otp-input"
      data-size={size}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      autoComplete={autoComplete}
      inputMode={inputMode}
      spellCheck={spellCheck}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      className={cn(styles.input, className)}
      containerClassName={cn(styles.container, `od-OtpInput-${size}`, invalid && "od-OtpInput-invalid", disabled && "od-OtpInput-disabled", containerClassName)}
      {...props}
    />
  );
});

export const OtpGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function OtpGroup({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="otp-group" className={cn(styles.group, className)} {...props} />;
});

export interface OtpSlotProps extends HTMLAttributes<HTMLDivElement> {
  index: number;
  mask?: boolean;
}
export const OtpSlot = forwardRef<HTMLDivElement, OtpSlotProps>(function OtpSlot({ className, index, mask = false, ...props }, ref) {
  const context = useContext(OTPInputContext);
  const slot = context.slots[index];
  if (!slot) return null;
  return (
    <div ref={ref} aria-hidden="true" data-od-slot="otp-slot" data-active={slot.isActive || undefined} className={cn(styles.slot, className)} {...props}>
      {mask && slot.char ? "•" : (slot.char ?? slot.placeholderChar)}
      {slot.hasFakeCaret ? <div data-od-slot="otp-caret" className={styles.caret} /> : null}
    </div>
  );
});

export type OtpSeparatorProps = ComponentPropsWithoutRef<"div">;
export const OtpSeparator = forwardRef<HTMLDivElement, OtpSeparatorProps>(function OtpSeparator({ className, children = "−", ...props }, ref) {
  return (
    <div ref={ref} aria-hidden="true" data-od-slot="otp-separator" className={cn(styles.separator, className)} {...props}>
      {children}
    </div>
  );
});

export { REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
