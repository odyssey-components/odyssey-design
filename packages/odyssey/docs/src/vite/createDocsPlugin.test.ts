import { describe, expect, it } from "vitest";
import { createDocRoutes, createDocsPlugin, createHomeDocIdForTests, createNavbarFromNavTree, createNavTreeForTests } from "./createDocsPlugin";

describe("createDocsPlugin", () => {
  it("bundles the docs virtual module plugin with the MDX transform plugin", () => {
    const plugins = createDocsPlugin({
      config: { title: "Docs" },
      docsRoot: "/docs",
    });

    expect(Array.isArray(plugins)).toBe(true);
    expect(plugins.map((plugin) => plugin && "name" in plugin && plugin.name)).toContain("odyssey-docs");
    expect(plugins.map((plugin) => plugin && "name" in plugin && plugin.name)).toContain("@mdx-js/rollup");
  });
});

describe("createDocsPlugin navbar", () => {
  it("creates first-level navbar items from the configured docs root", () => {
    const navbar = createNavbarFromNavTree(
      [
        {
          children: [
            {
              docId: "byproduct/intro",
              key: "byproduct/intro",
              label: "产品概述",
              order: 0,
              type: "doc",
            },
            {
              children: [
                {
                  docId: "byproduct/02-product-requirements/algorithm-requirements",
                  key: "byproduct/02-product-requirements/algorithm-requirements",
                  label: "算法需求",
                  order: 1,
                  type: "doc",
                },
              ],
              key: "byproduct/02-product-requirements",
              label: "产品需求",
              order: 2,
              type: "category",
            },
          ],
          key: "byproduct",
          label: "副产品文档",
          order: 1,
          type: "category",
        },
      ],
      { navbarRoot: "byproduct" },
    );

    expect(navbar).toEqual([
      {
        docId: "byproduct/intro",
        label: "产品概述",
        sidebarRoot: "byproduct/intro",
      },
      {
        docId: "byproduct/02-product-requirements/algorithm-requirements",
        label: "产品需求",
        sidebarRoot: "byproduct/02-product-requirements",
      },
    ]);
  });
});

describe("createDocsPlugin home doc", () => {
  it("uses the configured home doc id when it matches a document", () => {
    expect(
      createHomeDocIdForTests(
        [
          {
            content: "",
            extension: "md",
            frontmatter: {},
            id: "docs/index",
            outline: [],
            path: "docs/index.md",
            title: "Docs Home",
          },
        ],
        {
          homeDocId: "docs/index",
          title: "Docs",
        },
      ),
    ).toBe("docs/index");
  });

  it("detects root index and README documents as the site home", () => {
    expect(
      createHomeDocIdForTests(
        [
          {
            content: "",
            extension: "md",
            frontmatter: {},
            id: "README",
            outline: [],
            path: "README.md",
            title: "Docs Home",
          },
          {
            content: "",
            extension: "md",
            frontmatter: {},
            id: "guide/overview",
            outline: [],
            path: "guide/overview.md",
            title: "Overview",
          },
        ],
        { title: "Docs" },
      ),
    ).toBe("README");
  });

  it("falls back to the default doc when no home document is detected", () => {
    expect(
      createHomeDocIdForTests(
        [
          {
            content: "",
            extension: "md",
            frontmatter: {},
            id: "guide/overview",
            outline: [],
            path: "guide/overview.md",
            title: "Overview",
          },
        ],
        { title: "Docs" },
      ),
    ).toBe("guide/overview");
  });
});

