# Odyssey Docs Runtime 约束

## 上下文

本包提供 Odyssey 文档模型、解析器、Vite plugin 和基于 `@odyssey/ui` 的 React 文档运行时。

## 约束

- headless 数据模型不得依赖具体站点路由或产品文案。
- React 适配层只通过 `@odyssey/ui` 公开入口组合，不依赖旧 `@libs/ui`、`@libs/starter`、Pro 或 AI。
- CSS、DOM 与 plugin identity 使用 `od` 前缀；内置文案必须来自强类型 Docs locale。
- 新增公开能力时同步补充测试与 README 使用说明。

## 验证

```bash
bun run --filter @odyssey/docs check
bun run --filter @odyssey/docs test:run
```
