import { toHaveNoViolations } from "jest-axe";
import { expect as vitestExpect } from "vitest";
import { extendAccessibilityMatchers } from "./accessibility";

describe("extendAccessibilityMatchers", () => {
  it("registers the shared axe matcher on the consumer's expect instance", () => {
    const extend = vi.spyOn(vitestExpect, "extend");
    extendAccessibilityMatchers();

    expect(extend).toHaveBeenCalledWith(toHaveNoViolations);
  });
});
