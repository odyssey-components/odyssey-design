import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

const packageManifest = JSON.parse(readFileSync("package.json", "utf8")) as { exports: Record<string, string> };

describe("public package entrypoints", () => {
  it("loads browser-safe React helpers without loading Playwright", async () => {
    const reactSource = readFileSync("src/react.tsx", "utf8");
    expect(reactSource).not.toMatch(/from ["'](?:node:|vitest|@playwright\/test|@odyssey\/(?:ui|pro))/);

    vi.doMock("@playwright/test", () => {
      throw new Error("React helpers must not load Playwright");
    });
    vi.resetModules();

    await expect(import("@odyssey/web-testkit/react")).resolves.toMatchObject({
      render: expect.any(Function),
      screen: expect.any(Object),
      userEvent: expect.any(Object),
    });

    vi.doUnmock("@playwright/test");
    vi.resetModules();
  });

  it("resolves each documented test-only subpath and has no aggregate root export", async () => {
    const vitestSource = readFileSync("src/vitest.ts", "utf8");
    expect(vitestSource).not.toMatch(/from ["'](?:node:|@playwright\/test)/);

    const [react, accessibility, setup, vitest, playwright, fixtures] = await Promise.all([
      import("@odyssey/web-testkit/react"),
      import("@odyssey/web-testkit/accessibility"),
      import("@odyssey/web-testkit/setup/react"),
      import("@odyssey/web-testkit/vitest"),
      import("@odyssey/web-testkit/playwright"),
      import("@odyssey/web-testkit/fixtures"),
    ]);

    expect(typeof react.renderWithProviders).toBe("function");
    expect(typeof accessibility.extendAccessibilityMatchers).toBe("function");
    expect(setup).toBeDefined();
    expect(typeof vitest.createReactVitestConfig).toBe("function");
    expect(typeof playwright.createPlaywrightConfig).toBe("function");
    expect(typeof fixtures.createRequestBoundary).toBe("function");
    expect(packageManifest.exports["."]).toBeUndefined();
  });
});
