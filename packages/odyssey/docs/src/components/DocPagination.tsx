import { Button } from "@odyssey/ui/button";
import type { DocPagination as DocPaginationData } from "../docs/types";
import { useDocsLocale } from "../locale";
import "./DocPagination.css";

interface DocPaginationProps {
  pagination: DocPaginationData;
  onSelect: (docId: string) => void;
}

export function DocPagination({ pagination, onSelect }: DocPaginationProps) {
  const locale = useDocsLocale();
  if (!pagination.previous && !pagination.next) {
    return null;
  }

  return (
    <nav aria-label={locale.pagination.label} className="od-Docs-pagination">
      {pagination.previous && (
        <Button className="od-Docs-pageLink od-Docs-pageLinkPrevious" type="button" onClick={() => onSelect(pagination.previous?.docId ?? "")}>
          <span className="od-Docs-secondaryText">{locale.pagination.previous}</span>
          <span>{pagination.previous.label}</span>
        </Button>
      )}
      {pagination.next && (
        <Button className="od-Docs-pageLink od-Docs-pageLinkNext" type="button" onClick={() => onSelect(pagination.next?.docId ?? "")}>
          <span className="od-Docs-secondaryText">{locale.pagination.next}</span>
          <span>{pagination.next.label}</span>
        </Button>
      )}
    </nav>
  );
}
