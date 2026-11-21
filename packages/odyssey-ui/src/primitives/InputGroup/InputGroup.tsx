import { createContext, forwardRef, type HTMLAttributes, type MouseEvent, useContext } from "react";
import { cn } from "../../lib/cn";
import { Button, type ButtonProps } from "../Button";
import { Input, type InputProps } from "../Input";
import { Textarea, type TextareaProps } from "../Textarea";

const styles = {
  root: "od-InputGroup-root",
  addon: "od-InputGroup-addon",
  text: "od-InputGroup-text",
  input: "od-InputGroup-input",
  textarea: "od-InputGroup-textarea",
  button: "od-InputGroup-button",
} as const;

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  invalid?: boolean;
  disabled?: boolean;
}
const InputGroupStateContext = createContext({ disabled: false, invalid: false });
export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { children, className, invalid = false, disabled = false, ...props },
  ref,
) {
  return (
    <InputGroupStateContext.Provider value={{ disabled, invalid }}>
      {/* biome-ignore lint/a11y/useSemanticElements: this generic compound input group has no fieldset legend API. */}
      <div
        ref={ref}
        data-od-slot="input-group"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        role="group"
        className={cn(styles.root, className)}
        {...props}
      >
        {children}
      </div>
    </InputGroupStateContext.Provider>
  );
});

export interface InputGroupAddonProps extends HTMLAttributes<HTMLDivElement> {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
}
export const InputGroupAddon = forwardRef<HTMLDivElement, InputGroupAddonProps>(function InputGroupAddon(
  { align = "inline-start", className, onClick, ...props },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || (event.target as Element).closest("button, a, input, select, textarea")) return;
    event.currentTarget.parentElement?.querySelector<HTMLElement>("[data-od-slot='input-group-control']")?.focus();
  };
  return <div ref={ref} data-od-slot="input-group-addon" data-align={align} className={cn(styles.addon, className)} onClick={handleClick} {...props} />;
});

export const InputGroupText = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function InputGroupText({ className, ...props }, ref) {
  return <span ref={ref} data-od-slot="input-group-text" className={cn(styles.text, className)} {...props} />;
});
export const InputGroupInput = forwardRef<HTMLInputElement, InputProps>(function InputGroupInput({ className, ...props }, ref) {
  const state = useContext(InputGroupStateContext);
  return (
    <Input
      ref={ref}
      data-od-slot="input-group-control"
      className={cn(styles.input, className)}
      disabled={props.disabled ?? state.disabled}
      aria-invalid={(props["aria-invalid"] ?? state.invalid) || undefined}
      {...props}
    />
  );
});
export const InputGroupTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function InputGroupTextarea({ className, ...props }, ref) {
  const state = useContext(InputGroupStateContext);
  return (
    <Textarea
      ref={ref}
      data-od-slot="input-group-control"
      className={cn(styles.textarea, className)}
      disabled={props.disabled ?? state.disabled}
      aria-invalid={(props["aria-invalid"] ?? state.invalid) || undefined}
      {...props}
    />
  );
});

export interface InputGroupButtonProps extends Omit<ButtonProps, "size"> {
  size?: "xs" | "sm" | "icon-xs" | "icon-sm";
}
export const InputGroupButton = forwardRef<HTMLButtonElement, InputGroupButtonProps>(function InputGroupButton(
  { className, size = "xs", type = "button", ...props },
  ref,
) {
  const state = useContext(InputGroupStateContext);
  return (
    <Button
      ref={ref}
      data-od-slot="input-group-button"
      data-input-group-size={size}
      className={cn(styles.button, className)}
      type={type}
      disabled={props.disabled ?? state.disabled}
      {...props}
    />
  );
});
