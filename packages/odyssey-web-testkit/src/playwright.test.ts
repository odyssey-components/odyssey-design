import { createPlaywrightConfig } from "./playwright";

describe("createPlaywrightConfig", () => {
  it("requires the consumer's test directory, origin, and output directory", () => {
    expect(() => createPlaywrightConfig({ testDir: "", baseURL: "", outputDir: "" })).toThrow();
  });

  it("uses safe defaults and preserves consumer Playwright options", () => {
    const config = createPlaywrightConfig({
      testDir: "./e2e",
      baseURL: "http://127.0.0.1:4173",
      outputDir: ".artifacts/run-1",
      testMatch: /web-.*\.spec\.ts$/,
      metadata: { runId: "run-1" },
      use: { browserName: "chromium", locale: "zh-CN", acceptDownloads: false },
    });

    expect(config.testDir).toBe("./e2e");
    expect(config.outputDir).toBe(".artifacts/run-1");
    expect(config.testMatch).toEqual(/web-.*\.spec\.ts$/);
    expect(config.forbidOnly).toBe(true);
    expect(config.retries).toBe(0);
    expect(config.workers).toBe(1);
    expect(config.fullyParallel).toBe(false);
    expect(config.use).toMatchObject({ baseURL: "http://127.0.0.1:4173", trace: "off", screenshot: "off", video: "off", locale: "zh-CN" });
    expect(config.metadata).toEqual({ runId: "run-1" });
  });

  it("lets the consumer override generic defaults explicitly", () => {
    const config = createPlaywrightConfig({
      testDir: "./e2e",
      baseURL: "http://127.0.0.1:4173",
      outputDir: ".artifacts/run-2",
      workers: 2,
      retries: 1,
      use: { trace: "retain-on-failure", screenshot: "only-on-failure" },
    });

    expect(config.workers).toBe(2);
    expect(config.retries).toBe(1);
    expect(config.use).toMatchObject({ trace: "retain-on-failure", screenshot: "only-on-failure" });
  });
});
