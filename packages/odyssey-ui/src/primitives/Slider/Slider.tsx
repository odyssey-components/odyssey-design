import { Slider as BaseSlider } from "@base-ui/react/slider";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../lib/cn";

export type SliderProps = ComponentPropsWithoutRef<typeof BaseSlider.Root>;
export function Slider({ className, ...props }: SliderProps) {
  return (
    <BaseSlider.Root
      data-od-slot="slider"
      className={cn(
        "od-Slider-root grid grid-cols-[1fr_auto] gap-[var(--od-space-2)] text-[var(--od-foreground)] data-[disabled]:opacity-55 [&_input[type=range]]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}
export type SliderLabelProps = ComponentPropsWithoutRef<typeof BaseSlider.Label>;
export function SliderLabel({ className, ...props }: SliderLabelProps) {
  return <BaseSlider.Label data-od-slot="slider-label" className={cn("od-Slider-label text-[length:var(--od-font-size-sm)]", className)} {...props} />;
}
export type SliderValueProps = ComponentPropsWithoutRef<typeof BaseSlider.Value>;
export function SliderValue({ className, ...props }: SliderValueProps) {
  return (
    <BaseSlider.Value
      data-od-slot="slider-value"
      className={cn("od-Slider-value text-[length:var(--od-font-size-xs)] text-[var(--od-muted-foreground)]", className)}
      {...props}
    />
  );
}
export type SliderControlProps = ComponentPropsWithoutRef<typeof BaseSlider.Control>;
export function SliderControl({ className, ...props }: SliderControlProps) {
  return (
    <BaseSlider.Control
      data-od-slot="slider-control"
      className={cn("od-Slider-control col-span-full relative flex min-h-6 touch-none select-none items-center", className)}
      {...props}
    />
  );
}
export type SliderTrackProps = ComponentPropsWithoutRef<typeof BaseSlider.Track>;
export function SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <BaseSlider.Track
      data-od-slot="slider-track"
      className={cn("od-Slider-track relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--od-secondary)]", className)}
      {...props}
    />
  );
}
export type SliderIndicatorProps = ComponentPropsWithoutRef<typeof BaseSlider.Indicator>;
export function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
  return <BaseSlider.Indicator data-od-slot="slider-indicator" className={cn("od-Slider-indicator bg-[var(--od-primary)]", className)} {...props} />;
}
export type SliderThumbProps = ComponentPropsWithoutRef<typeof BaseSlider.Thumb>;
export function SliderThumb({ className, ...props }: SliderThumbProps) {
  return (
    <BaseSlider.Thumb
      data-od-slot="slider-thumb"
      className={cn(
        "od-Slider-thumb size-4 rounded-full border-2 border-[var(--od-primary)] bg-[var(--od-background)] shadow-[var(--od-shadow-sm)] focus-visible:outline-[length:var(--od-focus-ring-width)] focus-visible:outline-[color-mix(in_oklch,var(--od-ring)_35%,transparent)] focus-visible:outline-offset-2",
        className,
      )}
      {...props}
    />
  );
}
