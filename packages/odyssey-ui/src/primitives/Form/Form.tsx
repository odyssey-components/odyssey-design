import { type FormHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";
export type FormVariant = "stack" | "inline" | "responsive-grid";
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  variant?: FormVariant;
}
export const Form = forwardRef<HTMLFormElement, FormProps>(function Form({ className, variant = "stack", ...props }, ref) {
  return <form ref={ref} data-od-slot="form" data-variant={variant} className={cn("od-Form", className)} {...props} />;
});
