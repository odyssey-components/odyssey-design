import type { DocLinkTarget } from "./types";

export interface DocLocationState {
  docId: string;
  hash?: string;
}

export function resolveDocLink(currentDocId: string, href: string, docRoutes: Record<string, string>): DocLinkTarget | undefined {
  if (isExternalHref(href)) {
    return undefined;
  }

  const [pathPart, hash] = href.split("#");
  if (!pathPart) {
    return { docId: currentDocId, hash };
  }

  const route = normalizeRoute(resolveRoutePath(currentDocId, pathPart));
  const docId = docRoutes[route] ?? docRoutes[removeIndexSegment(route)] ?? docRoutes[`${route}/index`];
  if (!docId) {
    return undefined;
  }

  return {
    docId,
    hash,
  };
}

export function createDocHref(target: DocLinkTarget, docPaths: Record<string, string>, basePath = "/ops-docs"): string {
  const route = docPaths[target.docId] ?? target.docId;
  const path = `${normalizeBasePath(basePath)}/${route.replace(/^\/|\/$/g, "")}`;
  return target.hash ? `${path}#${target.hash}` : path;
}

export function resolveDocPath(pathname: string, docRoutes: Record<string, string>, basePath = "/ops-docs"): string | undefined {
  const route = normalizeRoute(removeBasePath(pathname, basePath));
  if (!route) {
    return undefined;
  }

  return docRoutes[route] ?? docRoutes[removeIndexSegment(route)] ?? docRoutes[`${route}/index`];
}

export function readDocLocation(
  pathname: string,
  hash: string,
  docRoutes: Record<string, string>,
  fallbackDocId: string,
  basePath = "/ops-docs",
): DocLocationState {
  return {
    docId: resolveDocPath(pathname, docRoutes, basePath) ?? fallbackDocId,
    hash: hash ? decodeURIComponent(hash.replace(/^#/, "")) : undefined,
  };
}

function resolveRoutePath(currentDocId: string, hrefPath: string): string {
  const pathWithoutQuery = hrefPath.split("?")[0] ?? hrefPath;

  if (pathWithoutQuery.startsWith("/")) {
    return pathWithoutQuery.replace(/^\/docs\//, "").replace(/^\//, "");
  }

  if (!pathWithoutQuery.startsWith(".")) {
    return pathWithoutQuery;
  }

  const currentDirectory = currentDocId.split("/").slice(0, -1);
  const segments = [...currentDirectory, ...pathWithoutQuery.split("/")];
  const resolved: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === ".") {
      continue;
    }

    if (segment === "..") {
      resolved.pop();
      continue;
    }

    resolved.push(segment);
  }

  return resolved.join("/");
}

function normalizeRoute(value: string): string {
  return removeIndexSegment(value)
    .replace(/\.(md|mdx)$/, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");
}

function removeIndexSegment(value: string): string {
  return value.replace(/\/index$/, "");
}

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}

function normalizeBasePath(basePath: string): string {
  const normalized = basePath.replace(/^\/|\/$/g, "");
  return normalized ? `/${normalized}` : "";
}

function removeBasePath(pathname: string, basePath: string): string {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!normalizedBasePath) {
    return pathname.replace(/^\//, "");
  }

  return pathname.replace(new RegExp(`^${escapeRegExp(normalizedBasePath)}\\/?`), "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
