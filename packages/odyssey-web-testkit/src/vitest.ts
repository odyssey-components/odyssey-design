import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { defineConfig, mergeConfig } from "vitest/config";

const sharedSetupFile = "@odyssey/web-testkit/setup/react";

export function createReactVitestConfig(overrides: UserConfig = {}): UserConfig {
  const defaults = defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: [sharedSetupFile],
    },
  });
  return mergeConfig(defaults, overrides);
}
