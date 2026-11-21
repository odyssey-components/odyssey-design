import { createContext, useContext } from "react";

export interface OdysseyLocale {
  code: "zh-CN" | "en-US";
  pagination: {
    label: string;
    previous: string;
    next: string;
    page: (page: number) => string;
    summary: (current: number, total: number) => string;
    totalRows: (total: number) => string;
    pageSize: string;
    rowsPerPage: (size: number) => string;
    pageNumber: string;
    pagePlaceholder: string;
    jump: string;
  };
  spinner: { loading: string };
  drawer: { close: string };
  toast: { close: string; loading: string };
}

const zhCN: OdysseyLocale = {
  code: "zh-CN",
  pagination: {
    label: "分页",
    previous: "上一页",
    next: "下一页",
    page: (page) => `第 ${page} 页`,
    summary: (current, total) => `第 ${current} / ${total} 页`,
    totalRows: (total) => `共 ${total} 条`,
    pageSize: "每页条数",
    rowsPerPage: (size) => `${size} 条/页`,
    pageNumber: "页码",
    pagePlaceholder: "页码",
    jump: "跳转",
  },
  spinner: { loading: "加载中" },
  drawer: { close: "关闭面板" },
  toast: { close: "关闭通知", loading: "处理中" },
};

const enUS: OdysseyLocale = {
  code: "en-US",
  pagination: {
    label: "Pagination",
    previous: "Previous page",
    next: "Next page",
    page: (page) => `Page ${page}`,
    summary: (current, total) => `Page ${current} of ${total}`,
    totalRows: (total) => `${total} rows`,
    pageSize: "Rows per page",
    rowsPerPage: (size) => `${size} / page`,
    pageNumber: "Page number",
    pagePlaceholder: "Page",
    jump: "Go",
  },
  spinner: { loading: "Loading" },
  drawer: { close: "Close panel" },
  toast: { close: "Close notification", loading: "Loading" },
};

export const odysseyLocales = { zhCN, enUS } as const;

export type OdysseyLocalePatch = DeepPartial<OdysseyLocale>;
type DeepPartial<T> = T extends (...args: never[]) => unknown ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

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

export function createOdysseyLocale(base: OdysseyLocale, patch: OdysseyLocalePatch): OdysseyLocale {
  return mergeLocale<OdysseyLocale>(base, patch);
}

export const OdysseyLocaleContext = createContext<OdysseyLocale>(zhCN);

export function useOdysseyLocale(): OdysseyLocale {
  return useContext(OdysseyLocaleContext);
}

export function resolveOdysseyLocale(language?: string): OdysseyLocale {
  return language?.toLowerCase().startsWith("en") ? enUS : zhCN;
}
