import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import type { ComponentPropsWithoutRef } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = { positioner: "od-Tooltip-positioner", tooltip: "od-Tooltip-tooltip" } as const;

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof BaseTooltip.Provider>;
export function TooltipProvider(props: TooltipProviderProps) {
  return <BaseTooltip.Provider {...props} />;
}
export type TooltipProps = ComponentPropsWithoutRef<typeof BaseTooltip.Root>;
export function Tooltip(props: TooltipProps) {
  return (
    <OverlayLayerProvider layerRole="consumer">
      <BaseTooltip.Root {...props} />
    </OverlayLayerProvider>
  );
}
export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof BaseTooltip.Trigger>;
export function TooltipTrigger(props: TooltipTriggerProps) {
  return <BaseTooltip.Trigger data-od-slot="tooltip-trigger" {...props} />;
}
export type TooltipPortalProps = ComponentPropsWithoutRef<typeof BaseTooltip.Portal>;
export function TooltipPortal({ container, ...props }: TooltipPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseTooltip.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type TooltipPositionerProps = ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>;
export function TooltipPositioner({ className, sideOffset = 6, style, ...props }: TooltipPositionerProps) {
  return (
    <BaseTooltip.Positioner
      data-od-slot="tooltip-positioner"
      className={cn(styles.positioner, className)}
      sideOffset={sideOffset}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export type TooltipContentProps = ComponentPropsWithoutRef<typeof BaseTooltip.Popup>;
export function TooltipContent({ className, role = "tooltip", ...props }: TooltipContentProps) {
  return <BaseTooltip.Popup role={role} data-od-slot="tooltip-content" data-od-portal="" className={cn(styles.tooltip, className)} {...props} />;
}
