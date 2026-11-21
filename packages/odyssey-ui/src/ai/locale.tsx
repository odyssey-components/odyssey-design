import { createContext, useContext } from "react";
import { useOdysseyLocale } from "../locale";

export interface AILocale {
  code: "zh-CN" | "en-US";
  assistant: { title: string; description: string; trigger: string; drawerDescription: string };
  thread: { scrollToBottom: string; newThread: string; loading: string };
  composer: {
    message: string;
    send: string;
    stop: string;
    attach?: string;
    addAttachment?: string;
    speech?: string;
    stopSpeech?: string;
    model?: string;
    modelDefault?: string;
    removeAttachment: (name: string) => string;
    dropFiles?: string;
    attachmentFailed?: string;
  };
  message: {
    toolFailed: string;
    copied: string;
    copy: string;
    delete: string;
    regenerate: string;
    stop: string;
    reasoning: string;
    generating?: string;
    stopped?: string;
    failed?: string;
    deleteTitle?: string;
    deleteDescription?: string;
    cancel?: string;
    branchGroup?: string;
    previousBranch?: string;
    nextBranch?: string;
    expand?: string;
    collapse?: string;
    truncated?: string;
    contentFiltered?: string;
    unsupported: (type: string) => string;
  };
  markdown: { copyCode: string; codeCopied: string; copyFailed: string; plainText: string; expandCode: string; collapseCode: string };
  speech: { permissionDenied: string; failed: (reason: string) => string };
  tool: { approve: string; reject: string };
}

const zhCN: AILocale = {
  code: "zh-CN",
  assistant: { title: "AI 助手", description: "有什么可以帮你？", trigger: "打开 AI 助手", drawerDescription: "与你的业务助手对话" },
  thread: { scrollToBottom: "回到底部", newThread: "新建会话", loading: "正在加载消息…" },
  composer: {
    message: "消息",
    send: "发送",
    stop: "停止",
    attach: "附件",
    addAttachment: "添加附件",
    speech: "语音",
    stopSpeech: "停止听写",
    model: "模型",
    modelDefault: "默认",
    removeAttachment: (name) => `移除 ${name}`,
    dropFiles: "拖放文件到此处",
    attachmentFailed: "附件处理失败",
  },
  message: {
    toolFailed: "工具执行失败",
    copied: "已复制",
    copy: "复制消息",
    delete: "删除消息",
    regenerate: "重新生成",
    stop: "停止生成",
    reasoning: "思考过程",
    generating: "正在生成…",
    stopped: "生成已停止",
    failed: "生成失败",
    deleteTitle: "删除这条消息？",
    deleteDescription: "这条消息及其后续分支将从当前会话历史中删除。",
    cancel: "取消",
    branchGroup: "消息版本",
    previousBranch: "上一个版本",
    nextBranch: "下一个版本",
    expand: "展开消息",
    collapse: "收起消息",
    truncated: "回复达到输出上限，内容可能不完整",
    contentFiltered: "回复因内容策略提前结束",
    unsupported: (type) => `暂不支持的内容：${type}`,
  },
  markdown: { copyCode: "复制代码", codeCopied: "已复制", copyFailed: "复制失败", plainText: "文本", expandCode: "展开代码", collapseCode: "折叠代码" },
  speech: { permissionDenied: "未获得麦克风权限", failed: (reason) => `语音识别失败：${reason}` },
  tool: { approve: "允许", reject: "拒绝" },
};
const enUS: AILocale = {
  code: "en-US",
  assistant: { title: "AI Assistant", description: "How can I help?", trigger: "Open AI assistant", drawerDescription: "Chat with your business assistant" },
  thread: { scrollToBottom: "Scroll to bottom", newThread: "New conversation", loading: "Loading messages…" },
  composer: {
    message: "Message",
    send: "Send",
    stop: "Stop",
    attach: "Attach files",
    addAttachment: "Add attachments",
    speech: "Speech",
    stopSpeech: "Stop dictation",
    model: "Model",
    modelDefault: "Default",
    removeAttachment: (name) => `Remove ${name}`,
    dropFiles: "Drop files here",
    attachmentFailed: "Attachment failed",
  },
  message: {
    toolFailed: "Tool execution failed",
    copied: "Copied",
    copy: "Copy message",
    delete: "Delete message",
    regenerate: "Regenerate",
    stop: "Stop generating",
    reasoning: "Reasoning",
    generating: "Generating…",
    stopped: "Generation stopped",
    failed: "Generation failed",
    deleteTitle: "Delete this message?",
    deleteDescription: "This message and its following branch will be removed from the conversation.",
    cancel: "Cancel",
    branchGroup: "Message versions",
    previousBranch: "Previous version",
    nextBranch: "Next version",
    expand: "Expand message",
    collapse: "Collapse message",
    truncated: "The response reached its output limit and may be incomplete",
    contentFiltered: "The response ended early because of content policy",
    unsupported: (type) => `Unsupported content: ${type}`,
  },
  markdown: {
    copyCode: "Copy code",
    codeCopied: "Copied",
    copyFailed: "Copy failed",
    plainText: "text",
    expandCode: "Expand code",
    collapseCode: "Collapse code",
  },
  speech: { permissionDenied: "Microphone permission was denied", failed: (reason) => `Speech recognition failed: ${reason}` },
  tool: { approve: "Allow", reject: "Reject" },
};
export const aiLocales = { zhCN, enUS } as const;
export type AILocalePatch = DeepPartial<AILocale>;
type DeepPartial<T> = T extends (...args: never[]) => unknown ? T : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
function merge<T extends object>(base: T, patch: DeepPartial<T>): T {
  const result = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(patch)) {
    const current = result[key];
    result[key] = value && typeof value === "object" && current && typeof current === "object" ? merge(current as object, value as object) : value;
  }
  return result as T;
}
export function createAILocale(base: AILocale, patch: AILocalePatch): AILocale {
  return merge<AILocale>(base, patch);
}
const AILocaleContext = createContext<AILocale | null>(null);
export function AILocaleProvider({ children, locale }: { children: React.ReactNode; locale?: AILocale }) {
  return <AILocaleContext.Provider value={locale ?? null}>{children}</AILocaleContext.Provider>;
}
export function useAILocale(): AILocale {
  const value = useContext(AILocaleContext);
  const ui = useOdysseyLocale();
  return value ?? (ui.code === "en-US" ? enUS : zhCN);
}
