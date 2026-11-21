# Odyssey UI Pro compatibility package

高级 UI 组合的唯一实现已迁移到 `@odyssey/ui/src/patterns/`。本包只保留旧 `@odyssey/pro/<subpath>` 的 source-first 转发入口，以支持尚未迁移的外部调用方；仓库内新代码使用 `@odyssey/ui/patterns/*`。此包不再承载组件实现或独立运行时依赖。

```tsx
import { ProSelect } from "@odyssey/ui/patterns/select";
```

旧路径仍可用：

```tsx
import { ProSelect } from "@odyssey/pro/select";
```

验证兼容入口：

```bash
bun run --filter @odyssey/pro check
```
