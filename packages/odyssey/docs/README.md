# @odyssey/docs

## 职责边界

提供 Odyssey Markdown/MDX 文档运行时、导航解析、React 文档壳、Vite plugin 与共享文档样式，不包含具体产品或组件文档内容。React 运行时只依赖 `@odyssey/ui` 公开入口。

## 公开入口

- `@odyssey/docs`：DocsApp 与 React 文档组件。
- `@odyssey/docs/headless`：文档模型、导航、链接和 runtime hook。
- `@odyssey/docs/plugin`：Vite plugin 与配置。
- `@odyssey/docs/mdx-runtime`：MDX provider。
- `@odyssey/docs/locale`：强类型中英文 locale。
- `@odyssey/docs/styles.css`：运行时样式。

Vite plugin 提供 `odyssey:docs` 虚拟模块。

## 验证

```bash
bun run --filter @odyssey/docs check
bun run --filter @odyssey/docs test:run
bun run --filter @odyssey/docs build
```
