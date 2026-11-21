import { defineDocsConfig } from "@odyssey/docs/plugin";

export default defineDocsConfig({
  title: "Odyssey UI",
  subtitle: "轻量、可访问的个人产品 UI",
  basePath: "/",
  homeDocId: "1-getting-started/index",
  navbar: [
    { docId: "1-getting-started/index", label: "指南", sidebarRoot: "1-getting-started" },
    { docId: "2-foundations/design-tokens", label: "基础", sidebarRoot: "2-foundations" },
    { docId: "3-components/index", label: "组件", sidebarRoot: "3-components" },
    { docId: "4-ai/index", label: "AI", sidebarRoot: "4-ai" },
    { docId: "5-pro/index", label: "Pro", sidebarRoot: "5-pro" },
  ],
});
