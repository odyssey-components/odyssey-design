import { type ForwardedRef, forwardRef, type ReactElement, type ReactNode, useState } from "react";
import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  type ComboboxContentProps,
  ComboboxEmpty,
  ComboboxInput,
  type ComboboxInputProps,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxStatus,
  ComboboxTrigger,
  type ComboboxTriggerProps,
  Spinner,
} from "../../primitives";
import { useProLocale } from "../locale";
import {
  defineProSemanticParts,
  mergeStatefulClassNames,
  mergeStatefulStyles,
  type ProSemanticClassNames,
  type ProSemanticStyles,
  semanticPartProps,
} from "../semantic-parts";

export interface ProOption<TValue> {
  disabled?: boolean;
  label: ReactNode;
  searchText?: string;
  value: TValue;
}

type ProSelectValue<TValue, Multiple extends boolean> = Multiple extends true ? TValue[] : TValue;

export const proSelectParts = defineProSemanticParts({
  root: "pro-select",
  trigger: "pro-select-trigger",
  clear: "pro-select-clear",
  positioner: "pro-select-positioner",
  content: "pro-select-content",
  status: "pro-select-status",
  empty: "pro-select-empty",
  list: "pro-select-list",
  option: "pro-select-option",
  indicator: "pro-select-indicator",
} as const);
export type ProSelectPart = keyof typeof proSelectParts;
export type ProSelectClassNames = ProSemanticClassNames<ProSelectPart>;
export type ProSelectStyles = ProSemanticStyles<ProSelectPart>;
export interface ProSelectSlots<TValue> {
  content?: (content: ReactNode) => ReactNode;
  empty?: (query: string) => ReactNode;
  option?: (option: ProOption<TValue>) => ReactNode;
  trigger?: (trigger: ReactNode) => ReactNode;
}

interface ProSelectBaseProps<TValue, Multiple extends boolean = false> extends Omit<ComboboxInputProps, "defaultValue" | "multiple" | "onChange" | "value"> {
  contentProps?: ComboboxContentProps;
  classNames?: ProSelectClassNames;
  defaultValue?: ProSelectValue<TValue, Multiple>;
  emptyContent?: ReactNode;
  filterOption?: false | ((option: ProOption<TValue>, query: string) => boolean);
  isOptionEqualToValue?: (option: TValue, value: TValue) => boolean;
  itemToStringValue?: (value: TValue) => string;
  label: string;
  loading?: boolean;
  loadingContent?: ReactNode;
  multiple?: Multiple;
  onSearch?: (query: string) => void;
  options: readonly ProOption<TValue>[];
  placeholder?: string;
  searchable?: boolean;
  slots?: ProSelectSlots<TValue>;
  styles?: ProSelectStyles;
  triggerProps?: ComboboxTriggerProps;
  value?: ProSelectValue<TValue, Multiple> | null;
}

export type ProSelectProps<TValue, Multiple extends boolean = false> = ProSelectBaseProps<TValue, Multiple> &
  (
    | { clearable: true; onValueChange?: (value: ProSelectValue<TValue, Multiple> | null) => void }
    | { clearable?: false; onValueChange?: (value: ProSelectValue<TValue, Multiple>) => void }
  );

