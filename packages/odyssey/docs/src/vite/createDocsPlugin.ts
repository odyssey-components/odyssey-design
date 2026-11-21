/// <reference path="../types/github-slugger.d.ts" />

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mdx from "@mdx-js/rollup";
import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { toString as mdastToString } from "mdast-util-to-string";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Plugin } from "vite";
import {
  buildNavTree,
  createNavbarFromNavTree,
  findDefaultDocId,
  findHomeDocId,
  humanizeSegment,
  isInsideDirectory,
  isRecord,
  type NormalizedDocsConfig,
  normalizeCategory,
  normalizeDocsConfig,
  normalizeFrontmatter,
  normalizeRoute,
  removeExtension,
  removeIndexSegment,
  stripNumericPrefixes,
  toDocsPath,
} from "./docsNavigation.ts";

export { createHomeDocIdForTests, createNavbarFromNavTree, createNavTreeForTests } from "./docsNavigation.ts";

import { normalizePath } from "vite";

const virtualModuleId = "odyssey:docs";
const resolvedVirtualModuleId = `\0${virtualModuleId}`;

interface DocsPluginOptions {
  config: DocsConfig;
  docsRoot: string;
}

export interface DocsConfig {
  basePath?: string;
  docsDir?: string;
  homeDocId?: string;
  navbar?: NavbarItem[];
  navbarRoot?: string;
  subtitle?: string;
  title: string;
}

export interface NavbarItem {
  docId: string;
  label: string;
  sidebarRoot: string;
}

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

interface OutlineItem {
  depth: number;
  id: string;
  text: string;
}

interface HeadingNode {
  depth: number;
  type: "heading";
}

export interface DocMetadata {
  content: string;
  extension: "md" | "mdx";
  frontmatter: Frontmatter;
  id: string;
  outline: OutlineItem[];
  path: string;
  title: string;
}

export interface NavNode {
  children?: NavNode[];
  docId?: string;
  key: string;
  label: string;
  order: number;
  type: "category" | "doc";
}

interface SourceDocument {
  absolutePath: string;
  metadata: DocMetadata;
}

interface SourceAsset {
  absolutePath: string;
  key: string;
}

export function defineDocsConfig(config: DocsConfig): DocsConfig {
  return config;
}

export function createDocsPlugin(options: DocsPluginOptions): Plugin[] {
  return [createDocsVirtualModulePlugin(options), createMdxPlugin()];
}

function createDocsVirtualModulePlugin(options: DocsPluginOptions): Plugin {
  const docsRoot = path.resolve(options.docsRoot);
  const config = normalizeDocsConfig(options.config);

  return {
    enforce: "pre",
    name: "odyssey-docs",
    configureServer(server) {
      server.watcher.add(docsRoot);
      server.watcher.on("all", (_event, file) => {
        if (!isInsideDirectory(file, docsRoot)) {
          return;
        }

        const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: "full-reload" });
      });
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return undefined;
      }

      return createVirtualModule(docsRoot, config);
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }

      return undefined;
    },
  };
}

function createMdxPlugin(): Plugin {
  return mdx({
    include: /\.mdx$/,
    providerImportSource: "@odyssey/docs/mdx-runtime",
    rehypePlugins: [rehypeSlug, rehypeKatex],
    remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
  }) as Plugin;
}

