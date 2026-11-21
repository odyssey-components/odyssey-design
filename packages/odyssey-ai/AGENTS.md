# Odyssey AI 约束

## 边界

本包是浏览器端 AI 交互层。公开 API 必须使用 Odyssey 自有类型，不得导出 TanStack AI 类型。

## 约束

- 不包含模型 Provider、API Key 或服务端 Agent；浏览器持久化必须由消费方显式启用。
- UI 只依赖 `@odyssey/ui` 公开入口，不依赖 Pro、内部 i18n、Ant Design 或其他组件库。
- 网络、认证和消息协议通过 client 配置；有副作用的工具默认需要用户审批。
- 只提供子路径入口，不增加根 barrel。

## 验证

```bash
bun run --filter @odyssey/ai check
bun run --filter @odyssey/ai test
```
