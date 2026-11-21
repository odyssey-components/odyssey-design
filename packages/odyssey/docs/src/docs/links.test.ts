import { describe, expect, it } from "vitest";
import { createDocHref, readDocLocation, resolveDocLink, resolveDocPath } from "./links";

const docRoutes = {
  "byproduct/business-processes": "byproduct/06-business-processes/index",
  "byproduct/product-requirements/algorithm-requirements": "byproduct/02-product-requirements/algorithm-requirements",
  "byproduct/user-guide/overview": "byproduct/01-user-guide/overview",
};

const docPaths = {
  "byproduct/01-user-guide/overview": "byproduct/user-guide/overview",
};

describe("doc links", () => {
  it("resolves Docusaurus-style clean routes to numbered docs", () => {
    expect(resolveDocLink("byproduct/intro", "./user-guide/overview", docRoutes)).toEqual({
      docId: "byproduct/01-user-guide/overview",
      hash: undefined,
    });
  });

  it("resolves parent relative routes across docs", () => {
    expect(resolveDocLink("byproduct/01-user-guide/overview", "../product-requirements/algorithm-requirements", docRoutes)).toEqual({
      docId: "byproduct/02-product-requirements/algorithm-requirements",
      hash: undefined,
    });
  });

  it("keeps hash fragments when creating app hrefs", () => {
    expect(createDocHref({ docId: "byproduct/01-user-guide/overview", hash: "阅读路径" }, docPaths)).toBe("/ops-docs/byproduct/user-guide/overview#阅读路径");
  });

  it("does not intercept external links", () => {
    expect(resolveDocLink("byproduct/intro", "https://example.com", docRoutes)).toBeUndefined();
  });

  it("resolves the current document from a Docusaurus-style pathname", () => {
    expect(resolveDocPath("/ops-docs/byproduct/user-guide/overview", docRoutes)).toBe("byproduct/01-user-guide/overview");
  });

  it("reads doc id and hash from a Docusaurus-style location", () => {
    expect(readDocLocation("/ops-docs/byproduct/user-guide/overview", "#阅读路径", docRoutes, "byproduct/intro")).toEqual({
      docId: "byproduct/01-user-guide/overview",
      hash: "阅读路径",
    });
  });
});
