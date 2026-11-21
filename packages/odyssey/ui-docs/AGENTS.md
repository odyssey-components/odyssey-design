# @odyssey/ui-docs Agent 协议

本文件补充仓库根 `AGENTS.md`，仅适用于 Odyssey 文档站。

## 单一事实来源

- 本 Catalog 只维护 Web 实现的组件主数据；跨技术栈设计语义由仓库上游 Odyssey 的平台中立设计契约维护。
- `src/catalog.json` 登记组件身份、平台、状态、Demo、API 和无障碍能力。
- `src/catalog.ts` 为 Catalog 补充 anatomy、states、tokens、since 和 migration 元数据。
- API 表必须由库源码生成，禁止手工复制 TypeScript 接口。
- Token 表必须直接来自 `@odyssey/ui/token-contract` 的 TypeScript metadata，禁止维护 JSON manifest 或 MDX 第二份清单。

## 组件页模板

组件页至少包含：简介、`何时使用`、可运行 Demo、API。交互组件还必须说明键盘和无障碍行为；破坏性变更必须链接迁移文档。

- Demo 必须使用公共包导出，禁止从库的 `src` 或 Base UI 导入。
- 代码示例必须可复制、可类型检查，并展示推荐 API，而不是兼容写法。
- 同一组件的移动端与桌面端差异应在同一页面说明。
- 不创建 shadcn registry、安装命令或复制源码入口。
- Vite 预览通过 `@tailwindcss/vite` 编译，并从应用样式入口导入 `@odyssey/ui/styles.css`；不在文档站复制共享组件 CSS。

## 完成定义

```bash
bun run docs:check
bun run check
bun run test
bun run build
```
