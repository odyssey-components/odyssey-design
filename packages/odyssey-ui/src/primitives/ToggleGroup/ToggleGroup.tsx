import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { type CSSProperties, type ForwardedRef, forwardRef, type ReactElement } from "react";
import { cn } from "../../lib/cn";
import type { OdysseySize } from "../../types";

export interface ToggleGroupProps<Value extends string = string> extends BaseToggleGroup.Props<Value> {
  block?: boolean;
  size?: OdysseySize;
  spacing?: number;
}

function ToggleGroupImplementation<Value extends string = string>(
  { block = false, className, orientation = "horizontal", size = "md", spacing = 0, style, ...props }: ToggleGroupProps<Value>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <BaseToggleGroup<Value>
      ref={ref}
      data-od-slot="toggle-group"
      data-block={block || undefined}
      data-size={size}
      data-spacing={spacing}
      className={cn(
        "od-ToggleGroup-root isolate inline-flex min-is-0 gap-[var(--_od-toggle-group-spacing,0)] data-[orientation=vertical]:items-stretch data-[orientation=vertical]:flex-col data-[block]:flex data-[block]:w-full data-[block]:[&>[data-od-slot=toggle-button]]:flex-1 data-[size=sm]:[&>[data-od-slot=toggle-button]]:min-h-[var(--od-control-height-sm)] data-[size=sm]:[&>[data-od-slot=toggle-button]]:px-[var(--od-button-padding-inline-sm)] data-[size=sm]:[&>[data-od-slot=toggle-button]]:text-[length:var(--od-font-size-sm)] data-[size=lg]:[&>[data-od-slot=toggle-button]]:min-h-[var(--od-control-height-lg)] data-[size=lg]:[&>[data-od-slot=toggle-button]]:px-[var(--od-button-padding-inline-lg)] data-[size=lg]:[&>[data-od-slot=toggle-button]]:text-[length:var(--od-font-size-lg)] data-[spacing=0]:[&>[data-od-slot=toggle-button]]:relative data-[spacing=0]:[&>[data-od-slot=toggle-button]]:z-0 data-[spacing=0]:[&>[data-od-slot=toggle-button][data-pressed]]:z-[1] data-[spacing=0]:[&>[data-od-slot=toggle-button]:focus-visible]:z-[2] data-[spacing=0]:[&>[data-od-slot=toggle-button][data-pressed]:not(:focus-visible)]:[box-shadow:none] data-[spacing=0]:[&>[data-od-slot=toggle-button]]:rounded-none data-[spacing=0]:[&>[data-od-slot=toggle-button]]:ms-[calc(-1*var(--od-line-width))] data-[spacing=0]:[&>[data-od-slot=toggle-button]:first-child]:ms-0 data-[spacing=0]:[&>[data-od-slot=toggle-button]:first-child]:rounded-s-[var(--od-button-radius)] data-[spacing=0]:[&>[data-od-slot=toggle-button]:last-child]:rounded-e-[var(--od-button-radius)] data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]]:ms-0 data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]]:mt-[calc(-1*var(--od-line-width))] data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]:first-child]:mt-0 data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]:first-child]:rounded-t-[var(--od-button-radius)] data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]:first-child]:rounded-b-none data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]:last-child]:rounded-b-[var(--od-button-radius)] data-[orientation=vertical]:data-[spacing=0]:[&>[data-od-slot=toggle-button]:last-child]:rounded-t-none",
        className,
      )}
      orientation={orientation}
      style={{ "--_od-toggle-group-spacing": `${spacing}px`, ...style } as CSSProperties & Record<"--_od-toggle-group-spacing", string>}
      {...props}
    />
  );
}

export const ToggleGroup = forwardRef(ToggleGroupImplementation) as <Value extends string = string>(
  props: ToggleGroupProps<Value> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
