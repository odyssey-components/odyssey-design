import { type RefObject, useEffect } from "react";

interface OutlineWaveOptions<T extends HTMLElement> {
  className: string;
  disabled: boolean;
  effectSlot: string;
  layerRef: RefObject<HTMLSpanElement | null>;
  requireChecked?: boolean;
  targetRef: RefObject<T | null>;
}

export function useOutlineWave<T extends HTMLElement>({ className, disabled, effectSlot, layerRef, requireChecked, targetRef }: OutlineWaveOptions<T>) {
  useEffect(() => {
    const target = targetRef.current;
    const layer = layerRef.current;
    if (!target || !layer || disabled) return;
    let frame = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const show = () => {
      if (requireChecked && !target.hasAttribute("data-checked")) return;
      const style = getComputedStyle(target);
      if (
        style.getPropertyValue("--_od-feedback-outline-wave-enabled").trim() !== "1" ||
        style.getPropertyValue("--od-duration-fast").trim() === "0ms" ||
        (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches)
      )
        return;
      const wave = document.createElement("span");
      wave.dataset.odSlot = effectSlot;
      wave.className = className;
      const remove = () => wave.remove();
      wave.addEventListener("animationend", (event) => {
        if (event.elapsedTime >= 1.9 || event.animationName?.includes("outline-wave-opacity")) remove();
      });
      layer.append(wave);
      const timer = setTimeout(() => {
        timers.delete(timer);
        remove();
      }, 2100);
      timers.add(timer);
    };
    const onClick = () => {
      if (requireChecked) frame = requestAnimationFrame(show);
      else show();
    };

    target.addEventListener("click", onClick, true);
    return () => {
      target.removeEventListener("click", onClick, true);
      cancelAnimationFrame(frame);
      for (const timer of timers) clearTimeout(timer);
      layer.replaceChildren();
    };
  }, [className, disabled, effectSlot, layerRef, requireChecked, targetRef]);
}
