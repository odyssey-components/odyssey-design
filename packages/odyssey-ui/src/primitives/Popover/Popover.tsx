import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentPropsWithoutRef } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = { positioner: "od-Popover-positioner", popup: "od-Popover-popup", popover: "od-Popover-popover" } as const;

export type PopoverProps = ComponentPropsWithoutRef<typeof BasePopover.Root>;
export function Popover(props: PopoverProps) {
  return (
    <OverlayLayerProvider layerRole="consumer">
      <BasePopover.Root {...props} />
    </OverlayLayerProvider>
  );
}
export type PopoverTriggerProps = ComponentPropsWithoutRef<typeof BasePopover.Trigger>;
export function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger data-od-slot="popover-trigger" {...props} />;
}
export type PopoverPortalProps = ComponentPropsWithoutRef<typeof BasePopover.Portal>;
export function PopoverPortal({ container, ...props }: PopoverPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BasePopover.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type PopoverPositionerProps = ComponentPropsWithoutRef<typeof BasePopover.Positioner>;
export function PopoverPositioner({ className, sideOffset = 8, style, ...props }: PopoverPositionerProps) {
  return (
    <BasePopover.Positioner
      data-od-slot="popover-positioner"
      className={cn(styles.positioner, className)}
      sideOffset={sideOffset}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export type PopoverContentProps = ComponentPropsWithoutRef<typeof BasePopover.Popup>;
export function PopoverContent({ className, ...props }: PopoverContentProps) {
  return <BasePopover.Popup data-od-slot="popover-content" data-od-portal="" className={cn(styles.popup, styles.popover, className)} {...props} />;
}
export type PopoverArrowProps = ComponentPropsWithoutRef<typeof BasePopover.Arrow>;
export function PopoverArrow(props: PopoverArrowProps) {
  return <BasePopover.Arrow data-od-slot="popover-arrow" {...props} />;
}
export type PopoverCloseProps = ComponentPropsWithoutRef<typeof BasePopover.Close>;
export function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close data-od-slot="popover-close" {...props} />;
}
