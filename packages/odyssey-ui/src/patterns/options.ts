import type { ReactNode } from "react";

export interface ProActionOption<TContext = void> {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean | ((context: TContext) => boolean);
  hidden?: boolean | ((context: TContext) => boolean);
  loading?: boolean;
  destructive?: boolean;
  onAction(context: TContext): void | Promise<void>;
}

export interface ProFilterOption<TValue = unknown> {
  key: string;
  label: ReactNode;
  value?: TValue;
  placeholder?: string;
  options?: readonly { label: ReactNode; value: TValue; disabled?: boolean }[];
  type?: "search" | "select" | "toggle";
  onChange(value: TValue): void;
}

export interface ProFieldOption<TValue = unknown> {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  value?: TValue;
}

export interface ProNavigationOption {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}