function ProSelectImplementation<TValue, Multiple extends boolean = false>(
  {
    clearable = false,
    className,
    classNames,
    contentProps,
    defaultValue,
    disabled,
    emptyContent,
    filterOption,
    isOptionEqualToValue,
    itemToStringValue,
    label,
    loading = false,
    loadingContent,
    multiple,
    onSearch,
    onValueChange,
    options,
    placeholder,
    searchable = false,
    slots,
    style,
    styles,
    triggerProps,
    value,
    ...inputProps
  }: ProSelectProps<TValue, Multiple>,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const locale = useProLocale();
  const [query, setQuery] = useState("");
  const labelForValue = (itemValue: TValue) => {
    const option = options.find((candidate) =>
      isOptionEqualToValue ? isOptionEqualToValue(candidate.value, itemValue) : Object.is(candidate.value, itemValue),
    );
    return option?.searchText ?? (typeof option?.label === "string" ? option.label : String(itemValue));
  };
  const filter =
    filterOption === false
      ? null
      : (itemValue: TValue, query: string) => {
          const option = options.find((candidate) =>
            isOptionEqualToValue ? isOptionEqualToValue(candidate.value, itemValue) : Object.is(candidate.value, itemValue),
          );
          if (!option) return false;
          return filterOption ? filterOption(option, query) : labelForValue(itemValue).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
        };
  const triggerContent = slots?.trigger?.(null) ?? null;
  const content = loading ? (
    <ComboboxStatus {...semanticPartProps("status", classNames, styles)} data-od-slot="pro-select-status">
      <Spinner /> {loadingContent ?? locale.select.loading}
    </ComboboxStatus>
  ) : (
    <>
      <ComboboxEmpty {...semanticPartProps("empty", classNames, styles)} data-od-slot="pro-select-empty">
        {slots?.empty?.(query) ?? emptyContent ?? locale.select.empty}
      </ComboboxEmpty>
      <ComboboxList {...semanticPartProps("list", classNames, styles)} data-od-slot="pro-select-list">
        {options.map((option) => (
          <ComboboxItem
            {...semanticPartProps("option", classNames, styles)}
            key={itemToStringValue?.(option.value) ?? labelForValue(option.value)}
            value={option.value}
            disabled={option.disabled}
            data-od-slot="pro-select-option"
          >
            <ComboboxItemIndicator {...semanticPartProps("indicator", classNames, styles)} data-od-slot="pro-select-indicator" />
            {slots?.option?.(option) ?? option.label}
          </ComboboxItem>
        ))}
      </ComboboxList>
    </>
  );
  return (
    <Combobox<TValue, Multiple>
      defaultValue={defaultValue}
      disabled={disabled || loading}
      filter={filter}
      isItemEqualToValue={isOptionEqualToValue}
      itemToStringLabel={labelForValue}
      itemToStringValue={itemToStringValue}
      items={options.map((option) => option.value)}
      multiple={multiple}
      onInputValueChange={(nextQuery) => {
        setQuery(nextQuery);
        onSearch?.(nextQuery);
      }}
      onValueChange={(next) => {
        if (next !== null || clearable) {
          (onValueChange as ((value: ProSelectValue<TValue, Multiple> | null) => void) | undefined)?.(next as ProSelectValue<TValue, Multiple> | null);
        }
      }}
      value={value}
    >
      <ComboboxInput
        ref={ref}
        aria-label={label}
        disabled={disabled || loading}
        placeholder={placeholder ?? locale.select.placeholder}
        readOnly={!searchable}
        {...inputProps}
        data-od-slot="pro-select"
        className={mergeStatefulClassNames(classNames?.root, className)}
        style={mergeStatefulStyles(styles?.root, style)}
      />
      {clearable && (
        <ComboboxClear {...semanticPartProps("clear", classNames, styles)} data-od-slot="pro-select-clear" aria-label={`${label} ${locale.select.clear}`} />
      )}
      <ComboboxTrigger
        {...triggerProps}
        className={mergeStatefulClassNames(classNames?.trigger, triggerProps?.className)}
        style={mergeStatefulStyles(styles?.trigger, triggerProps?.style)}
        aria-label={label}
        disabled={disabled || loading}
        data-od-slot="pro-select-trigger"
      >
        {triggerContent}
      </ComboboxTrigger>
      <ComboboxPortal>
        <ComboboxPositioner {...semanticPartProps("positioner", classNames, styles)} data-od-slot="pro-select-positioner">
          <ComboboxContent
            {...contentProps}
            className={mergeStatefulClassNames(classNames?.content, contentProps?.className)}
            style={mergeStatefulStyles(styles?.content, contentProps?.style)}
            data-od-slot="pro-select-content"
          >
            {slots?.content?.(content) ?? content}
          </ComboboxContent>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  );
}

export const ProSelect = forwardRef(ProSelectImplementation) as <TValue, Multiple extends boolean = false>(
  props: ProSelectProps<TValue, Multiple> & { ref?: ForwardedRef<HTMLInputElement> },
) => ReactElement;

export type { ComboboxContentProps, ComboboxInputProps, ComboboxTriggerProps };
