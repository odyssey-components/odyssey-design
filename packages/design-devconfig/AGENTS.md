# Devconfig 约束

## 上下文

本包提供 TypeScript workspace 共享的 Biome 与 TypeScript 配置，不承载任何产品代码。

## 约束

- 配置必须能从每一个消费它的 workspace 根解析；消费包应直接声明 `@odyssey/design-devconfig`。
- 共享规则保持技术栈无关，React 或具体应用规则应留在消费方配置中。
- 修改配置时同步验证至少一个直接消费者和整个 TypeScript workspace。

## 验证

```bash
bun run --filter @odyssey/design-devconfig check
bun run check
```
