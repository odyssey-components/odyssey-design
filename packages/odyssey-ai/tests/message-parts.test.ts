import { describe, expect, it } from "vitest";
import { appendTextDelta } from "../src/messageMapping";
import type { MessagePart } from "../src/types";

describe("text delta part preservation", () => {
  it("appends to the last text part without dropping non-text parts", () => {
    const data = { type: "data" as const, name: "file-change", value: { path: "a.txt" } };
    const result = {
      type: "tool-result" as const,
      toolCallId: "tool-1",
      output: { ok: true },
      state: "output-available" as const,
    };
    const parts: readonly MessagePart[] = [{ type: "text", text: "A" }, data, { type: "text", text: "B" }, result];

    const next = appendTextDelta(parts, "C");

    expect(next.map((part) => part.type)).toEqual(["text", "data", "text", "tool-result"]);
    expect(next[2]).toEqual({ type: "text", text: "BC" });
    expect(next[1]).toBe(data);
    expect(next[3]).toBe(result);
    expect(parts[2]).toEqual({ type: "text", text: "B" });
  });

  it("creates a text part without replacing an existing attachment", () => {
    const attachment = { type: "attachment" as const, mediaType: "document" as const, url: "/a.txt" };
    const next = appendTextDelta([attachment], "hello");

    expect(next).toEqual([attachment, { type: "text", text: "hello" }]);
    expect(next[0]).toBe(attachment);
  });
});
