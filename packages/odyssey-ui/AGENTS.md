# Odyssey UI Agent 协议

本文件补充仓库根 `AGENTS.md`，仅适用于 `@odyssey/ui`。

## 边界

- `@base-ui/react` 是唯一 headless primitive 依赖，只允许在对应组件适配文件中导入。
- 运行时组件按层从 `@odyssey/ui/primitives/*` 与 `@odyssey/ui/patterns/*` 导入；主题定义和 Token API 使用 `@odyssey/ui` 对应公开入口。
- 不直接 re-export Base UI，不引入 Ant Design 组件或源码复制 registry。
- 样式采用 Tailwind CSS utilities、CVA variants 与 `cn()`；共享 stylesheet 通过 `@odyssey/ui/styles.css` 导出并由 Vite 消费端编译，不提交生成 CSS。
- `src/` 中的运行时代码不得导入 `styled-components` 或创建运行时样式；动态主题与 density 只通过 Provider 写入的 `--od-*` variables 改变。

## 约束

- 公共组件保持组合式 anatomy、稳定 `data-od-slot`、状态 `data-*`、ref、原生属性、className 和 style 透传。
- Odyssey 技术前缀统一为 `od`：公开变量使用 `--od-*`，私有变量使用 `--_od-*`，类名使用 `.od-Component-part`，DOM contract 使用 `data-od-*`；禁止引入 `ods` 前缀。
- Tailwind class 使用完整静态字符串，变体由 CVA 声明；className 扩展通过 `cn()` 合并，运行时主题值经 `--od-*` CSS variables 提供。禁止组件 `createGlobalStyle`、全量 registry、fallback context 或跨组件私有样式 import。
- 业务样式不得依赖 Odyssey 私有类名；跨组件设计值使用 Token。
- 主题、density 和 color scheme 相互独立；移动端与桌面端不是视觉主题。
- Provider 在运行时解析主题并通过 React Context 与 CSS Variables 分发；样式规则不得依赖运行时 CSS-in-JS。
- `OdysseyResolvedTokens` 是 Seed/Reference/Semantic/Component 的唯一 resolved graph；Web contract registry 同时定义 path、CSS Variable、kind、文档分组与描述，token engine 保持在 `src/tokens/` 内部逻辑层。
- 所有组件继续覆盖键盘、屏幕阅读器、RTL、窄屏、coarse pointer、reduced motion、嵌套浮层和焦点恢复。

## 源码分层

- `src/primitives/<Component>/` 是基础组件的唯一实现目录；历史 `@odyssey/ui/<component>` 子路径继续指向相同源码。
- `src/patterns/<Pattern>/` 是高级、产品中立组合的唯一实现目录；其依赖只能向下到 primitives、theme/accessibility 或同层模块。
- 新消费者使用 `@odyssey/ui/primitives/*` 与 `@odyssey/ui/patterns/*`。`@odyssey/pro/*` 仅是旧路径兼容 facade，不得从 UI 实现层导入。

## 验证

```bash
bun run --filter @odyssey/ui check
bun run --filter @odyssey/ui test:run
bun run --filter @odyssey/ui-docs build
```

## AI 组合组件层

`src/ai/` 和 `primitives/`、`patterns/` 平级，单向消费公共 `primitives`、tokens/theme 与 accessibility；`primitives`、`patterns` 不得依赖 `ai`。AI 层不保存 Agent Session、Provider 协议/凭据、CommandJournal、远程审批权限或原始数据状态；新组件只在明确产品消费者和可验证 API 时增加。公开组件使用 `@odyssey/ui/ai/*` subpath，要求源码、静态 class contract、契约测试、`data-od-slot`、ref 与 theme/density 一致性。
