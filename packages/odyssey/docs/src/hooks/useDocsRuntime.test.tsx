import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DocsCatalog } from "../docs/types";
import { useDocsRuntime } from "./useDocsRuntime";

const catalog: DocsCatalog = {
  defaultDocId: "guide/index",
  docAssets: {},
  docPaths: { "guide/index": "guide", "guide/next": "guide/next" },
  docRoutes: { guide: "guide/index", "guide/next": "guide/next" },
  docs: [
    { content: "", extension: "md", frontmatter: {}, id: "guide/index", outline: [], path: "guide/index.md", title: "Guide" },
    { content: "", extension: "md", frontmatter: {}, id: "guide/next", outline: [], path: "guide/next.md", title: "Next" },
  ],
  navbar: [{ docId: "guide/index", label: "Guide", sidebarRoot: "guide" }],
  navTree: [
    {
      key: "guide",
      label: "Guide",
      order: 0,
      type: "category",
      children: [
        { docId: "guide/index", key: "guide/index", label: "Guide", order: 0, type: "doc" },
        { docId: "guide/next", key: "guide/next", label: "Next", order: 1, type: "doc" },
      ],
    },
  ],
  siteConfig: { basePath: "/", docsDir: "docs", title: "Docs" },
};

describe("useDocsRuntime", () => {
  it("derives navigation state and updates browser history", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.history.replaceState(null, "", "/guide");
    const { result } = renderHook(() => useDocsRuntime(catalog));
    expect(result.current.activeDocId).toBe("guide/index");
    expect(result.current.pagination.next?.docId).toBe("guide/next");

    act(() => result.current.selectDoc("guide/next"));
    expect(window.location.pathname).toBe("/guide/next");
    expect(result.current.activeDocId).toBe("guide/next");
    expect(result.current.pagination.previous?.docId).toBe("guide/index");
  });

  it("ignores unknown document ids", () => {
    window.history.replaceState(null, "", "/guide");
    const { result } = renderHook(() => useDocsRuntime(catalog));
    act(() => result.current.selectDoc("missing"));
    expect(result.current.activeDocId).toBe("guide/index");
  });
});
