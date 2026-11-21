import type { DocRecord } from "../docs/types";
import { useDocsLocale } from "../locale";
import { DocOutline } from "./DocOutline";

export interface DocsAppOutlineProps {
  activeDoc: DocRecord | undefined;
  activeHeadingId: string | undefined;
  onSelectDoc: (docId: string, hash?: string) => void;
}

export function DocsAppOutline({ activeDoc, activeHeadingId, onSelectDoc }: DocsAppOutlineProps) {
  const locale = useDocsLocale();
  return (
    <aside className="od-Docs-outline" data-od-slot="docs-outline">
      <h2>{locale.navigation.outline}</h2>
      <DocOutline activeHeadingId={activeHeadingId} onSelectHash={(hash) => activeDoc && onSelectDoc(activeDoc.id, hash)} outline={activeDoc?.outline ?? []} />
    </aside>
  );
}
