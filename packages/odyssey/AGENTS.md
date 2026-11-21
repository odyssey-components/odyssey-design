# Odyssey Docs 包族 Agent 协议

本目录当前只承载 `@odyssey/docs` 文档运行时和 `@odyssey/ui-docs` Web 组件文档站。共享 UI、Pro、i18n 与 AI 的 owner 位于根 `packages/`。

## 约束

- `@odyssey/docs` 只通过 `@odyssey/ui` 公共入口组合文档运行时，不依赖 Pro/AI 或旧 `@libs/ui`。
- `@odyssey/ui-docs` 可以消费当前 UI/Pro 文档能力，但不成为跨技术栈设计语义 owner。
- 产品文案、路由和业务知识留在产品；CSS/DOM/plugin identity 使用 `od` 前缀。
- 完整依赖、导出和版本以 package manifests 与源码为准。

## 验证

```bash
bun run --filter @odyssey/docs check
bun run --filter @odyssey/docs test:run
bun run --filter @odyssey/ui-docs build
```
