import { useEffect, useRef, useState } from "react";
import type { OutlineItem } from "../docs/types";

export function useActiveHeading(outline: OutlineItem[], contentRevision = 0): string | undefined {
  const [activeHeadingId, setActiveHeadingId] = useState(outline[0]?.id);
  const outlineRef = useRef(outline);
  outlineRef.current = outline;

  useEffect(() => {
    setActiveHeadingId(outline[0]?.id);

    if (outline.length === 0) return;

    const scrollRoot = document.querySelector(".app-main");

    const observer = new IntersectionObserver(
      (entries) => {
        const current = outlineRef.current;
        let latestId: string | undefined;
        let latestIdx = -1;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = current.findIndex((o) => o.id === entry.target.id);
          if (idx >= 0 && idx > latestIdx) {
            latestIdx = idx;
            latestId = entry.target.id;
          }
        }

        if (latestId) setActiveHeadingId(latestId);
      },
      {
        root: scrollRoot,
        rootMargin: "-32px 0px -80% 0px",
        threshold: 0,
      },
    );

    for (const item of outline) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [contentRevision, outline]);

  return activeHeadingId;
}
