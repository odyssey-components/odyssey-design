# Odyssey UI

跨产品 Web 设计系统与组件公共入口，样式采用 React/TypeScript、Tailwind CSS utilities、CVA 与 `cn()`，并实现仓库Odyssey 的平台中立设计契约。共享 UI runtime 不依赖 styled-components。完整组件、subpath、token 和类型以公开源码入口与测试为准。

## 边界

`OdysseyProvider` 负责 theme、color scheme、density、locale 与 portal host；Seed → Reference → Semantic → Component token 在运行时解析，并暴露稳定 `--od-*` CSS Variables。产品业务、请求、路由和持久化不进入共享 UI。

整体界面密度支持 `compact`、`standard`、`spacious`。宽松增加控件高度、行高与留白；语义颜色、字号、正文行距和圆角由主题继续控制。

`src/primitives/` 放置独立基础组件；`src/patterns/` 放置产品中立的高级组合。依赖方向为 patterns → primitives → {theme, accessibility}。新代码使用 `@odyssey/ui/primitives/*` 与 `@odyssey/ui/patterns/*`；旧 `@odyssey/ui/<subpath>` 继续转发到同一原语实现。`@odyssey/pro/*` 是迁移兼容入口，新的消费者不应依赖该包。

## 使用

```tsx
import { Button } from "@odyssey/ui/primitives/button";
import { ProAdminShell } from "@odyssey/ui/patterns/admin-shell";
```

Vite 消费端启用 `@tailwindcss/vite`，并在应用全局 CSS 中导入一次共享样式：

```css
@import "@odyssey/ui/styles.css";
```

共享样式映射现有 Odyssey CSS variables，不附带 Tailwind Preflight。组件 class 组合使用包内 `cn()` helper 与公开 variants；主题和密度继续由 `OdysseyProvider` 更新 `--od-*` variables。

设计一致性 adapter：

```bash
bun run design-system:adapter
```

## 验证

```bash
bun run --filter @odyssey/ui check
bun run --filter @odyssey/ui test:run
bun run --filter @odyssey/ui-docs build
```

## AI 组件层

`src/ai/` 与 `src/primitives/`、`src/patterns/` 平级，用于跨产品复用的 AI 交互组件，并通过共享静态 stylesheet 提供样式。`AIComposer`、`AIMessage`、`AIToolCall`、`AIThread`、`AIThreadList`、`AISuggestion`、`AIModelSelector`、`AIRenderers`、`AITimeline`、`AIApproval` 已通过 `@odyssey/ui/ai/*` 公开，locale 契约与表现层类型分别落在 `@odyssey/ui/ai/locale` 与 `@odyssey/ui/ai/types`；Provider 适配、Agent Session 状态、权限和传输继续归 `@odyssey/ai` 与产品。完整使用约束见 [src/ai/README.md](src/ai/README.md)。

### 首屏外观初始化

使用 `ProAdminProvider` 的应用可从 `@odyssey/ui/patterns/admin-provider` 引入 `createAppearanceBootstrapScript` 和 `AppearanceDocumentSync`。在 HTML 的 head 中同步执行前者生成的脚本，并在 Provider 内渲染后者；两者传入相同的 `storageKey`、`lightBackground` 和 `darkBackground`。脚本在浏览器首次绘制前恢复配色，组件在 Provider 恢复后同步文档背景。静态 Vite 页面可使用 `@odyssey/ui/patterns/admin-appearance-vite` 的 `appearanceBootstrapVitePlugin` 在 head 开头注入同源同步脚本，兼容禁止内联脚本的内容安全策略。应用必须加载 `@odyssey/ui/styles.css`。
