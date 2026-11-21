import { describe, expect, it } from "vitest";
import { defineOdysseyCatalog, odysseyCatalog } from "./catalog";

function catalogItem(index: number) {
  const item = odysseyCatalog[index];
  if (!item) throw new Error(`Missing catalog fixture at ${index}`);
  return item;
}

describe("Odyssey catalog", () => {
  it("contains unique components and demos", () => {
    expect(odysseyCatalog.length).toBeGreaterThan(0);
    expect(new Set(odysseyCatalog.map((item) => item.name)).size).toBe(odysseyCatalog.length);
  });

  it("publishes documentation and customization contracts", () => {
    for (const item of odysseyCatalog) {
      expect(item.since).toMatch(/^\d+\.\d+\.\d+$/);
      expect(item.parts.length).toBeGreaterThan(0);
      expect(item.states.length).toBeGreaterThan(0);
      expect(item.tokens.every((token) => token.startsWith("--od-"))).toBe(true);
    }
  });

  it("rejects duplicate component names", () => {
    const item = catalogItem(0);
    expect(() => defineOdysseyCatalog([item, item])).toThrow(/Duplicate Odyssey component/);
  });

  it("rejects duplicate demo ids", () => {
    const first = catalogItem(0);
    const second = catalogItem(1);
    const demoId = first.demoIds[0];
    if (!demoId) throw new Error("Missing demo fixture");
    expect(() => defineOdysseyCatalog([first, { ...second, demoIds: [demoId] }])).toThrow(/Duplicate Odyssey demo/);
  });
});
