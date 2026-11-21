import { createContext, useContext } from "react";

export interface DocsLocale {
  code: "zh-CN" | "en-US";
  navigation: { catalog: string; outline: string; emptyOutline: string };
  content: { empty: string };
  pagination: { label: string; previous: string; next: string };
  appearance: {
    label: string;
    colorScheme: string;
    system: string;
    light: string;
    dark: string;
    density: string;
    standard: string;
    compact: string;
  };
  account: { label: string; logout: string };
  mermaid: { zoomOut: string; zoomIn: string; reset: string; fullscreen: string; missingSvg: string; renderFailed: string };
  backToTop: string;
}

const zhCN: DocsLocale = {
  code: "zh-CN",
  navigation: { catalog: "目录", outline: "页面大纲", emptyOutline: "当前文档没有大纲" },
  content: { empty: "没有可显示的文档" },
  pagination: { label: "文档分页", previous: "上一篇", next: "下一篇" },
  appearance: {
    label: "外观设置",
    colorScheme: "颜色模式",
    system: "跟随系统",
    light: "浅色",
    dark: "深色",
    density: "界面密度",
    standard: "舒适",
    compact: "紧凑",
  },
  account: { label: "用户菜单", logout: "退出登录" },
  mermaid: { zoomOut: "缩小", zoomIn: "放大", reset: "重置缩放", fullscreen: "全屏", missingSvg: "Mermaid 未生成 SVG", renderFailed: "Mermaid 渲染失败" },
  backToTop: "返回顶部",
};

const enUS: DocsLocale = {
  code: "en-US",
  navigation: { catalog: "Contents", outline: "On this page", emptyOutline: "This document has no outline" },
  content: { empty: "No documentation to display" },
  pagination: { label: "Documentation pagination", previous: "Previous", next: "Next" },
  appearance: {
    label: "Appearance",
    colorScheme: "Color scheme",
    system: "System",
    light: "Light",
    dark: "Dark",
    density: "Density",
    standard: "Comfortable",
    compact: "Compact",
  },
  account: { label: "User menu", logout: "Log out" },
  mermaid: {
    zoomOut: "Zoom out",
    zoomIn: "Zoom in",
    reset: "Reset zoom",
    fullscreen: "Fullscreen",
    missingSvg: "Mermaid did not generate an SVG",
    renderFailed: "Mermaid rendering failed",
  },
  backToTop: "Back to top",
};

export const docsLocales = { zhCN, enUS } as const;

type DeepPartial<T> = T extends (...args: never[]) => unknown ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export type DocsLocalePatch = DeepPartial<DocsLocale>;

function mergeLocale<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    result[key] =
      value && typeof value === "object" && !Array.isArray(value) && current && typeof current === "object"
        ? mergeLocale(current as object, value as object)
        : value;
  }
  return result as T;
}

export function createDocsLocale(base: DocsLocale, patch: DocsLocalePatch): DocsLocale {
  return mergeLocale<DocsLocale>(base, patch);
}

export const DocsLocaleContext = createContext<DocsLocale>(zhCN);

export function useDocsLocale(): DocsLocale {
  return useContext(DocsLocaleContext);
}

export function resolveDocsLocale(language?: string): DocsLocale {
  return language?.toLowerCase().startsWith("en") ? enUS : zhCN;
}