describe("createDocsPlugin nav tree", () => {
  it("binds Docusaurus category links to category nodes and hides duplicate direct child docs", () => {
    const navTree = createNavTreeForTests(
      [
        {
          content: "",
          extension: "md",
          frontmatter: { sidebar_position: 0 },
          id: "guide/index",
          outline: [],
          path: "guide/index.md",
          title: "Guide Overview",
        },
        {
          content: "",
          extension: "md",
          frontmatter: { sidebar_position: 1 },
          id: "guide/details",
          outline: [],
          path: "guide/details.md",
          title: "Details",
        },
      ],
      new Map([
        [
          "guide",
          {
            label: "Guide",
            link: {
              id: "guide/index",
              type: "doc",
            },
            position: 1,
          },
        ],
      ]),
    );

    expect(navTree).toEqual([
      {
        children: [
          {
            docId: "guide/details",
            key: "guide/details",
            label: "Details",
            order: 1,
            type: "doc",
          },
        ],
        docId: "guide/index",
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ]);
  });

  it("resolves category link ids through generated route aliases", () => {
    const navTree = createNavTreeForTests(
      [
        {
          content: "",
          extension: "md",
          frontmatter: {},
          id: "byproduct/03-business-rules/06-business-processes/index",
          outline: [],
          path: "byproduct/03-business-rules/06-business-processes/index.md",
          title: "业务流程图总览",
        },
      ],
      new Map([
        [
          "byproduct/03-business-rules/06-business-processes",
          {
            label: "业务流程图",
            link: {
              id: "byproduct/business-rules/business-processes/index",
              type: "doc",
            },
            position: 6,
          },
        ],
      ]),
    );

    expect(navTree[0]?.children?.[0]?.children?.[0]).toMatchObject({
      docId: "byproduct/03-business-rules/06-business-processes/index",
      key: "byproduct/03-business-rules/06-business-processes",
      label: "业务流程图",
      type: "category",
    });
  });

  it("uses index documents as category pages by convention", () => {
    const navTree = createNavTreeForTests(
      [
        {
          content: "",
          extension: "md",
          frontmatter: {},
          id: "guide/index",
          outline: [],
          path: "guide/index.md",
          title: "Guide Overview",
        },
        {
          content: "",
          extension: "md",
          frontmatter: {},
          id: "guide/details",
          outline: [],
          path: "guide/details.md",
          title: "Details",
        },
      ],
      new Map([
        [
          "guide",
          {
            label: "Guide",
            position: 1,
          },
        ],
      ]),
    );

    expect(navTree).toEqual([
      {
        children: [
          {
            docId: "guide/details",
            key: "guide/details",
            label: "Details",
            order: Number.MAX_SAFE_INTEGER,
            type: "doc",
          },
        ],
        docId: "guide/index",
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ]);
  });

  it("uses README documents as category pages by convention", () => {
    const navTree = createNavTreeForTests(
      [
        {
          content: "",
          extension: "mdx",
          frontmatter: {},
          id: "guide/README",
          outline: [],
          path: "guide/README.mdx",
          title: "Guide Overview",
        },
      ],
      new Map(),
    );

    expect(navTree[0]).toMatchObject({
      docId: "guide/README",
      key: "guide",
      type: "category",
    });
  });

  it("keeps convention index docs as child items when category link is null", () => {
    const navTree = createNavTreeForTests(
      [
        {
          content: "",
          extension: "md",
          frontmatter: {},
          id: "guide/index",
          outline: [],
          path: "guide/index.md",
          title: "Guide Overview",
        },
      ],
      new Map([
        [
          "guide",
          {
            label: "Guide",
            link: null,
            position: 1,
          },
        ],
      ]),
    );

    expect(navTree).toEqual([
      {
        children: [
          {
            docId: "guide/index",
            key: "guide/index",
            label: "Guide Overview",
            order: Number.MAX_SAFE_INTEGER,
            type: "doc",
          },
        ],
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ]);
  });
});

describe("createDocsPlugin doc routes", () => {
  it("creates Docusaurus-style route aliases for numbered directories", () => {
    expect(
      createDocRoutes([
        {
          content: "",
          extension: "md",
          frontmatter: {},
          id: "byproduct/01-user-guide/overview",
          outline: [],
          path: "byproduct/01-user-guide/overview.md",
          title: "用户指南",
        },
        {
          content: "",
          extension: "md",
          frontmatter: { slug: "./" },
          id: "byproduct/06-business-processes/index",
          outline: [],
          path: "byproduct/06-business-processes/index.md",
          title: "业务流程图",
        },
      ]),
    ).toMatchObject({
      "byproduct/business-processes": "byproduct/06-business-processes/index",
      "byproduct/user-guide/overview": "byproduct/01-user-guide/overview",
    });
  });
});
