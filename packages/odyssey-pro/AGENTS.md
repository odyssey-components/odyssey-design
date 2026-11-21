# Odyssey UI Pro 兼容包约定

本包仅为 `@odyssey/pro/*` 保留 source-first 兼容转发；唯一实现归属 `packages/odyssey-ui/src/patterns/`。

- 每个旧公开 subpath 必须对应一份仅转发到相同 `@odyssey/ui/patterns/*` 子路径的 facade。
- 运行时依赖仅允许 `@odyssey/ui`；不得复制组件、样式、locale、options 或 semantic parts。
- 新产品代码必须直接依赖 `@odyssey/ui` 的 patterns 子路径；仓库内 consumer 不应继续依赖本包。
- 类型与架构检查只验证 facade 映射；patterns 的实现检查由 `@odyssey/ui` 负责。

```bash
bun run --filter @odyssey/pro check
```
