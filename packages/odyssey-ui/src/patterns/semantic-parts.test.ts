import { describe, expect, it } from "vitest";
import { defineProSemanticParts, semanticPartProps, semanticSlot } from "./semantic-parts";

describe("Pro semantic part descriptors", () => {
  it("keeps type keys and runtime slots in one immutable contract", () => {
    const parts = defineProSemanticParts({ root: "pro-example", label: "pro-example-label" });
    expect(semanticSlot(parts, "label")).toBe("pro-example-label");
    expect(Object.isFrozen(parts)).toBe(true);
    expect(semanticPartProps("label", { label: "custom" }, { label: { opacity: 0.5 } })).toEqual({ className: "custom", style: { opacity: 0.5 } });
  });

  it("rejects duplicate DOM slot registrations", () => {
    expect(() => defineProSemanticParts({ first: "pro-example", second: "pro-example" })).toThrow(/duplicate/);
  });
});
