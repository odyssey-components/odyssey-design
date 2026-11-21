import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { type ComponentPropsWithoutRef, type ComponentRef, type CSSProperties, forwardRef } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = {
  input: "od-Combobox-input",
  trigger: "od-Combobox-trigger",
  clear: "od-Combobox-clear",
  positioner: "od-Combobox-positioner",
  content: "od-Combobox-content",
  list: "od-Combobox-list",
  item: "od-Combobox-item",
  indicator: "od-Combobox-indicator",
  groupLabel: "od-Combobox-groupLabel",
  status: "od-Combobox-status",
  empty: "od-Combobox-empty",
  separator: "od-Combobox-separator",
  chips: "od-Combobox-chips",
  chip: "od-Combobox-chip",
  chipRemove: "od-Combobox-chipRemove",
  chipsInput: "od-Combobox-chipsInput",
} as const;

type RootProps<TValue, Multiple extends boolean | undefined> = Parameters<typeof BaseCombobox.Root<TValue, Multiple>>[0];
export function Combobox<TValue, Multiple extends boolean | undefined = false>(props: RootProps<TValue, Multiple>) {
  return (
    <OverlayLayerProvider layerRole="consumer">
      <BaseCombobox.Root<TValue, Multiple> {...props} />
    </OverlayLayerProvider>
  );
}
export type ComboboxValueProps = ComponentPropsWithoutRef<typeof BaseCombobox.Value>;
export function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value {...props} />;
}

