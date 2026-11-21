import type { DeepKeys } from "@tanstack/react-form";
import type { ReactNode } from "react";

export interface ProFormFieldBase<TInput extends Record<string, unknown>, TName extends Extract<DeepKeys<TInput>, string>> {
  description?: ReactNode;
  disabled?: boolean;
  label: ReactNode;
  name: TName;
}
