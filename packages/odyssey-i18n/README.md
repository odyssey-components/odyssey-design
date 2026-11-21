# @odyssey/i18n

## 职责边界

提供共享 i18next 初始化与 React 适配，不保存应用专属翻译内容或业务路由状态。

## 使用

本包是 Odyssey 内部 i18next engine。产品应用从 `@odyssey/ui/i18n` 创建和消费实例；Odyssey 共享包直接依赖本包。

## 验证

```bash
bun run --filter @odyssey/i18n check
bun run --filter @odyssey/i18n test:run
```
