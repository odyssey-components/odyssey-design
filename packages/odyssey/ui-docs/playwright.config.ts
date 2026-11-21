import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./visual-tests",
  fullyParallel: true,
  expect: { toHaveScreenshot: { animations: "disabled", maxDiffPixelRatio: 0.01 } },
  use: { baseURL: "http://127.0.0.1:4173", colorScheme: "light", locale: "zh-CN", timezoneId: "Asia/Shanghai" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: "bun run build && bunx vite preview --host 127.0.0.1 --port 4173", port: 4173, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
