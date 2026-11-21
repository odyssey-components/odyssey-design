import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ComponentPropsWithoutRef } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = {
  positioner: "od-DropdownMenu-positioner",
  content: "od-DropdownMenu-content",
  item: "od-DropdownMenu-item",
  submenuTrigger: "od-DropdownMenu-submenuTrigger",
  separator: "od-DropdownMenu-separator",
  groupLabel: "od-DropdownMenu-groupLabel",
  indicator: "od-DropdownMenu-indicator",
} as const;

export type DropdownMenuProps = ComponentPropsWithoutRef<typeof BaseMenu.Root>;
export function DropdownMenu(props: DropdownMenuProps) {
  return (
    <OverlayLayerProvider layerRole="consumer">
      <BaseMenu.Root {...props} />
    </OverlayLayerProvider>
  );
}
export type DropdownMenuTriggerProps = ComponentPropsWithoutRef<typeof BaseMenu.Trigger>;
export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  return <BaseMenu.Trigger data-od-slot="dropdown-menu-trigger" {...props} />;
}
export type DropdownMenuPortalProps = ComponentPropsWithoutRef<typeof BaseMenu.Portal>;
export function DropdownMenuPortal({ container, ...props }: DropdownMenuPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseMenu.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type DropdownMenuPositionerProps = ComponentPropsWithoutRef<typeof BaseMenu.Positioner>;
export function DropdownMenuPositioner({ className, sideOffset = 8, style, ...props }: DropdownMenuPositionerProps) {
  return (
    <BaseMenu.Positioner
      data-od-slot="dropdown-menu-positioner"
      className={cn(styles.positioner, className)}
      sideOffset={sideOffset}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export type DropdownMenuContentProps = ComponentPropsWithoutRef<typeof BaseMenu.Popup>;
export function DropdownMenuContent({ className, ...props }: DropdownMenuContentProps) {
  return <BaseMenu.Popup data-od-slot="dropdown-menu-content" data-od-portal="" className={cn(styles.content, className)} {...props} />;
}
export type DropdownMenuItemProps = ComponentPropsWithoutRef<typeof BaseMenu.Item>;
export function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  return <BaseMenu.Item data-od-slot="dropdown-menu-item" className={cn(styles.item, className)} {...props} />;
}
export type DropdownMenuSubmenuProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuRoot>;
export function DropdownMenuSubmenu(props: DropdownMenuSubmenuProps) {
  return <BaseMenu.SubmenuRoot {...props} />;
}
export type DropdownMenuSubmenuTriggerProps = ComponentPropsWithoutRef<typeof BaseMenu.SubmenuTrigger>;
export function DropdownMenuSubmenuTrigger({ className, ...props }: DropdownMenuSubmenuTriggerProps) {
  return <BaseMenu.SubmenuTrigger data-od-slot="dropdown-menu-submenu-trigger" className={cn(styles.item, styles.submenuTrigger, className)} {...props} />;
}
export type DropdownMenuSubmenuContentProps = DropdownMenuContentProps & {
  align?: DropdownMenuPositionerProps["align"];
  side?: DropdownMenuPositionerProps["side"];
  sideOffset?: number;
};
export function DropdownMenuSubmenuContent({ align = "start", side = "right", sideOffset = 4, ...props }: DropdownMenuSubmenuContentProps) {
  return (
    <DropdownMenuPortal>
      <DropdownMenuPositioner align={align} side={side} sideOffset={sideOffset}>
        <DropdownMenuContent {...props} />
      </DropdownMenuPositioner>
    </DropdownMenuPortal>
  );
}
export type DropdownMenuSeparatorProps = ComponentPropsWithoutRef<"hr">;
export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return <hr data-od-slot="dropdown-menu-separator" className={cn(styles.separator, className)} {...props} />;
}
export type DropdownMenuGroupProps = ComponentPropsWithoutRef<typeof BaseMenu.Group>;
export function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <BaseMenu.Group data-od-slot="dropdown-menu-group" {...props} />;
}
export type DropdownMenuGroupLabelProps = ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>;
export function DropdownMenuGroupLabel({ className, ...props }: DropdownMenuGroupLabelProps) {
  return <BaseMenu.GroupLabel data-od-slot="dropdown-menu-group-label" className={cn(styles.groupLabel, className)} {...props} />;
}
export type DropdownMenuRadioGroupProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioGroup>;
export function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <BaseMenu.RadioGroup data-od-slot="dropdown-menu-radio-group" {...props} />;
}
export type DropdownMenuRadioItemProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioItem>;
export function DropdownMenuRadioItem({ className, ...props }: DropdownMenuRadioItemProps) {
  return <BaseMenu.RadioItem data-od-slot="dropdown-menu-radio-item" className={cn(styles.item, className)} {...props} />;
}
export type DropdownMenuRadioItemIndicatorProps = ComponentPropsWithoutRef<typeof BaseMenu.RadioItemIndicator>;
export function DropdownMenuRadioItemIndicator({ children = "✓", className, ...props }: DropdownMenuRadioItemIndicatorProps) {
  return (
    <BaseMenu.RadioItemIndicator data-od-slot="dropdown-menu-radio-item-indicator" className={cn(styles.indicator, className)} {...props}>
      {children}
    </BaseMenu.RadioItemIndicator>
  );
}
