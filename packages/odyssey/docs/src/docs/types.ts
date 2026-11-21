import type { ComponentType } from "react";

export interface CategoryConfig {
  label?: string;
  link?: CategoryLink | null;
  position?: number;
}

export interface CategoryLink {
  id: string;
  type: "doc";
}

export interface Frontmatter {
  sidebar_position?: number;
  sidebar_label?: string;
  slug?: string;
  title?: string;
}

export interface OutlineItem {
  depth: number;
  id: string;
  text: string;
}

export interface DocRecord {
  content: string;
  extension: "md" | "mdx";
  frontmatter: Frontmatter;
  id: string;
  loader?: () => Promise<{ default: ComponentType }>;
  outline: OutlineItem[];
  path: string;
  title: string;
}

export interface DocsCatalog {
  defaultDocId: string | undefined;
  docAssets: Record<string, string>;
  docPaths: Record<string, string>;
  docRoutes: Record<string, string>;
  docs: DocRecord[];
  homeDocId?: string;
  navbar: NavbarItem[];
  navTree: NavNode[];
  siteConfig: { basePath: string; docsDir: string; subtitle?: string; title: string };
}

export interface DocLinkTarget {
  docId: string;
  hash?: string;
}

export interface DocNavLink {
  docId: string;
  label: string;
}

export interface DocPagination {
  next?: DocNavLink;
  previous?: DocNavLink;
}

export interface NavbarItem {
  docId: string;
  label: string;
  sidebarRoot: string;
}

export interface NavNode {
  children?: NavNode[];
  docId?: string;
  key: string;
  label: string;
  order: number;
  type: "category" | "doc";
}
