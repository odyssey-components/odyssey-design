import { toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

declare module "vitest" {
  // Vitest 5 dropped the jest namespace from its assertion chain, so the
  // augmentation @types/jest-axe ships no longer reaches vitest. Matchers is
  // the extension point Vitest 5 documents for custom matchers.
  interface Matchers<R extends void | Promise<void> = void | Promise<void>, T = unknown> {
    toHaveNoViolations(): R;
  }
}

export function extendAccessibilityMatchers(): void {
  expect.extend(toHaveNoViolations);
}
