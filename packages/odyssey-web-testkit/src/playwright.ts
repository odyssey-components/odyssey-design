import { defineConfig, type PlaywrightTestConfig } from "@playwright/test";
import { createResourceScope, withResourceScope } from "./resource-scope.ts";

export type { ResourceScope, ResourceScopeOptions } from "./resource-scope";
export { createResourceScope, withResourceScope };

export type PlaywrightKitConfig = Omit<PlaywrightTestConfig, "outputDir" | "testDir" | "use"> &
  Readonly<{
    testDir: string;
    outputDir: string;
    baseURL: string;
    use?: PlaywrightTestConfig["use"];
  }>;

export function createPlaywrightConfig(options: PlaywrightKitConfig): PlaywrightTestConfig {
  if (!options.testDir.trim()) throw new TypeError("testDir is required");
  if (!options.outputDir.trim()) throw new TypeError("outputDir is required");
  const origin = new URL(options.baseURL);
  if ((origin.protocol !== "http:" && origin.protocol !== "https:") || origin.username || origin.password || origin.search || origin.hash) {
    throw new TypeError("baseURL must be an HTTP(S) URL without credentials, query, or fragment");
  }
  const { baseURL: _baseURL, use, ...consumerOptions } = options;
  return defineConfig({
    fullyParallel: false,
    forbidOnly: true,
    retries: 0,
    workers: 1,
    ...consumerOptions,
    use: { trace: "off", screenshot: "off", video: "off", ...use, baseURL: options.baseURL },
  });
}
