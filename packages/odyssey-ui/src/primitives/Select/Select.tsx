import { Select as BaseSelect } from "@base-ui/react/select";
import { type ComponentPropsWithoutRef, type ComponentRef, type CSSProperties, forwardRef } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = {
  trigger: "od-Select-trigger",
  value: "od-Select-value",
  icon: "od-Select-icon",
  positioner: "od-Select-positioner",
  popup: "od-Select-popup",
  item: "od-Select-item",
  check: "od-Select-check",
} as const;

export type SelectProps = ComponentPropsWithoutRef<typeof BaseSelect.Root>;
export function Select(props: SelectProps) {
  return (
    <OverlayLayerProvider layerRole="consumer">
      <BaseSelect.Root {...props} />
    </OverlayLayerProvider>
  );
}
export type SelectTriggerVariant = "outline" | "ghost";
export type SelectTriggerProps = ComponentPropsWithoutRef<typeof BaseSelect.Trigger> & {
  /** Visual treatment. Use ghost when a surrounding surface already provides the control boundary. @defaultValue "outline" */
  variant?: SelectTriggerVariant;
};
export const SelectTrigger = forwardRef<ComponentRef<typeof BaseSelect.Trigger>, SelectTriggerProps>(function SelectTrigger(
  { className, variant = "outline", ...props },
  ref,
) {
  return <BaseSelect.Trigger ref={ref} data-od-slot="select-trigger" data-variant={variant} className={cn(styles.trigger, className)} {...props} />;
});
export type SelectValueProps = ComponentPropsWithoutRef<typeof BaseSelect.Value>;
export function SelectValue(props: SelectValueProps) {
  return <BaseSelect.Value data-od-slot="select-value" className={styles.value} {...props} />;
}
export type SelectIconProps = ComponentPropsWithoutRef<typeof BaseSelect.Icon>;
export function SelectIcon({ children, className, ...props }: SelectIconProps) {
  return (
    <BaseSelect.Icon data-od-slot="select-icon" aria-hidden="true" className={cn(styles.icon, className)} {...props}>
      {children ?? (
        <svg
          aria-hidden="true"
          focusable="false"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      )}
    </BaseSelect.Icon>
  );
}
export type SelectPortalProps = ComponentPropsWithoutRef<typeof BaseSelect.Portal>;
export function SelectPortal({ container, ...props }: SelectPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseSelect.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type SelectPositionerProps = ComponentPropsWithoutRef<typeof BaseSelect.Positioner>;
export const SelectPositioner = forwardRef<ComponentRef<typeof BaseSelect.Positioner>, SelectPositionerProps>(function SelectPositioner(
  { className, side = "bottom", align = "start", alignItemWithTrigger = false, sideOffset = 4, style, ...props },
  ref,
) {
  return (
    <BaseSelect.Positioner
      ref={ref}
      data-od-slot="select-positioner"
      className={cn(styles.positioner, className)}
      side={side}
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
      sideOffset={sideOffset}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
});
export type SelectContentWidth = "trigger" | "content" | CSSProperties["inlineSize"];
export interface SelectContentProps extends Omit<ComponentPropsWithoutRef<typeof BaseSelect.Popup>, "width"> {
  width?: SelectContentWidth;
}
export const SelectContent = forwardRef<ComponentRef<typeof BaseSelect.Popup>, SelectContentProps>(function SelectContent(
  { className, style, width = "content", ...props },
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
    <BaseSelect.Popup
      ref={ref}
      data-od-slot="select-content"
      data-od-portal=""
      data-width={widthMode}
      className={cn(styles.popup, className)}
      style={mergedStyle}
      {...props}
    />
  );
});
export type SelectListProps = ComponentPropsWithoutRef<typeof BaseSelect.List>;
export function SelectList(props: SelectListProps) {
  return <BaseSelect.List data-od-slot="select-list" {...props} />;
}
export type SelectItemProps = ComponentPropsWithoutRef<typeof BaseSelect.Item>;
export function SelectItem({ className, ...props }: SelectItemProps) {
  return <BaseSelect.Item data-od-slot="select-item" className={cn(styles.item, className)} {...props} />;
}
export type SelectItemIndicatorProps = ComponentPropsWithoutRef<typeof BaseSelect.ItemIndicator>;
export function SelectItemIndicator({ children = "✓", className, ...props }: SelectItemIndicatorProps) {
  return (
    <BaseSelect.ItemIndicator data-od-slot="select-item-indicator" className={cn(styles.check, className)} {...props}>
      {children}
    </BaseSelect.ItemIndicator>
  );
}
export type SelectItemTextProps = ComponentPropsWithoutRef<typeof BaseSelect.ItemText>;
export function SelectItemText(props: SelectItemTextProps) {
  return <BaseSelect.ItemText data-od-slot="select-item-text" {...props} />;
}
export type SelectGroupProps = ComponentPropsWithoutRef<typeof BaseSelect.Group>;
export function SelectGroup(props: SelectGroupProps) {
  return <BaseSelect.Group data-od-slot="select-group" {...props} />;
}
export type SelectGroupLabelProps = ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>;
export function SelectGroupLabel(props: SelectGroupLabelProps) {
  return <BaseSelect.GroupLabel data-od-slot="select-group-label" {...props} />;
}
