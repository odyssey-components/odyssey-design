# @odyssey/ai

Odyssey 的浏览器端 AI **运行时**库。呈现层已经下沉到 `@odyssey/ui/ai`，本包只保留 transport、persistence 与 provider event 契约，外加一个把 runtime 接到视觉层上的预组合 Assistant。

## 架构

```text
@odyssey/ui/ai   （呈现层：components + locale 契约 + 表现类型）
        ↑
@odyssey/ai     （运行时层：headless → react → assistant）
```

模型调用、密钥、权限校验和服务端 Agent Loop 留在产品后端。TanStack AI 仅是内部协议适配器，公共接口只使用 Odyssey 类型。

## 使用

### 标准 Assistant

```tsx
import { Assistant } from "@odyssey/ai/assistant";
import { createOdysseyAIClient } from "@odyssey/ai/headless";

const client = createOdysseyAIClient({ endpoint: "/api/ai/chat" });

<Assistant runtime={{ client, productKey: "assistant", sessionId }} />;
```

已有 `OdysseyAIProvider` 时可直接使用 `AssistantWorkspace`。它是唯一负责把 runtime 状态接到视觉 primitives 的标准组合层。

## Headless 与 React bindings

`@odyssey/ai/headless` 提供消息、事件、线程状态、client、server-thread adapter、内存存储和 runtime，不依赖 React 或 Odyssey UI。`@odyssey/ai/react` 提供 Provider、selectors、hooks 和审批 bindings，不提供视觉组件。

```tsx
import { createOdysseyAIClient, createOdysseyAIRuntime } from "@odyssey/ai/headless";
import { OdysseyAIRuntimeProvider, useThreadState } from "@odyssey/ai/react";
```

## 呈现层在 `@odyssey/ui/ai`

视觉组件不再由本包导出，改为从 `@odyssey/ui/ai/*` 引入。它们只接收状态与回调，不读取 AI runtime，因此可以用于普通聊天、需求分析、审阅面板和内联输入。

```tsx
import { AIComposer, AIComposerInput, AIComposerSend } from "@odyssey/ui/ai/composer";

<AIComposer onSubmit={submit}>
  <AIComposerInput value={value} onChange={(event) => setValue(event.target.value)} />
  <AIComposerSend loading={loading} canSubmit={Boolean(value.trim())} />
</AIComposer>;
```

Thread、Message、Suggestion、ToolApproval、ModelSelector 和 ThreadList 同样通过对应的 `@odyssey/ui/ai/*` 子路径使用。消息操作、建议选择、审批和分支切换必须由调用方显式传入回调。

本包保留的公开面只有运行时相关的入口：

| 子路径 | 内容 |
| --- | --- |
| `@odyssey/ai/headless` | client、runtime、server-thread adapter、内存存储、工具定义 |
| `@odyssey/ai/react` | Provider、selectors、hooks、审批 bindings |
| `@odyssey/ai/assistant` | 预组合 Assistant 与 AssistantWorkspace |
| `@odyssey/ai/ui/markdown` | GFM + Shiki 代码高亮 |
| `@odyssey/ai/ui/locale` | `@odyssey/ui/ai/locale` 的别名，保留历史命名 |
| `@odyssey/ai/ui/speech` | 语音输入 |

预组合 Assistant 默认提供流式消息、GFM/代码高亮、附件、语音、建议问题、模型选择、消息操作、分支和工具审批。浏览器持久化只能由消费方显式配置；默认使用当前运行期内存存储。

## 验证

```bash
bun run --filter @odyssey/ai check
bun run --filter @odyssey/ai test
```
