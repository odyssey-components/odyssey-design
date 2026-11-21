# @odyssey/design-devconfig

## 职责边界

保存 TypeScript 与 Biome 共享配置，不包含应用或业务规则。每个消费 workspace 必须直接声明本包，使配置从项目根可解析。

## 使用

在 `tsconfig` 或 `biome.json` 中继承公开 export，不使用跨目录相对路径指向本包源码。

## 验证

```bash
bun run --filter @odyssey/design-devconfig check
```
