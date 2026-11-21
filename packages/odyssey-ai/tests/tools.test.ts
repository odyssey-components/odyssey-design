import { describe, expect, it, vi } from "vitest";
import { defineClientTool } from "../src/tool";

describe("defineClientTool", () => {
  it("requires approval by default", () => {
    const tool = defineClientTool({ name: "archive", execute: vi.fn() });
    expect(tool.requiresApproval).toBe(true);
  });

  it("allows explicitly safe automatic tools", () => {
    const tool = defineClientTool({ name: "lookup", requiresApproval: false, execute: vi.fn() });
    expect(tool.requiresApproval).toBe(false);
  });
});
