import { Card, CardContent } from "@odyssey/ui/card";
import { IconButton } from "@odyssey/ui/icon-button";
import { Maximize2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { type PointerEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { useDocsLocale } from "../locale";
import "./Mermaid.css";

interface MermaidProps {
  chart: string;
}

const MIN_SCALE = 0.4;
const MAX_SCALE = 4;

export default function Mermaid({ chart }: MermaidProps) {
  const locale = useDocsLocale();
  const renderId = useId().replace(/:/g, "");
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ scrollLeft: number; scrollTop: number; x: number; y: number } | undefined>(undefined);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        const mermaid = await import("mermaid");
        mermaid.default.initialize({ startOnLoad: false, theme: "default" });
        const result = await mermaid.default.render(`mermaid-${renderId}`, chart);
        if (cancelled || !svgHostRef.current) return;

        const template = document.createElement("template");
        template.innerHTML = result.svg.trim();
        const svgElement = template.content.querySelector("svg");
        if (!svgElement) {
          throw new Error(locale.mermaid.missingSvg);
        }
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        svgHostRef.current.replaceChildren(svgElement);
        setError(undefined);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : locale.mermaid.renderFailed);
        }
      }
    }

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, locale.mermaid.missingSvg, locale.mermaid.renderFailed, renderId]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      event.stopPropagation();
      setScale((currentScale) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale + (event.deltaY > 0 ? -0.12 : 0.12))));
    }

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, []);

  const updateScale = useCallback((nextScale: number) => {
    setScale(Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale)));
  }, []);

  const openFullscreen = useCallback(() => {
    void viewportRef.current?.requestFullscreen();
  }, []);

  const startDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    event.preventDefault();
    event.stopPropagation();
    viewport.setPointerCapture(event.pointerId);
    dragRef.current = {
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDragging(true);
  }, []);

  const updateDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag) return;

    event.preventDefault();
    event.stopPropagation();
    viewport.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
    viewport.scrollTop = drag.scrollTop - (event.clientY - drag.y);
  }, []);

  const stopDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = undefined;
    setIsDragging(false);
  }, []);

  return (
    <Card className="od-Docs-mermaidCard">
      <CardContent>
        <div className="od-Docs-mermaidToolbar">
          <IconButton size="sm" aria-label={locale.mermaid.zoomOut} onClick={() => updateScale(scale - 0.2)}>
            <ZoomOut size={16} />
          </IconButton>
          <span className="od-Docs-secondaryText">{Math.round(scale * 100)}%</span>
          <IconButton size="sm" aria-label={locale.mermaid.zoomIn} onClick={() => updateScale(scale + 0.2)}>
            <ZoomIn size={16} />
          </IconButton>
          <IconButton size="sm" aria-label={locale.mermaid.reset} onClick={() => updateScale(1)}>
            <RotateCcw size={16} />
          </IconButton>
          <IconButton size="sm" aria-label={locale.mermaid.fullscreen} onClick={openFullscreen}>
            <Maximize2 size={16} />
          </IconButton>
        </div>
        {error ? (
          <p className="od-Docs-errorText">{error}</p>
        ) : (
          <div
            className={`od-Docs-mermaidViewport${isDragging ? " od-Docs-mermaidViewportDragging" : ""}`}
            ref={viewportRef}
            onPointerDown={startDrag}
            onPointerLeave={stopDrag}
            onPointerMove={updateDrag}
            onPointerUp={stopDrag}
          >
            <div className="od-Docs-mermaidSvg" ref={svgHostRef} style={{ transform: `scale(${scale})` }} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
