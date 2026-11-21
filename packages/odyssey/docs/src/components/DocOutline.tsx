import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipTrigger } from "@odyssey/ui/tooltip";
import { useLayoutEffect, useRef, useState } from "react";
import type { OutlineItem } from "../docs/types";
import { useDocsLocale } from "../locale";
import "./DocOutline.css";

interface DocOutlineProps {
  activeHeadingId?: string;
  onSelectHash?: (hash: string) => void;
  outline: OutlineItem[];
}

function OutlineLink({ item, activeHeadingId, onSelectHash }: { item: OutlineItem; activeHeadingId?: string; onSelectHash?: (hash: string) => void }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const element = linkRef.current;
    if (element) setOverflows(element.scrollWidth > element.clientWidth);
  }, []);
  const link = (
    <a
      ref={linkRef}
      aria-current={item.id === activeHeadingId ? "true" : undefined}
      className="od-Docs-outlineLink"
      href={`#${item.id}`}
      onClick={(event) => {
        if (!onSelectHash) return;
        event.preventDefault();
        onSelectHash(item.id);
      }}
    >
      {item.text}
    </a>
  );
  if (!overflows) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipPortal>
        <TooltipPositioner>
          <TooltipContent>{item.text}</TooltipContent>
        </TooltipPositioner>
      </TooltipPortal>
    </Tooltip>
  );
}

export function DocOutline({ activeHeadingId, onSelectHash, outline }: DocOutlineProps) {
  const locale = useDocsLocale();
  if (outline.length === 0) return <p className="od-Docs-secondaryText">{locale.navigation.emptyOutline}</p>;
  return (
    <ul className="od-Docs-outlineList">
      {outline.map((item) => (
        <li key={item.id} className="od-Docs-outlineItem" data-depth={item.depth}>
          <OutlineLink item={item} activeHeadingId={activeHeadingId} onSelectHash={onSelectHash} />
        </li>
      ))}
    </ul>
  );
}
