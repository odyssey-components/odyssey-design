# @odyssey/ui-docs

```bash
bun run --filter @odyssey/ui-docs dev
```

开发服务器固定运行在 `http://localhost:4174/`。站点配置位于 `docs.config.ts`，组件元数据位于 `src/catalog.json`。

## 添加或修改组件文档

1. 在 `src/catalog.json` 注册组件、平台、状态、Demo、API 和无障碍能力。
2. 在 `src/demos/registry.tsx` 实现 Catalog 声明的 Demo。
3. 在 `docs/3-components` 编写 MDX，并引用对应的 `<ComponentDemo />` 与 `<ApiTable />`。
4. 执行 `bun run docs:check`；校验会拒绝重复 ID、缺失文档、缺失 Demo 和缺失 API。

组件页面统一按以下顺序组织：介绍、何时使用、示例、状态、响应式行为、无障碍、API、版本或迁移说明。暂时不适用的章节可以省略，不要填写空章节。完整约束见 `AGENTS.md` 与“贡献组件”文档。

基础组件只通过 `@odyssey/ui` 分发。Catalog 是 Odyssey Web 实现的组件主数据；跨技术栈设计语义由Odyssey 的平台中立设计契约维护。本项目不建设 shadcn registry，也不维护第二份 Web 组件清单。
