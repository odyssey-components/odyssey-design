import { forwardRef } from "react";
import { cn } from "../../lib/cn";
import { Input, type InputProps } from "../Input";
export type NumberInputProps = Omit<InputProps, "type">;
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput({ className, ...props }, ref) {
  return <Input ref={ref} data-od-slot="number-input" type="number" inputMode="decimal" className={cn("tabular-nums", className)} {...props} />;
});
