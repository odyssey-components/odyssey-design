import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getDocBreadcrumbs, getDocPagination } from "../docs/navigation";
import type { CategoryConfig, DocsCatalog, NavNode } from "../docs/types";
import { createDocRouteMaps, type DocMetadata } from "../vite/createDocsPlugin";
import { buildNavTree, createNavbarFromNavTree, findDefaultDocId, findHomeDocId } from "../vite/docsNavigation";
import { DocsApp } from "./DocsApp";

function doc(id: string, title: string, position = 1): DocMetadata {
  return { content: `# ${title}\n\nDocument body.`, extension: "md", frontmatter: { sidebar_position: position }, id, outline: [], path: `${id}.md`, title };
}

function catalog(docs: DocMetadata[], categories = new Map<string, CategoryConfig>()): DocsCatalog {
  const { docPaths, docRoutes } = createDocRouteMaps(docs);
  const navTree = buildNavTree(docs, categories, docRoutes);
  const navbar = createNavbarFromNavTree(navTree, {});
  const defaultDocId = findDefaultDocId(navTree, docs, navbar);
  return {
    defaultDocId,
    docAssets: {},
    docPaths,
    docRoutes,
    docs,
    homeDocId: findHomeDocId(docs, {}, defaultDocId),
    navbar,
    navTree,
    siteConfig: { basePath: "/docs", docsDir: "docs", title: "Docs" },
  };
}

describe("generated category documents", () => {
  it.each(["index", "README"])("uses a category-only %s document for navbar, default and breadcrumbs", (name) => {
    const id = `guide/${name}`;
    const built = catalog([doc(id, "Overview")]);
    expect(built.navTree[0]).toMatchObject({ children: [], docId: id, type: "category" });
    expect(built.navbar).toEqual([{ docId: id, label: "Guide", sidebarRoot: "guide" }]);
    expect(built.defaultDocId).toBe(id);
    expect(built.homeDocId).toBe(id);
    expect(getDocBreadcrumbs(built.navTree, id)).toEqual([{ docId: id, label: "Guide" }]);
    expect(getDocPagination(built.navTree, id)).toEqual({ previous: undefined, next: undefined });
  });

  it("visits the category page before its child and points child breadcrumbs back to it", () => {
    const built = catalog([doc("guide/index", "Overview"), doc("guide/start", "Start", 2)]);
    expect(getDocPagination(built.navTree, "guide/index").next?.docId).toBe("guide/start");
    expect(getDocPagination(built.navTree, "guide/start").previous?.docId).toBe("guide/index");
    expect(getDocBreadcrumbs(built.navTree, "guide/start")).toEqual([
      { docId: "guide/index", label: "Guide" },
      { docId: "guide/start", label: "Start" },
    ]);
  });

  it("honors an explicit category link resolved through a route alias", () => {
    const built = catalog(
      [doc("01-guide/03-overview", "Overview"), doc("01-guide/start", "Start", 2)],
      new Map([["01-guide", { label: "Guide", link: { type: "doc", id: "guide/overview" } }]]),
    );
    expect(built.navTree[0]?.docId).toBe("01-guide/03-overview");
    expect(built.defaultDocId).toBe("01-guide/03-overview");
    expect(getDocBreadcrumbs(built.navTree, "01-guide/start")[0]?.docId).toBe("01-guide/03-overview");
    expect(getDocPagination(built.navTree, "01-guide/03-overview").next?.docId).toBe("01-guide/start");
  });

  it("keeps link:null as a group with the index retained as a child document", () => {
    const built = catalog([doc("guide/index", "Overview"), doc("guide/start", "Start", 2)], new Map([["guide", { link: null }]]));
    expect(built.navTree[0]?.docId).toBeUndefined();
    expect(built.navTree[0]?.children?.map((node) => node.docId)).toEqual(["guide/index", "guide/start"]);
    expect(built.defaultDocId).toBe("guide/index");
    expect(getDocBreadcrumbs(built.navTree, "guide/start")[0]?.docId).toBe("guide/index");
    expect(getDocPagination(built.navTree, "guide/start").previous?.docId).toBe("guide/index");
  });

  it("retains pure grouping and explicit navbar/home choices", () => {
    const built = catalog([doc("guide/start", "Start"), doc("guide/end", "End", 2)]);
    expect(built.navTree[0]?.docId).toBeUndefined();
    expect(built.defaultDocId).toBe("guide/start");
    const explicit = [{ docId: "guide/end", label: "End", sidebarRoot: "guide" }];
    expect(createNavbarFromNavTree(built.navTree, { navbar: explicit })).toEqual(explicit);
    expect(findDefaultDocId(built.navTree, built.docs, explicit)).toBe("guide/end");
    expect(findHomeDocId(built.docs, { homeDocId: "guide/end" }, built.defaultDocId)).toBe("guide/end");
  });

  it("includes one pagination entry when an explicit category link repeats another node", () => {
    const built = catalog(
      [doc("guide/start", "Start"), doc("guide/end", "End", 2), doc("overview", "Overview", 0)],
      new Map([["guide", { link: { type: "doc", id: "overview" } }]]),
    );
    const overviewNext = getDocPagination(built.navTree, "overview").next;
    expect(overviewNext?.docId).toBe("guide/start");
    expect(getDocPagination(built.navTree, "guide/start").previous?.docId).toBe("overview");
    expect(getDocPagination(built.navTree, "guide/end").next).toBeUndefined();
    const duplicated: NavNode[] = [{ key: "group", label: "Group", order: 0, type: "category", docId: "overview", children: built.navTree }];
    expect(getDocPagination(duplicated, "overview").next?.docId).toBe("guide/start");
  });
});

describe("DocsApp consumes generated category documents", () => {
  const scrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
  });
  afterAll(() => {
    if (scrollTo) Object.defineProperty(HTMLElement.prototype, "scrollTo", scrollTo);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
  });
  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    window.history.replaceState(null, "", "/");
  });

  it("opens a category-only default page rather than an empty document", () => {
    const built = catalog([doc("guide/index", "Overview")]);
    window.history.replaceState(null, "", "/docs");
    render(<DocsApp catalog={built} />);
    expect(screen.getByRole("heading", { name: "Overview", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Overview" })).toHaveTextContent("Guide");
  });

  it("navigates from category to child, back through the category breadcrumb, and previous-page control", async () => {
    const built = catalog([doc("guide/index", "Overview"), doc("guide/start", "Start", 2)]);
    window.history.replaceState(null, "", "/docs/guide");
    const user = userEvent.setup();
    const { container } = render(<DocsApp catalog={built} />);
    expect(screen.getByRole("navigation", { name: "Overview" })).toHaveTextContent("Guide");
    const pager = () => {
      const element = container.querySelector<HTMLElement>(".od-Docs-pagination");
      if (!element) throw new Error("Generated category pagination was not rendered");
      return within(element);
    };
    await user.click(pager().getByRole("button", { name: /Start/ }));
    expect(await screen.findByRole("heading", { name: "Start", level: 1 })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/docs/guide/start");
    await user.click(within(screen.getByRole("navigation", { name: "Start" })).getByRole("button", { name: "Guide" }));
    expect(await screen.findByRole("heading", { name: "Overview", level: 1 })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/docs/guide/index");
    await user.click(pager().getByRole("button", { name: /Start/ }));
    await user.click(pager().getByRole("button", { name: /Guide/ }));
    expect(await screen.findByRole("heading", { name: "Overview", level: 1 })).toBeInTheDocument();
  });
});
