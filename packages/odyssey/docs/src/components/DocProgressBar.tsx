import { useProgress } from "@bprogress/react";
import { useEffect, useRef } from "react";

export function DocProgressBar({ active }: { active: boolean }) {
  const { start, stop } = useProgress();
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (active) {
      start();
    } else {
      timerRef.current = setTimeout(() => {
        stop();
      }, 300);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [active, start, stop]);

  return null;
}