export type ComboboxInputProps = ComponentPropsWithoutRef<typeof BaseCombobox.Input>;
export const ComboboxInput = forwardRef<ComponentRef<typeof BaseCombobox.Input>, ComboboxInputProps>(function ComboboxInput({ className, ...props }, ref) {
  return <BaseCombobox.Input ref={ref} data-od-slot="combobox-input" className={cn(styles.input, className)} {...props} />;
});
export type ComboboxTriggerProps = ComponentPropsWithoutRef<typeof BaseCombobox.Trigger>;
export const ComboboxTrigger = forwardRef<ComponentRef<typeof BaseCombobox.Trigger>, ComboboxTriggerProps>(function ComboboxTrigger(
  { className, children, ...props },
  ref,
) {
  return (
    <BaseCombobox.Trigger ref={ref} data-od-slot="combobox-trigger" className={cn(styles.trigger, className)} {...props}>
      {children ?? "▾"}
    </BaseCombobox.Trigger>
  );
});
export type ComboboxClearProps = ComponentPropsWithoutRef<typeof BaseCombobox.Clear>;
export const ComboboxClear = forwardRef<ComponentRef<typeof BaseCombobox.Clear>, ComboboxClearProps>(function ComboboxClear(
  { className, children, ...props },
  ref,
) {
  return (
    <BaseCombobox.Clear ref={ref} data-od-slot="combobox-clear" className={cn(styles.clear, className)} {...props}>
      {children ?? "×"}
    </BaseCombobox.Clear>
  );
});
export type ComboboxPortalProps = ComponentPropsWithoutRef<typeof BaseCombobox.Portal>;
export function ComboboxPortal({ container, ...props }: ComboboxPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseCombobox.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type ComboboxPositionerProps = ComponentPropsWithoutRef<typeof BaseCombobox.Positioner>;
export const ComboboxPositioner = forwardRef<ComponentRef<typeof BaseCombobox.Positioner>, ComboboxPositionerProps>(function ComboboxPositioner(
  { className, side = "bottom", align = "start", sideOffset = 4, style, ...props },
  ref,
) {
  return (
    <BaseCombobox.Positioner
      ref={ref}
      data-od-slot="combobox-positioner"
      className={cn(styles.positioner, className)}
      side={side}
      align={align}
      sideOffset={sideOffset}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
});
export type ComboboxContentWidth = "trigger" | "content" | CSSProperties["inlineSize"];
export interface ComboboxContentProps extends Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Popup>, "width"> {
  width?: ComboboxContentWidth;
}
export const ComboboxContent = forwardRef<ComponentRef<typeof BaseCombobox.Popup>, ComboboxContentProps>(function ComboboxContent(
  { className, style, width = "trigger", ...props },
  ref,
) {
  const widthMode = width === "trigger" || width === "content" ? width : "custom";
  const mergedStyle =
    widthMode === "custom"
      ? typeof style === "function"
        ? (state: Parameters<typeof style>[0]) => ({ inlineSize: width, ...style(state) })
        : { inlineSize: width, ...style }
      : style;
  return (
    <BaseCombobox.Popup
      ref={ref}
      data-od-slot="combobox-content"
      data-od-portal=""
      data-width={widthMode}
      className={cn(styles.content, className)}
      style={mergedStyle}
      {...props}
    />
  );
});
export type ComboboxListProps = ComponentPropsWithoutRef<typeof BaseCombobox.List>;
export const ComboboxList = forwardRef<ComponentRef<typeof BaseCombobox.List>, ComboboxListProps>(function ComboboxList({ className, ...props }, ref) {
  return <BaseCombobox.List ref={ref} data-od-slot="combobox-list" className={cn(styles.list, className)} {...props} />;
});
export interface ComboboxItemProps<TValue> extends Omit<ComponentPropsWithoutRef<typeof BaseCombobox.Item>, "value"> {
  value: TValue;
}
export function ComboboxItem<TValue>({ className, ...props }: ComboboxItemProps<TValue>) {
  return <BaseCombobox.Item data-od-slot="combobox-item" className={cn(styles.item, className)} {...props} />;
}
export type ComboboxItemIndicatorProps = ComponentPropsWithoutRef<typeof BaseCombobox.ItemIndicator>;
export const ComboboxItemIndicator = forwardRef<ComponentRef<typeof BaseCombobox.ItemIndicator>, ComboboxItemIndicatorProps>(function ComboboxItemIndicator(
  { className, children = "✓", ...props },
  ref,
) {
  return (
    <BaseCombobox.ItemIndicator ref={ref} data-od-slot="combobox-item-indicator" className={cn(styles.indicator, className)} {...props}>
      {children}
    </BaseCombobox.ItemIndicator>
  );
});
export type ComboboxGroupProps = ComponentPropsWithoutRef<typeof BaseCombobox.Group>;
export function ComboboxGroup(props: ComboboxGroupProps) {
  return <BaseCombobox.Group data-od-slot="combobox-group" {...props} />;
}
export type ComboboxGroupLabelProps = ComponentPropsWithoutRef<typeof BaseCombobox.GroupLabel>;
export const ComboboxGroupLabel = forwardRef<ComponentRef<typeof BaseCombobox.GroupLabel>, ComboboxGroupLabelProps>(function ComboboxGroupLabel(
  { className, ...props },
  ref,
) {
  return <BaseCombobox.GroupLabel ref={ref} data-od-slot="combobox-group-label" className={cn(styles.groupLabel, className)} {...props} />;
});
export type ComboboxStatusProps = ComponentPropsWithoutRef<typeof BaseCombobox.Status>;
export const ComboboxStatus = forwardRef<ComponentRef<typeof BaseCombobox.Status>, ComboboxStatusProps>(function ComboboxStatus({ className, ...props }, ref) {
  return <BaseCombobox.Status ref={ref} data-od-slot="combobox-status" className={cn(styles.status, className)} {...props} />;
});
export type ComboboxEmptyProps = ComponentPropsWithoutRef<typeof BaseCombobox.Empty>;
export const ComboboxEmpty = forwardRef<ComponentRef<typeof BaseCombobox.Empty>, ComboboxEmptyProps>(function ComboboxEmpty({ className, ...props }, ref) {
  return <BaseCombobox.Empty ref={ref} data-od-slot="combobox-empty" className={cn(styles.empty, className)} {...props} />;
});
export type ComboboxSeparatorProps = ComponentPropsWithoutRef<typeof BaseCombobox.Separator>;
export const ComboboxSeparator = forwardRef<ComponentRef<typeof BaseCombobox.Separator>, ComboboxSeparatorProps>(function ComboboxSeparator(
  { className, ...props },
  ref,
) {
  return <BaseCombobox.Separator ref={ref} data-od-slot="combobox-separator" className={cn(styles.separator, className)} {...props} />;
});
export type ComboboxChipsProps = ComponentPropsWithoutRef<typeof BaseCombobox.Chips>;
export const ComboboxChips = forwardRef<ComponentRef<typeof BaseCombobox.Chips>, ComboboxChipsProps>(function ComboboxChips({ className, ...props }, ref) {
  return <BaseCombobox.Chips ref={ref} data-od-slot="combobox-chips" className={cn(styles.chips, className)} {...props} />;
});
export type ComboboxChipProps = ComponentPropsWithoutRef<typeof BaseCombobox.Chip>;
export const ComboboxChip = forwardRef<ComponentRef<typeof BaseCombobox.Chip>, ComboboxChipProps>(function ComboboxChip({ className, ...props }, ref) {
  return <BaseCombobox.Chip ref={ref} data-od-slot="combobox-chip" className={cn(styles.chip, className)} {...props} />;
});
export type ComboboxChipRemoveProps = ComponentPropsWithoutRef<typeof BaseCombobox.ChipRemove>;
export const ComboboxChipRemove = forwardRef<ComponentRef<typeof BaseCombobox.ChipRemove>, ComboboxChipRemoveProps>(function ComboboxChipRemove(
  { className, children = "×", ...props },
  ref,
) {
  return (
    <BaseCombobox.ChipRemove ref={ref} data-od-slot="combobox-chip-remove" className={cn(styles.chipRemove, className)} {...props}>
      {children}
    </BaseCombobox.ChipRemove>
  );
});
export type ComboboxChipsInputProps = ComponentPropsWithoutRef<typeof BaseCombobox.Input>;
export const ComboboxChipsInput = forwardRef<ComponentRef<typeof BaseCombobox.Input>, ComboboxChipsInputProps>(function ComboboxChipsInput(
  { className, ...props },
  ref,
) {
  return <BaseCombobox.Input ref={ref} data-od-slot="combobox-chips-input" className={cn(styles.chipsInput, className)} {...props} />;
});

export const useComboboxFilter = BaseCombobox.useFilter;
export function useFilteredComboboxItems<TValue>(): TValue[] {
  return BaseCombobox.useFilteredItems<TValue>();
}
