import { createReactVitestConfig } from "@odyssey/web-testkit/vitest";

export default createReactVitestConfig({ test: { setupFiles: ["./src/test/setup.ts", "./src/patterns/test/setup.ts"] } });
