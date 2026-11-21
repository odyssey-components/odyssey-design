import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { createDocHref, resolveDocLink } from "../docs/links";

interface DocLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  basePath: string;
  children?: ReactNode;
  currentDocId: string;
  docPaths: Record<string, string>;
  docRoutes: Record<string, string>;
  href?: string;
  onNavigate: (docId: string, hash?: string) => void;
}

export function DocLink({ basePath, children, currentDocId, docPaths, docRoutes, href, onNavigate, onClick, ...props }: DocLinkProps) {
  const target = href ? resolveDocLink(currentDocId, href, docRoutes) : undefined;
  const resolvedHref = target ? createDocHref(target, docPaths, basePath) : href;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    const anchor = event.currentTarget;
    if (
      event.defaultPrevented ||
      !target ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      anchor.hasAttribute("download") ||
      (anchor.target && anchor.target.toLowerCase() !== "_self")
    ) {
      return;
    }

    event.preventDefault();
    onNavigate(target.docId, target.hash);
  }

  return (
    <a {...props} href={resolvedHref} onClick={handleClick}>
      {children}
    </a>
  );
}
