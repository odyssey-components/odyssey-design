import { describe, expect, it } from "vitest";
import { findNavbarItemForDoc, getDocBreadcrumbs, getDocPagination, getSidebarTreeForNavbarItem } from "./navigation";
import type { NavbarItem, NavNode } from "./types";

const navTree: NavNode[] = [
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
            docId: "byproduct/01-user-guide/overview",
            key: "byproduct/01-user-guide/overview",
            label: "概览",
            order: 1,
            type: "doc",
          },
          {
            docId: "byproduct/01-user-guide/roles-and-scenarios",
            key: "byproduct/01-user-guide/roles-and-scenarios",
            label: "角色与场景",
            order: 2,
            type: "doc",
          },
        ],
        key: "byproduct/01-user-guide",
        label: "用户指南",
        order: 1,
        type: "category",
      },
    ],
    key: "byproduct",
    label: "副产品文档",
    order: 1,
    type: "category",
  },
];

const navbar: NavbarItem[] = [
  {
    docId: "byproduct/intro",
    label: "产品概述",
    sidebarRoot: "byproduct/intro",
  },
  {
    docId: "byproduct/01-user-guide/overview",
    label: "用户指南",
    sidebarRoot: "byproduct/01-user-guide",
  },
];

describe("docs navigation", () => {
  it("selects the navbar item that owns the active doc", () => {
    expect(findNavbarItemForDoc(navbar, "byproduct/01-user-guide/overview")).toEqual(navbar[1]);
  });

  it("uses the configured sidebar root as the vertical menu scope", () => {
    expect(getSidebarTreeForNavbarItem(navTree, navbar[1])).toEqual(navTree[0]?.children?.[1]?.children);
  });

  it("keeps a document navbar item visible in the vertical menu", () => {
    expect(getSidebarTreeForNavbarItem(navTree, navbar[0])).toEqual([navTree[0]?.children?.[0]]);
  });

  it("creates previous and next pagination from sidebar document order", () => {
    expect(getDocPagination(navTree, "byproduct/01-user-guide/roles-and-scenarios")).toEqual({
      next: undefined,
      previous: {
        docId: "byproduct/01-user-guide/overview",
        label: "概览",
      },
    });
  });

  it("creates Docusaurus-style breadcrumbs from the sidebar path", () => {
    expect(getDocBreadcrumbs(navTree, "byproduct/01-user-guide/roles-and-scenarios")).toEqual([
      {
        docId: "byproduct/intro",
        label: "副产品文档",
      },
      {
        docId: "byproduct/01-user-guide/overview",
        label: "用户指南",
      },
      {
        docId: "byproduct/01-user-guide/roles-and-scenarios",
        label: "角色与场景",
      },
    ]);
  });
});
