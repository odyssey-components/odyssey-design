import { describe, expect, it } from "vitest";
import { createOdysseyAIClient } from "../src/client";

describe("createOdysseyAIClient", () => {
  it("creates an immutable same-origin client without exposing a model key", () => {
    const client = createOdysseyAIClient({ endpoint: "/api/ai/chat" });
    expect(client.config.credentials).toBe("same-origin");
    expect(client.config.endpoint).toBe("/api/ai/chat");
    expect(Object.isFrozen(client)).toBe(true);
  });

  it("requires an endpoint", () => {
    expect(() => createOdysseyAIClient({ endpoint: "" })).toThrow("endpoint is required");
  });
});
