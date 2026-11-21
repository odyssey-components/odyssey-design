import { afterEach, describe, expect, it, vi } from "vitest";
import { createAppearanceBootstrapScript } from "./appearance-bootstrap";

const options = { storageKey: "bootstrap-test", lightBackground: "#ffffff", darkBackground: "#000000" };
function run() {
  new Function(createAppearanceBootstrapScript(options))();
}
afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("style");
  delete document.documentElement.dataset.odAppearancePending;
  delete document.documentElement.dataset.odAppearanceScheme;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
describe("appearance bootstrap", () => {
  it.each([
    ["dark", "dark"],
    ["light", "light"],
    ["system", "dark"],
  ])("resolves %s to %s", (saved, expected) => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    localStorage.setItem(options.storageKey, JSON.stringify({ colorScheme: saved }));
    run();
    expect(document.documentElement.dataset.odAppearanceScheme).toBe(expected);
    expect(document.documentElement.dataset.odAppearancePending).toBe("true");
  });
  it("falls back to the configured default for invalid storage", () => {
    localStorage.setItem(options.storageKey, "{");
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    run();
    expect(document.documentElement.dataset.odAppearanceScheme).toBe("light");
  });
  it("does not embed script closing tags from configuration", () => {
    expect(createAppearanceBootstrapScript({ ...options, storageKey: "</script><script>" })).not.toContain("</script");
  });
  it("uses the default when storage is unavailable and eventually reveals the page", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    run();
    expect(document.documentElement.dataset.odAppearanceScheme).toBe("light");
    expect(document.documentElement.dataset.odAppearancePending).toBe("true");
    vi.advanceTimersByTime(5000);
    expect(document.documentElement.dataset.odAppearancePending).toBeUndefined();
  });
});
