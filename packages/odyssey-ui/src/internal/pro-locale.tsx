import { createContext, useContext } from "react";
import { useOdysseyLocale } from "../locale";

export interface ProLocale {
  code: "zh-CN" | "en-US";
  select: { clear: string; empty: string; loading: string; placeholder: string; search: string; searchLabel: (label: string) => string };
  dialog: { cancel: string };
  confirm: { cancel: string; confirm: string };
  table: {
    actions: string;
    columns: string;
    empty: string;
    loading: string;
    pageSize: string;
    selectedRows: (count: number) => string;
    selectAll: string;
    selectRow: (index: number) => string;
  };
  form: { reset: string; submit: string; submitFailed: string };
  pageState: { retry: string; loading: string; error: string; empty: string };
  pagination: { go: string; jumpTo: string; pageSize: string; total: (total: number, range: [number, number]) => string };
  iconPicker: { placeholder: string; search: string; empty: string };
  adminLogin: {
    description: string;
    passwordMismatch: string;
    username: string;
    password: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
    login: string;
    verify: string;
    updatePassword: string;
    back: string;
  };
  adminShell: {
    scheme: { system: string; light: string; dark: string };
    density: { standard: string; compact: string; spacious: string };
    themeSettings: string;
    colorScheme: string;
    visualPreset: string;
    interfaceDensity: string;
    userMenu: string;
    logoutFailed: string;
    loggingOut: string;
    logout: string;
    currentModule: string;
    openMenu: string;
    closeMenu: string;
    modules: string;
    moduleNavigation: string;
    featureNavigation: (label: string) => string;
  };
}

const zhCN: ProLocale = {
  code: "zh-CN",
  select: { clear: "清除", empty: "暂无选项", loading: "加载中", placeholder: "请选择", search: "搜索", searchLabel: (label) => `${label}搜索` },
  dialog: { cancel: "取消" },
  confirm: { cancel: "取消", confirm: "确认" },
  table: {
    actions: "操作",
    columns: "列",
    empty: "暂无数据",
    loading: "加载中",
    pageSize: "每页条数",
    selectedRows: (count) => `已选择 ${count} 项`,
    selectAll: "选择全部",
    selectRow: (index) => `选择第 ${index} 行`,
  },
  form: { reset: "重置", submit: "提交", submitFailed: "提交失败" },
  pageState: { retry: "重试", loading: "加载中…", error: "加载失败", empty: "暂无内容" },
  pagination: { go: "跳转", jumpTo: "跳转到页码", pageSize: "每页条数", total: (total, range) => `第 ${range[0]}–${range[1]} 项，共 ${total} 项` },
  iconPicker: { placeholder: "请选择图标", search: "搜索", empty: "暂无图标" },
  adminLogin: {
    description: "使用你的账号继续",
    passwordMismatch: "两次输入的新密码不一致",
    username: "账号",
    password: "密码",
    verificationCode: "动态验证码",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    login: "登录",
    verify: "验证",
    updatePassword: "更新密码",
    back: "返回",
  },
  adminShell: {
    scheme: { system: "跟随系统", light: "浅色", dark: "深色" },
    density: { standard: "标准", compact: "紧凑", spacious: "宽松" },
    themeSettings: "主题设置",
    colorScheme: "色彩模式",
    visualPreset: "视觉预设",
    interfaceDensity: "界面密度",
    userMenu: "用户菜单",
    logoutFailed: "退出失败，请重试",
    loggingOut: "正在退出…",
    logout: "退出登录",
    currentModule: "当前模块",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
    modules: "模块",
    moduleNavigation: "模块导航",
    featureNavigation: (label) => `${label}功能导航`,
  },
};

const enUS: ProLocale = {
  code: "en-US",
  select: { clear: "Clear", empty: "No options", loading: "Loading", placeholder: "Select", search: "Search", searchLabel: (label) => `Search ${label}` },
  dialog: { cancel: "Cancel" },
  confirm: { cancel: "Cancel", confirm: "Confirm" },
  table: {
    actions: "Actions",
    columns: "Columns",
    empty: "No data",
    loading: "Loading",
    pageSize: "Rows per page",
    selectedRows: (count) => `${count} selected`,
    selectAll: "Select all",
    selectRow: (index) => `Select row ${index}`,
  },
  form: { reset: "Reset", submit: "Submit", submitFailed: "Submission failed" },
  pageState: { retry: "Retry", loading: "Loading…", error: "Unable to load", empty: "No content" },
  pagination: { go: "Go", jumpTo: "Jump to page", pageSize: "Items per page", total: (total, range) => `${range[0]}–${range[1]} of ${total} items` },
  iconPicker: { placeholder: "Select an icon", search: "Search", empty: "No icons" },
  adminLogin: {
    description: "Continue with your account",
    passwordMismatch: "The new passwords do not match",
    username: "Username",
    password: "Password",
    verificationCode: "Verification code",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    login: "Sign in",
    verify: "Verify",
    updatePassword: "Update password",
    back: "Back",
  },
  adminShell: {
    scheme: { system: "System", light: "Light", dark: "Dark" },
    density: { standard: "Standard", compact: "Compact", spacious: "Spacious" },
    themeSettings: "Theme settings",
    colorScheme: "Color scheme",
    visualPreset: "Visual preset",
    interfaceDensity: "Interface density",
    userMenu: "User menu",
    logoutFailed: "Sign out failed. Try again.",
    loggingOut: "Signing out…",
    logout: "Sign out",
    currentModule: "Current module",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    modules: "Modules",
    moduleNavigation: "Module navigation",
    featureNavigation: (label) => `${label} feature navigation`,
  },
};

export const proLocales = { zhCN, enUS } as const;
export type ProLocalePatch = DeepPartial<ProLocale>;
type DeepPartial<T> = T extends (...args: never[]) => unknown ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
function merge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    result[key] = value && typeof value === "object" && current && typeof current === "object" ? merge(current as object, value as object) : value;
  }
  return result as T;
}
export function createProLocale(base: ProLocale, patch: ProLocalePatch): ProLocale {
  return merge<ProLocale>(base, patch);
}
export const ProLocaleContext = createContext<ProLocale | null>(null);
export function useProLocale(): ProLocale {
  const value = useContext(ProLocaleContext);
  const ui = useOdysseyLocale();
  return value ?? (ui.code === "en-US" ? enUS : zhCN);
}
