import type { DocNavLink } from "../docs/types";
import "./DocHeader.css";

interface DocHeaderProps {
  breadcrumbs: DocNavLink[];
  title: string;
  onSelect: (docId: string) => void;
}

export function DocHeader({ breadcrumbs, onSelect, title }: DocHeaderProps) {
  return (
    <nav className="od-Docs-breadcrumb" aria-label={title}>
      <ol>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={`${breadcrumb.docId}-${breadcrumb.label}`}>
              {isLast ? (
                <span aria-current="page">{breadcrumb.label}</span>
              ) : (
                <button className="od-Docs-breadcrumbAction" type="button" onClick={() => onSelect(breadcrumb.docId)}>
                  {breadcrumb.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
