import type { DocNavLink, DocPagination, NavbarItem, NavNode } from "./types";

export function findNavbarItemForDoc(navbar: NavbarItem[], docId?: string): NavbarItem | undefined {
  if (!docId) {
    return navbar[0];
  }

  const matches = navbar.filter((item) => docId === item.docId || docId.startsWith(`${item.sidebarRoot}/`));
  return matches.sort((a, b) => b.sidebarRoot.length - a.sidebarRoot.length)[0] ?? navbar[0];
}

export function getSidebarTreeForNavbarItem(navTree: NavNode[], item?: NavbarItem): NavNode[] {
  if (!item) {
    return navTree;
  }

  const rootNode = findNodeByKey(navTree, item.sidebarRoot);
  if (!rootNode) {
    return navTree;
  }

  if (rootNode.type === "doc") {
    return [rootNode];
  }

  return rootNode.children ?? [];
}

export function getDocPagination(navTree: NavNode[], docId?: string): DocPagination {
  const links = flattenDocLinks(navTree);
  const index = docId ? links.findIndex((link) => link.docId === docId) : -1;

  if (index < 0) {
    return {};
  }

  return {
    next: links[index + 1],
    previous: links[index - 1],
  };
}

export function getDocBreadcrumbs(navTree: NavNode[], docId?: string): DocNavLink[] {
  if (!docId) {
    return [];
  }

  const path = findNodePath(navTree, docId);
  return path.map((node) => ({
    docId: node.docId ?? (node.type === "doc" ? node.key : (findFirstDocLink(node.children ?? [])?.docId ?? node.key)),
    label: node.label,
  }));
}

function flattenDocLinks(nodes: NavNode[], seen = new Set<string>()): DocNavLink[] {
  return nodes.flatMap((node) => {
    const docId = node.docId ?? (node.type === "doc" ? node.key : undefined);
    const ownLink: DocNavLink[] = [];
    if (docId && !seen.has(docId)) {
      seen.add(docId);
      ownLink.push({ docId, label: node.label });
    }
    return node.type === "doc" ? ownLink : [...ownLink, ...flattenDocLinks(node.children ?? [], seen)];
  });
}

function findFirstDocLink(nodes: NavNode[]): DocNavLink | undefined {
  return flattenDocLinks(nodes)[0];
}

function findNodeByKey(nodes: NavNode[], key: string): NavNode | undefined {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }

    const child = node.children ? findNodeByKey(node.children, key) : undefined;
    if (child) {
      return child;
    }
  }

  return undefined;
}

function findNodePath(nodes: NavNode[], docId: string, path: NavNode[] = []): NavNode[] {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.docId === docId) {
      return nextPath;
    }

    const childPath = node.children ? findNodePath(node.children, docId, nextPath) : [];
    if (childPath.length > 0) {
      return childPath;
    }
  }

  return [];
}
