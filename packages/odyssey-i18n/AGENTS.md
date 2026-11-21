# @odyssey/i18n Agent Notes

## 边界

本包是 Repository shared 的产品中立国际化运行时，供 `@odyssey/ui` 公共边界使用。产品应用应通过 UI 包暴露的国际化入口接入，不在这里加入产品词汇、业务资源或产品状态。

## 约束

- 保持公共 API 与资源合并语义稳定；迁移目录不得顺带改变运行时行为。
- 只加入跨产品且不带业务语义的基础能力。
- TypeScript 与 Biome 配置继承仓库 tooling 包，不复制配置。

## 验证

```bash
bun run --filter @odyssey/i18n check
bun run --filter @odyssey/i18n test:run
```
