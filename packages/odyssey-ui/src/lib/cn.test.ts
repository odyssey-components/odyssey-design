import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("combines conditional classes and resolves conflicting Tailwind utilities in favor of later inputs", () => {
    expect(cn("px-2 text-sm", false && "hidden", ["bg-primary"], "px-4 text-base")).toBe("bg-primary px-4 text-base");
  });
});
