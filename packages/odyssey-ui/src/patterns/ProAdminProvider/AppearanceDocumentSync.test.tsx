import { render, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppearanceDocumentSync } from "./AppearanceDocumentSync";
import { createAppearanceBootstrapScript } from "./appearance-bootstrap";
import { ProAdminProvider } from "./ProAdminProvider";

it("reveals content after the saved dark appearance is restored", async () => {
  const options = { storageKey: "sync-test", lightBackground: "#ffffff", darkBackground: "#000000" };
  localStorage.setItem(options.storageKey, JSON.stringify({ colorScheme: "dark" }));
  vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  new Function(createAppearanceBootstrapScript(options))();
  const view = render(
    <ProAdminProvider appearance={{ storageKey: options.storageKey }}>
      <AppearanceDocumentSync {...options} />
      <span>content</span>
    </ProAdminProvider>,
  );
  await waitFor(() => expect(document.documentElement.dataset.odAppearancePending).toBeUndefined());
  expect(view.container.querySelector("[data-od-root]")?.getAttribute("data-od-resolved-color-scheme")).toBe("dark");
  expect(document.documentElement.dataset.odAppearanceScheme).toBe("dark");
});

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("style");
  delete document.documentElement.dataset.odAppearanceScheme;
  delete document.documentElement.dataset.odAppearancePending;
});
