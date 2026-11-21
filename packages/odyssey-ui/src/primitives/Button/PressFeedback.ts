import { type RefObject, useEffect } from "react";
import { buttonClasses } from "./Button.classes";

interface PressFeedbackOptions {
  disabled: boolean;
  outlineLayerRef: RefObject<HTMLSpanElement | null>;
  rippleLayerRef: RefObject<HTMLSpanElement | null>;
  targetRef: RefObject<HTMLButtonElement | null>;
}

function prefersReducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function privateFlag(target: HTMLElement, name: string) {
  return getComputedStyle(target).getPropertyValue(name).trim() === "1";
}

function motionDisabled(target: HTMLElement) {
  return getComputedStyle(target).getPropertyValue("--od-duration-fast").trim() === "0ms";
}

export function usePressFeedback({ disabled, outlineLayerRef, rippleLayerRef, targetRef }: PressFeedbackOptions) {
  useEffect(() => {
    const target = targetRef.current;
    const outlineLayer = outlineLayerRef.current;
    const rippleLayer = rippleLayerRef.current;
    if (!target || !outlineLayer || !rippleLayer || disabled) return;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    const activeRipples = new Map<number, HTMLElement>();
    const pendingTouches = new Map<number, { clientX: number; clientY: number }>();

    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const canAnimate = () => !prefersReducedMotion() && !motionDisabled(target);

    const showOutlineWave = () => {
      if (!canAnimate() || !privateFlag(target, "--_od-feedback-outline-wave-enabled")) return;
      const wave = document.createElement("span");
      wave.dataset.odSlot = "button-feedback-effect";
      wave.className = buttonClasses.outlineWave;
      const remove = () => wave.remove();
      wave.addEventListener("animationend", (event) => {
        if (event.elapsedTime >= 1.9 || event.animationName?.includes("outline-wave-opacity")) remove();
      });
      outlineLayer.append(wave);
      schedule(remove, 2100);
    };

    const startRipple = (pointerId: number, clientX?: number, clientY?: number) => {
      if (!canAnimate() || !privateFlag(target, "--_od-feedback-radial-ripple-enabled")) return;
      const rect = target.getBoundingClientRect();
      const x = clientX === undefined || clientX === 0 ? rect.width / 2 : clientX - rect.left;
      const y = clientY === undefined || clientY === 0 ? rect.height / 2 : clientY - rect.top;
      const sizeX = Math.max(Math.abs(rect.width - x), Math.abs(x)) * 2 + 2;
      const sizeY = Math.max(Math.abs(rect.height - y), Math.abs(y)) * 2 + 2;
      const size = Math.sqrt(sizeX ** 2 + sizeY ** 2);
      const ripple = document.createElement("span");
      const child = document.createElement("span");
      ripple.dataset.odSlot = "button-feedback-effect";
      ripple.className = buttonClasses.radialRipple;
      ripple.style.setProperty("--_od-ripple-size", `${size}px`);
      ripple.style.setProperty("--_od-ripple-x", `${x - size / 2}px`);
      ripple.style.setProperty("--_od-ripple-y", `${y - size / 2}px`);
      child.className = buttonClasses.radialRippleChild;
      ripple.append(child);
      rippleLayer.append(ripple);
      activeRipples.set(pointerId, ripple);
      schedule(() => {
        if (activeRipples.get(pointerId) === ripple) stopRipple(pointerId);
      }, 900);
    };

    const stopRipple = (pointerId: number) => {
      const ripple = activeRipples.get(pointerId);
      if (!ripple) return;
      activeRipples.delete(pointerId);
      const child = ripple.firstElementChild as HTMLElement | null;
      const remove = () => ripple.remove();
      child?.addEventListener("animationend", remove, { once: true });
      child?.classList.add(buttonClasses.radialRippleLeaving);
      schedule(remove, 600);
    };

    const onClick = (event: MouseEvent) => {
      showOutlineWave();
      if (event.detail === 0 && privateFlag(target, "--_od-feedback-radial-ripple-enabled")) {
        startRipple(-1);
        schedule(() => stopRipple(-1), 120);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!privateFlag(target, "--_od-feedback-radial-ripple-enabled")) return;
      if (event.pointerType === "touch") {
        pendingTouches.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
        schedule(() => {
          const pending = pendingTouches.get(event.pointerId);
          if (!pending) return;
          pendingTouches.delete(event.pointerId);
          startRipple(event.pointerId, pending.clientX, pending.clientY);
        }, 80);
      } else {
        startRipple(event.pointerId, event.clientX, event.clientY);
      }
    };
    const onPointerEnd = (event: PointerEvent) => {
      const pending = pendingTouches.get(event.pointerId);
      if (pending) {
        pendingTouches.delete(event.pointerId);
        if (event.type === "pointerup") {
          startRipple(event.pointerId, pending.clientX, pending.clientY);
          schedule(() => stopRipple(event.pointerId), 0);
        }
      } else {
        stopRipple(event.pointerId);
      }
    };

    target.addEventListener("click", onClick, true);
    target.addEventListener("pointerdown", onPointerDown, true);
    target.addEventListener("pointerup", onPointerEnd, true);
    target.addEventListener("pointercancel", onPointerEnd, true);
    target.addEventListener("pointerleave", onPointerEnd, true);
    return () => {
      target.removeEventListener("click", onClick, true);
      target.removeEventListener("pointerdown", onPointerDown, true);
      target.removeEventListener("pointerup", onPointerEnd, true);
      target.removeEventListener("pointercancel", onPointerEnd, true);
      target.removeEventListener("pointerleave", onPointerEnd, true);
      for (const timer of timers) clearTimeout(timer);
      outlineLayer.replaceChildren();
      rippleLayer.replaceChildren();
    };
  }, [disabled, outlineLayerRef, rippleLayerRef, targetRef]);
}