async function createVirtualModule(docsRoot: string, config: NormalizedDocsConfig): Promise<string> {
  const files = await walk(docsRoot);
  const categories = await readCategories(files, docsRoot);
  const documents = await readDocuments(files, docsRoot);
  const assets = readAssets(files, docsRoot, documents);
  const docMetadata = documents.map((document) => document.metadata);
  const { docPaths, docRoutes } = createDocRouteMaps(docMetadata);
  const navTree = buildNavTree(docMetadata, categories, docRoutes);
  const navbar = createNavbarFromNavTree(navTree, config);
  const defaultDocId = findDefaultDocId(navTree, docMetadata, navbar);
  const homeDocId = findHomeDocId(docMetadata, config, defaultDocId);
  const mdxDocuments = documents.filter((document) => document.metadata.extension === "mdx");

  const mdxLoaderEntries = mdxDocuments.map((document) => {
    const id = JSON.stringify(document.metadata.id);
    const importPath = JSON.stringify(`/@fs/${normalizePath(document.absolutePath)}`);
    return `${id}: () => import(${importPath})`;
  });
  const assetImportEntries = assets.map((asset, index) => {
    const importPath = JSON.stringify(`/@fs/${normalizePath(asset.absolutePath)}`);
    return `import asset${index} from ${importPath};`;
  });
  const assetMapEntries = assets.map((asset, index) => `  ${JSON.stringify(asset.key)}: asset${index}`);

  const metadata = JSON.stringify(
    documents.map((document) => document.metadata),
    null,
    2,
  );

  return `
${assetImportEntries.join("\n")}

const mdxLoaders = {
${mdxLoaderEntries.map((entry) => `  ${entry}`).join(",\n")}
};

export const docs = ${metadata}.map((doc) => ({
  ...doc,
  loader: doc.extension === "mdx" ? mdxLoaders[doc.id] : undefined
}));

export const docRoutes = ${JSON.stringify(docRoutes, null, 2)};

export const docPaths = ${JSON.stringify(docPaths, null, 2)};

export const docAssets = {
${assetMapEntries.join(",\n")}
};

export const navTree = ${JSON.stringify(navTree, null, 2)};

export const navbar = ${JSON.stringify(navbar, null, 2)};

export const defaultDocId = ${JSON.stringify(defaultDocId)};

export const homeDocId = ${JSON.stringify(homeDocId)};

export const siteConfig = ${JSON.stringify(config, null, 2)};
`;
}

export function createDocRoutes(docs: DocMetadata[]): Record<string, string> {
  return createDocRouteMaps(docs).docRoutes;
}

export function createDocRouteMaps(docs: DocMetadata[]): { docPaths: Record<string, string>; docRoutes: Record<string, string> } {
  const docPaths: Record<string, string> = {};
  const routes: Record<string, string> = {};

  for (const doc of docs) {
    const directory = doc.id.split("/").slice(0, -1).join("/");
    const cleanDirectory = stripNumericPrefixes(directory);
    const routeCandidates =
      doc.frontmatter.slug === "./"
        ? [cleanDirectory, directory, removeIndexSegment(stripNumericPrefixes(doc.id)), removeIndexSegment(doc.id), stripNumericPrefixes(doc.id), doc.id]
        : [stripNumericPrefixes(doc.id), doc.id, removeIndexSegment(stripNumericPrefixes(doc.id)), removeIndexSegment(doc.id)];

    if (doc.frontmatter.slug === "./") {
      routeCandidates.push(directory, cleanDirectory);
    }

    const canonicalRoute = routeCandidates.map(normalizeRoute).find(Boolean);
    if (canonicalRoute) {
      docPaths[doc.id] = canonicalRoute;
    }

    for (const candidate of routeCandidates) {
      const normalized = normalizeRoute(candidate);
      if (normalized) {
        routes[normalized] = doc.id;
      }
    }
  }

  return { docPaths, docRoutes: routes };
}

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

async function readCategories(files: string[], docsRoot: string): Promise<Map<string, CategoryConfig>> {
  const categories = new Map<string, CategoryConfig>();

  for (const file of files) {
    if (!file.endsWith("_category_.json")) {
      continue;
    }

    const relativePath = toDocsPath(docsRoot, file);
    const directoryPath = path.posix.dirname(relativePath);
    const key = directoryPath === "." ? "" : directoryPath;
    categories.set(key, normalizeCategory(JSON.parse(await readFile(file, "utf8"))));
  }

  return categories;
}

async function readDocuments(files: string[], docsRoot: string): Promise<SourceDocument[]> {
  const documents: SourceDocument[] = [];

  for (const file of files) {
    if (!/\.(md|mdx)$/.test(file)) {
      continue;
    }

    const relativePath = toDocsPath(docsRoot, file);
    const source = await readFile(file, "utf8");
    documents.push({
      absolutePath: file,
      metadata: createDocMetadata(relativePath, source),
    });
  }

  return documents.sort((a, b) => a.metadata.id.localeCompare(b.metadata.id));
}

