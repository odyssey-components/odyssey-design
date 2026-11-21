/// <reference types="vite/client" />

declare module "odyssey:docs" {
  import type { DocRecord, NavbarItem, NavNode } from "@odyssey/docs/headless";
  import type { DocsConfig } from "@odyssey/docs/plugin";

  export const defaultDocId: string | undefined;
  export const docAssets: Record<string, string>;
  export const docPaths: Record<string, string>;
  export const docRoutes: Record<string, string>;
  export const docs: DocRecord[];
  export const homeDocId: string | undefined;
  export const navbar: NavbarItem[];
  export const navTree: NavNode[];
  export const siteConfig: DocsConfig & { basePath: string; docsDir: string };
}
