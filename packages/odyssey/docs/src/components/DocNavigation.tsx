import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { NavNode } from "../docs/types";
import "./DocNavigation.css";

interface DocNavigationProps {
  activeDocId?: string;
  navTree: NavNode[];
  onSelect: (docId: string) => void;
}

function collectCategoryKeys(nodes: NavNode[]): string[] {
  return nodes.flatMap((node) => (node.type === "category" ? [node.key, ...(node.children ? collectCategoryKeys(node.children) : [])] : []));
}

function NavigationNodes({
  activeDocId,
  nodes,
  onSelect,
  openKeys,
  toggle,
}: DocNavigationProps & { nodes: NavNode[]; openKeys: string[]; toggle: (key: string) => void }) {
  return (
    <ul className="od-Docs-navigationList">
      {nodes.map((node) => {
        const expanded = node.type === "category" && openKeys.includes(node.key);
        const selected = Boolean(node.docId && node.docId === activeDocId);
        return (
          <li key={node.key} className="od-Docs-navigationItem" data-selected={selected || undefined}>
            <div className="od-Docs-navigationRow">
              {node.type === "category" ? (
                <button className="od-Docs-navigationToggle" type="button" aria-label={node.label} aria-expanded={expanded} onClick={() => toggle(node.key)}>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              ) : (
                <span className="od-Docs-navigationIndent" aria-hidden="true" />
              )}
              <button
                className="od-Docs-navigationAction"
                type="button"
                aria-current={selected ? "page" : undefined}
                onClick={() => (node.docId ? onSelect(node.docId) : toggle(node.key))}
              >
                {node.label}
              </button>
            </div>
            {node.children && expanded ? (
              <NavigationNodes activeDocId={activeDocId} navTree={nodes} nodes={node.children} onSelect={onSelect} openKeys={openKeys} toggle={toggle} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function DocNavigation({ activeDocId, navTree, onSelect }: DocNavigationProps) {
  const [openKeys, setOpenKeys] = useState(() => collectCategoryKeys(navTree));
  const toggle = (key: string) => setOpenKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  return <NavigationNodes activeDocId={activeDocId} navTree={navTree} nodes={navTree} onSelect={onSelect} openKeys={openKeys} toggle={toggle} />;
}