function readAssets(files: string[], docsRoot: string, documents: SourceDocument[]): SourceAsset[] {
  const referencedAssetKeys = new Set(documents.flatMap((document) => extractReferencedAssetKeys(document.metadata)));
  return files
    .filter((file) => !/\.(md|mdx)$/.test(file) && !file.endsWith("_category_.json"))
    .map((file) => ({
      absolutePath: file,
      key: toDocsPath(docsRoot, file),
    }))
    .filter((asset) => referencedAssetKeys.has(asset.key))
    .sort((a, b) => a.key.localeCompare(b.key));
}

function extractReferencedAssetKeys(doc: DocMetadata): string[] {
  const assetHrefs = [
    ...Array.from(doc.content.matchAll(/!\[[^\]]*]\((?<href>[^)\s]+)(?:\s+"[^"]*")?\)/g)).map((match) => match.groups?.href),
    ...Array.from(doc.content.matchAll(/<img\b[^>]*\bsrc=["'](?<href>[^"']+)["'][^>]*>/gi)).map((match) => match.groups?.href),
  ].filter((href): href is string => typeof href === "string" && href.length > 0 && !isExternalAssetHref(href));

  return assetHrefs.map((href) => resolveAssetKey(doc.path, href));
}

function resolveAssetKey(docPath: string, href: string): string {
  const currentDirectory = docPath.split("/").slice(0, -1);
  const resolvedParts: string[] = [];
  const pathWithoutHash = href.split("#")[0]?.split("?")[0] ?? href;

  for (const part of [...currentDirectory, ...pathWithoutHash.split("/")]) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      resolvedParts.pop();
      continue;
    }

    resolvedParts.push(part);
  }

  return resolvedParts.join("/");
}

function isExternalAssetHref(href: string): boolean {
  return /^(https?:|data:|blob:|\/)/.test(href);
}

function createDocMetadata(relativePath: string, source: string): DocMetadata {
  const id = removeExtension(relativePath);
  const { content, data } = readFrontmatter(source);
  const extension: "md" | "mdx" = relativePath.endsWith(".mdx") ? "mdx" : "md";
  const fallbackTitle = humanizeSegment(id.split("/").at(-1) ?? id);
  const title = data.title ?? data.sidebar_label ?? titleFromMarkdown(content, fallbackTitle, extension);

  return {
    content,
    extension,
    frontmatter: data,
    id,
    outline: extractOutline(content, extension),
    path: relativePath,
    title,
  };
}

function readFrontmatter(source: string): { content: string; data: Frontmatter } {
  const parsed = matter(source);
  return { content: parsed.content, data: normalizeFrontmatter(parsed.data) };
}

function extractOutline(markdown: string, extension: "md" | "mdx" = "md"): OutlineItem[] {
  const processor = unified().use(remarkParse).use(remarkMath);
  if (extension === "mdx") {
    processor.use(remarkMdx);
  }
  const tree = processor.parse(markdown);
  const slugger = new GithubSlugger();
  const outline: OutlineItem[] = [];
  type MdastToStringInput = Parameters<typeof mdastToString>[0];

  visit(tree, "heading", (node) => {
    if (!isHeadingNode(node)) {
      return;
    }

    const text = mdastToString(node as MdastToStringInput).trim();
    if (!text) {
      return;
    }

    outline.push({
      depth: node.depth,
      id: slugger.slug(text),
      text,
    });
  });

  return outline;
}

function isHeadingNode(value: unknown): value is HeadingNode {
  return isRecord(value) && value.type === "heading" && typeof value.depth === "number";
}

function titleFromMarkdown(markdown: string, fallback: string, extension: "md" | "mdx" = "md"): string {
  const firstHeading = extractOutline(markdown, extension).find((heading) => heading.depth === 1);
  return firstHeading?.text ?? fallback;
}
