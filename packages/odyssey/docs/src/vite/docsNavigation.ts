import path from "node:path";
import { normalizePath } from "vite";
import type { CategoryConfig, CategoryLink, DocMetadata, DocsConfig, Frontmatter, NavbarItem, NavNode } from "./createDocsPlugin.ts";
import { createDocRoutes } from "./createDocsPlugin.ts";

export function buildNavTree(docs: DocMetadata[], categories: Map<string, CategoryConfig>, docRoutes: Record<string, string>): NavNode[] {
  const root: NavNode[] = [];
  const directoryNodes = new Map<string, NavNode>();
  const docIds = new Set(docs.map((doc) => doc.id));
  const categoryIndexDocIds = findCategoryIndexDocIds(docs, categories);

  function getLevelNodes(parentPath: string): NavNode[] {
    if (!parentPath) return root;
    const parent = directoryNodes.get(parentPath);
    if (!parent) return root;
    parent.children ??= [];
    return parent.children;
  }

  for (const doc of docs) {
    const parts = removeExtension(doc.path).split("/");
    const fileName = parts.at(-1) ?? doc.id;
    let parentPath = "";

    for (const segment of parts.slice(0, -1)) {
      const currentPath = parentPath ? `${parentPath}/${segment}` : segment;
      if (!directoryNodes.has(currentPath)) {
        const node = createDirectoryNode(currentPath, categories, docIds, docRoutes, categoryIndexDocIds);
        directoryNodes.set(currentPath, node);
        getLevelNodes(parentPath).push(node);
      }
      parentPath = currentPath;
    }

    const parentCategory = parentPath ? directoryNodes.get(parentPath) : undefined;
    if (parentCategory?.docId === doc.id) {
      continue;
    }

    getLevelNodes(parentPath).push({
      docId: doc.id,
      key: doc.id,
      label: doc.frontmatter.sidebar_label ?? doc.title,
      order: doc.frontmatter.sidebar_position ?? pathOrder(fileName),
      type: "doc",
    });
  }

  return sortTree(root);
}

export function createDirectoryNode(
  directoryPath: string,
  categories: Map<string, CategoryConfig>,
  docIds: Set<string>,
  docRoutes: Record<string, string>,
  categoryIndexDocIds: Map<string, string>,
): NavNode {
  const segment = directoryPath.split("/").at(-1) ?? directoryPath;
  const category = categories.get(directoryPath);

  return {
    children: [],
    docId: resolveCategoryDocId(directoryPath, category, docIds, docRoutes, categoryIndexDocIds),
    key: directoryPath,
    label: category?.label ?? humanizeSegment(segment),
    order: category?.position ?? pathOrder(segment),
    type: "category",
  };
}

export function findCategoryIndexDocIds(docs: DocMetadata[], categories: Map<string, CategoryConfig>): Map<string, string> {
  const indexDocIds = new Map<string, string>();

  for (const doc of docs) {
    const directory = doc.id.split("/").slice(0, -1).join("/");
    if (!directory) {
      continue;
    }

    const category = categories.get(directory);
    if (category?.link !== undefined) {
      continue;
    }

    const fileName = doc.id.split("/").at(-1)?.toLowerCase();
    if (fileName === "index" || fileName === "readme") {
      indexDocIds.set(directory, doc.id);
    }
  }

  return indexDocIds;
}

export function sortTree(nodes: NavNode[]): NavNode[] {
  return nodes.sort(nodeSort).map((node) => ({
    ...node,
    children: node.children ? sortTree(node.children) : undefined,
  }));
}

export function nodeSort(a: NavNode, b: NavNode): number {
  if (a.order !== b.order) return a.order - b.order;
  if (a.type !== b.type) return a.type === "category" ? -1 : 1;
  return a.label.localeCompare(b.label, "zh-Hans-CN");
}

export function findDefaultDocId(docsTree: NavNode[], docs: DocMetadata[], navbar: NavbarItem[]): string | undefined {
  const docIds = new Set(docs.map((doc) => doc.id));
  const navbarDocId = navbar.find((item) => docIds.has(item.docId))?.docId;
  return navbarDocId ?? findFirstDocId(docsTree);
}

export function findHomeDocId(docs: DocMetadata[], config: Pick<DocsConfig, "homeDocId">, defaultDocId?: string): string | undefined {
  const docIds = new Set(docs.map((doc) => doc.id));
  if (config.homeDocId && docIds.has(config.homeDocId)) {
    return config.homeDocId;
  }

  return docs.find((doc) => isRootHomeDoc(doc.id))?.id ?? defaultDocId;
}

export function isRootHomeDoc(docId: string): boolean {
  const normalized = docId.toLowerCase();
  return normalized === "index" || normalized === "readme";
}

