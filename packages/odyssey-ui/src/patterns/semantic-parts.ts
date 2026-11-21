import type { CSSProperties, SyntheticEvent } from "react";
import { cn } from "../lib/cn";

export type ProSemanticClassNames<TPart extends string> = Partial<Record<TPart, string>>;
export type ProSemanticStyles<TPart extends string> = Partial<Record<TPart, CSSProperties>>;

export type ProSemanticPartDescriptor = Readonly<Record<string, string>>;

/**
 * Declares a component's public semantic anatomy once. The descriptor is both
 * the type source for classNames/styles and the runtime source of slot names.
 */
export function defineProSemanticParts<const TDescriptor extends ProSemanticPartDescriptor>(descriptor: TDescriptor): TDescriptor {
  const slots = Object.values(descriptor);
  if (new Set(slots).size !== slots.length) throw new Error("A Pro semantic descriptor cannot contain duplicate data-od-slot values");
  return Object.freeze(descriptor);
}

export type ProSemanticPart<TDescriptor extends ProSemanticPartDescriptor> = Extract<keyof TDescriptor, string>;
export type ProSemanticClassNamesFor<TDescriptor extends ProSemanticPartDescriptor> = ProSemanticClassNames<ProSemanticPart<TDescriptor>>;
export type ProSemanticStylesFor<TDescriptor extends ProSemanticPartDescriptor> = ProSemanticStyles<ProSemanticPart<TDescriptor>>;

export function semanticSlot<TDescriptor extends ProSemanticPartDescriptor, TPart extends ProSemanticPart<TDescriptor>>(
  descriptor: TDescriptor,
  part: TPart,
): TDescriptor[TPart] {
  return descriptor[part];
}

export function mergeClassNames(...values: Array<string | false | null | undefined>): string | undefined {
  return cn(...values) || undefined;
}

export function mergeStyles(...values: Array<CSSProperties | null | undefined>): CSSProperties | undefined {
  const present = values.filter(Boolean) as CSSProperties[];
  return present.length ? Object.assign({}, ...present) : undefined;
}

export function mergeStatefulClassNames<TState>(
  ...values: Array<string | ((state: TState) => string | undefined) | false | null | undefined>
): string | ((state: TState) => string | undefined) | undefined {
  if (!values.some((value) => typeof value === "function")) return mergeClassNames(...(values as Array<string | false | null | undefined>));
  return (state) => mergeClassNames(...values.map((value) => (typeof value === "function" ? value(state) : value)));
}

export function mergeStatefulStyles<TState>(
  ...values: Array<CSSProperties | ((state: TState) => CSSProperties | undefined) | null | undefined>
): CSSProperties | ((state: TState) => CSSProperties | undefined) | undefined {
  if (!values.some((value) => typeof value === "function")) return mergeStyles(...(values as Array<CSSProperties | null | undefined>));
  return (state) => mergeStyles(...values.map((value) => (typeof value === "function" ? value(state) : value)));
}

export function semanticPartProps<TPart extends string>(
  part: TPart,
  classNames?: ProSemanticClassNames<TPart>,
  styles?: ProSemanticStyles<TPart>,
  className?: string,
  style?: CSSProperties,
) {
  return {
    className: mergeClassNames(classNames?.[part], className),
    style: mergeStyles(styles?.[part], style),
  };
}

export function composeEventHandlers<TEvent extends SyntheticEvent>(
  first: ((event: TEvent) => void) | undefined,
  second: ((event: TEvent) => void) | undefined,
) {
  if (!first) return second;
  if (!second) return first;
  return (event: TEvent) => {
    first(event);
    if (!event.defaultPrevented) second(event);
  };
}
