# `@odyssey/web-testkit`

Repository-owned, test-only helpers for Odyssey Web packages. Keep using each product's existing Vitest and Playwright runner; the TestKit centralizes reusable setup and mechanics, not product scenarios or result verdicts.

## Component tests

```ts
// vitest.config.ts
import { createReactVitestConfig } from "@odyssey/web-testkit/vitest";

export default createReactVitestConfig({
  test: { include: ["src/**/*.{test,spec}.{ts,tsx}"] },
});
```

The config supplies the shared JSDOM setup and React plugin. Consumers may append local setup and override defaults:

```ts
export default createReactVitestConfig({
  test: { setupFiles: ["./src/test/product-setup.ts"], environmentOptions: { jsdom: { url: "http://localhost/" } } },
});
```

The shared setup installs jest-dom and generic `ResizeObserver`/`elementFromPoint` behavior. Product-only storage, service mocks, and providers stay local. Consumers that use axe assertions opt in:

```ts
// src/test/setup.ts
import { extendAccessibilityMatchers } from "@odyssey/web-testkit/accessibility";

extendAccessibilityMatchers();
```

Component tests can compose their own contexts without importing product providers into the shared package:

```tsx
import { renderWithProviders, screen, userEvent } from "@odyssey/web-testkit/react";

renderWithProviders(<SaveButton />, { providers: [ThemeProvider, LocaleProvider] });
await userEvent.click(screen.getByRole("button", { name: "Save" }));
```

## Browser tests and owned cleanup

```ts
// playwright.config.ts
import { createPlaywrightConfig } from "@odyssey/web-testkit/playwright";

export default createPlaywrightConfig({
  testDir: "./e2e",
  baseURL: process.env.APP_ORIGIN ?? "http://127.0.0.1:4173",
  outputDir: process.env.TEST_OUTPUT_DIRECTORY ?? ".artifacts/run",
  use: { browserName: "chromium" },
});
```

The consumer supplies its origin, output directory, test selection, metadata, and any server lifecycle. Defaults disable automatic screenshot/video/trace collection, retries, and parallel workers; consumers may override test-run settings explicitly.

Register only resources created by the current test:

```ts
import { withResourceScope } from "@odyssey/web-testkit/playwright";

await withResourceScope(async (resources) => {
  const browser = await chromium.launch();
  resources.defer(() => browser.close(), { label: "owned browser" });
  // Continue the product-owned journey.
});
```

## Request boundary and fixtures

`@odyssey/web-testkit/fixtures` exposes a same-origin/request allowlist boundary, a bounded sanitized ledger, and an allowlisted projection helper. It records method, normalized origin/path, status, and safe reason codes only. It never stores request or response bodies, headers, credentials, query strings, or page content.

Products continue to define endpoint declarations, fixture responses, scenario state, authentication behavior, backend topology, business oracles, and product-specific evidence fields. A shared boundary can reject and record an unexpected request; the product's existing route handler decides its domain response.

## Public subpaths

- `@odyssey/web-testkit/react`: component helpers; safe to import from a browser-oriented test module.
- `@odyssey/web-testkit/accessibility`: opt-in axe matcher setup.
- `@odyssey/web-testkit/setup/react`: shared Vitest/JSDOM setup file.
- `@odyssey/web-testkit/vitest`: Node-side Vitest config factory.
- `@odyssey/web-testkit/playwright`: Node/Playwright config and resource lifecycle helpers.
- `@odyssey/web-testkit/fixtures`: request isolation, ledger, and allowlisted projection.

There is no aggregate root export. Product runtime code must not import this package.