export function createNavbarFromNavTree(navTree: NavNode[], config: Pick<DocsConfig, "navbar" | "navbarRoot">): NavbarItem[] {
  const configuredNavbar = normalizeNavbar(config.navbar);
  if (configuredNavbar.length > 0) {
    return configuredNavbar;
  }

  const rootNodes = config.navbarRoot ? findNavbarRootNodes(navTree, config.navbarRoot) : navTree;

  return rootNodes.flatMap((node) => {
    const docId = node.docId ?? findFirstDocId(node.children ?? []);
    if (!docId) {
      return [];
    }

    return [
      {
        docId,
        label: node.label,
        sidebarRoot: node.key,
      },
    ];
  });
}

export function findNavbarRootNodes(navTree: NavNode[], navbarRoot: string): NavNode[] {
  const rootNode = findNodeByKey(navTree, navbarRoot);
  if (!rootNode) {
    return navTree;
  }

  if (rootNode.type === "doc") {
    return [rootNode];
  }

  return rootNode.children ?? [];
}

export function findNodeByKey(nodes: NavNode[], key: string): NavNode | undefined {
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

export function findFirstDocId(nodes: NavNode[]): string | undefined {
  for (const node of nodes) {
    if (node.docId) {
      return node.docId;
    }

    const childDocId = node.children ? findFirstDocId(node.children) : undefined;
    if (childDocId) {
      return childDocId;
    }
  }

  return undefined;
}

export function normalizeNavbar(value: unknown): NavbarItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    if (typeof item.label !== "string" || typeof item.docId !== "string" || typeof item.sidebarRoot !== "string") {
      return [];
    }

    return [
      {
        docId: item.docId,
        label: item.label,
        sidebarRoot: item.sidebarRoot,
      },
    ];
  });
}

export function normalizeCategory(value: unknown): CategoryConfig {
  if (!isRecord(value)) {
    return {};
  }

  return {
    label: typeof value.label === "string" ? value.label : undefined,
    link: normalizeCategoryLink(value.link),
    position: typeof value.position === "number" ? value.position : undefined,
  };
}

export function resolveCategoryDocId(
  directoryPath: string,
  category: CategoryConfig | undefined,
  docIds: Set<string>,
  docRoutes: Record<string, string>,
  categoryIndexDocIds: Map<string, string>,
): string | undefined {
  if (category?.link === null) {
    return undefined;
  }

  if (category?.link) {
    if (docIds.has(category.link.id)) {
      return category.link.id;
    }

    return docRoutes[normalizeRoute(category.link.id)];
  }

  return categoryIndexDocIds.get(directoryPath);
}

export function normalizeCategoryLink(value: unknown): CategoryLink | null | undefined {
  if (value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  if (value.type !== "doc" || typeof value.id !== "string") {
    return undefined;
  }

  return {
    id: value.id,
    type: "doc",
  };
}

export function normalizeFrontmatter(value: unknown): Frontmatter {
  if (!isRecord(value)) {
    return {};
  }

  return {
    sidebar_label: typeof value.sidebar_label === "string" ? value.sidebar_label : undefined,
    sidebar_position: typeof value.sidebar_position === "number" ? value.sidebar_position : undefined,
    slug: typeof value.slug === "string" ? value.slug : undefined,
    title: typeof value.title === "string" ? value.title : undefined,
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function removeExtension(value: string): string {
  return value.replace(/\.(md|mdx)$/, "");
}

export function stripNumericPrefixes(value: string): string {
  return value
    .split("/")
    .map((segment) => segment.replace(/^\d+[-_]/, ""))
    .join("/");
}

export function removeIndexSegment(value: string): string {
  return value.replace(/\/index$/, "");
}

export function normalizeRoute(value: string): string {
  return removeExtension(value)
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");
}

export function humanizeSegment(segment: string): string {
  return segment
    .replace(/^\d+[-_]/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function pathOrder(segment: string): number {
  const match = /^(\d+)[-_]/.exec(segment);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export function toDocsPath(docsRoot: string, file: string): string {
  return normalizePath(path.relative(docsRoot, file));
}

export function isInsideDirectory(file: string, directory: string): boolean {
  const relativePath = path.relative(directory, file);
  return Boolean(relativePath) && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

export interface NormalizedDocsConfig extends DocsConfig {
  basePath: string;
  docsDir: string;
}

export function normalizeDocsConfig(config: DocsConfig): NormalizedDocsConfig {
  return {
    ...config,
    basePath: normalizeBasePath(config.basePath ?? ""),
    docsDir: config.docsDir ?? "docs",
  };
}

export function normalizeBasePath(basePath: string): string {
  const normalized = basePath.replace(/^\/|\/$/g, "");
  return normalized ? `/${normalized}` : "";
}

export function createNavTreeForTests(docs: DocMetadata[], categories: Map<string, CategoryConfig>): NavNode[] {
  return buildNavTree(docs, categories, createDocRoutes(docs));
}

export function createHomeDocIdForTests(docs: DocMetadata[], config: Pick<DocsConfig, "homeDocId" | "title">): string | undefined {
  const navTree = buildNavTree(docs, new Map(), createDocRoutes(docs));
  const defaultDocId = findDefaultDocId(navTree, docs, createNavbarFromNavTree(navTree, {}));
  return findHomeDocId(docs, config, defaultDocId);
}
