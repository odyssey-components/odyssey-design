import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useState } from "react";
import { Button, EmptyState, EmptyStateTitle, Input, Popover, PopoverContent, PopoverPortal, PopoverPositioner, PopoverTrigger, Stack } from "../../primitives";
import { useProLocale } from "../locale";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStatefulClassNames,
  mergeStatefulStyles,
  mergeStyles,
  type ProSemanticClassNames,
  type ProSemanticStyles,
  semanticPartProps,
} from "../semantic-parts";
export interface ProIconPickerOption {
  value: string;
  label?: string;
  searchText?: string;
  icon: ReactNode;
}
export const proIconPickerParts = defineProSemanticParts({
  root: "pro-icon-picker",
  content: "pro-icon-picker-content",
  search: "pro-icon-picker-search",
  grid: "pro-icon-picker-grid",
  option: "pro-icon-picker-option",
  empty: "pro-icon-picker-empty",
} as const);
export type ProIconPickerPart = keyof typeof proIconPickerParts;
export type ProIconPickerClassNames = ProSemanticClassNames<ProIconPickerPart>;
export type ProIconPickerStyles = ProSemanticStyles<ProIconPickerPart>;
export interface ProIconPickerSlots {
  empty?: (empty: ReactNode) => ReactNode;
  option?: (option: ProIconPickerOption) => ReactNode;
  trigger?: (trigger: ReactNode) => ReactNode;
}
export interface ProIconPickerProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children" | "onChange" | "value"> {
  label: string;
  options: readonly ProIconPickerOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  placeholder?: ReactNode;
  searchPlaceholder?: string;
  emptyContent?: ReactNode;
  classNames?: ProIconPickerClassNames;
  contentProps?: ComponentPropsWithoutRef<typeof PopoverContent>;
  slots?: ProIconPickerSlots;
  styles?: ProIconPickerStyles;
}
export const ProIconPicker = forwardRef<HTMLButtonElement, ProIconPickerProps>(function ProIconPicker(
  {
    label,
    options,
    value,
    onValueChange,
    disabled,
    placeholder,
    searchPlaceholder,
    emptyContent,
    className,
    classNames,
    contentProps,
    slots,
    style,
    styles,
    ...props
  },
  ref,
) {
  const locale = useProLocale();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const selected = options.find((item) => item.value === value);
  const visible = options.filter((item) => (item.searchText ?? item.label ?? item.value).toLowerCase().includes(query.toLowerCase()));
  const trigger = (
    <>
      {selected?.icon}
      {selected?.label ?? value ?? placeholder ?? locale.iconPicker.placeholder}
    </>
  );
  const empty = <EmptyStateTitle>{emptyContent ?? locale.iconPicker.empty}</EmptyStateTitle>;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            {...props}
            ref={ref}
            className={mergeClassNames(classNames?.root, className)}
            style={mergeStyles(styles?.root, style)}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-label={label}
            data-od-slot="pro-icon-picker"
          />
        }
      >
        {slots?.trigger?.(trigger) ?? trigger}
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner align="start">
          <PopoverContent
            {...contentProps}
            className={mergeStatefulClassNames("min-w-[min(22rem,calc(100vw-2rem))]", classNames?.content, contentProps?.className)}
            style={mergeStatefulStyles(styles?.content, contentProps?.style)}
            data-od-slot="pro-icon-picker-content"
          >
            <Stack gap={2}>
              <Input
                {...semanticPartProps("search", classNames, styles)}
                data-od-slot="pro-icon-picker-search"
                aria-label={searchPlaceholder ?? locale.iconPicker.search}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder ?? locale.iconPicker.search}
              />
              {visible.length ? (
                <div
                  {...semanticPartProps("grid", classNames, styles)}
                  className={mergeClassNames(
                    "grid max-h-[min(20rem,var(--available-height,20rem))] grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1 overflow-auto",
                    classNames?.grid,
                  )}
                  data-od-slot="pro-icon-picker-grid"
                >
                  {visible.map((item) => (
                    <Button
                      {...semanticPartProps("option", classNames, styles)}
                      data-od-slot="pro-icon-picker-option"
                      key={item.value}
                      type="button"
                      size="sm"
                      variant={item.value === value ? "solid" : "ghost"}
                      aria-label={item.label ?? item.value}
                      title={item.label ?? item.value}
                      onClick={() => {
                        onValueChange?.(item.value);
                        setOpen(false);
                        setQuery("");
                      }}
                    >
                      {slots?.option?.(item) ?? item.icon}
                    </Button>
                  ))}
                </div>
              ) : (
                <EmptyState {...semanticPartProps("empty", classNames, styles)} data-od-slot="pro-icon-picker-empty">
                  {slots?.empty?.(empty) ?? empty}
                </EmptyState>
              )}
            </Stack>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
});
