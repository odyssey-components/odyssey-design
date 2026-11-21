import type { NavNode } from "../docs/types";
import { DocNavigation } from "./DocNavigation";

export interface DocsAppSidebarProps {
  title: string;
  activeDocId?: string;
  navTree: NavNode[];
  onSelectDoc: (docId: string, hash?: string) => void;
}

export function DocsAppSidebar({ title, activeDocId, navTree, onSelectDoc }: DocsAppSidebarProps) {
  return (
    <aside className="od-Docs-sidebar" data-od-slot="docs-sidebar">
      <div className="od-Docs-sidebarTitle">
        <h2>{title}</h2>
      </div>
      <DocNavigation activeDocId={activeDocId} navTree={navTree} onSelect={onSelectDoc} />
    </aside>
  );
}
