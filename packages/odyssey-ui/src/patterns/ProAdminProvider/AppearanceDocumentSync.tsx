import { useLayoutEffect } from "react";
import type { AppearanceBootstrapOptions } from "./appearance-bootstrap";
import { useProAdminAppearance } from "./ProAdminProvider";

export function AppearanceDocumentSync({ lightBackground, darkBackground }: AppearanceBootstrapOptions) {
  const { colorScheme } = useProAdminAppearance();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const sync = () => {
      const app = document.querySelector<HTMLElement>("[data-od-root]");
      const actual = app?.dataset.odResolvedColorScheme;
      const pending = root.dataset.odAppearancePending === "true";
      if (pending && actual !== root.dataset.odAppearanceScheme) return;
      const dark = colorScheme === "dark" || (colorScheme === "system" && !!media?.matches);
      // Use the provider's applied scheme, avoiding changes before React commits it.
      const resolved = actual || (dark ? "dark" : "light");
      root.dataset.odAppearanceScheme = resolved;
      root.style.colorScheme = resolved;
      root.style.backgroundColor = resolved === "dark" ? darkBackground : lightBackground;
      const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      if (meta) meta.content = resolved === "dark" ? darkBackground : lightBackground;
      delete root.dataset.odAppearancePending;
    };
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ["data-od-resolved-color-scheme"] });
    sync();
    media?.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      media?.removeEventListener("change", sync);
    };
  }, [colorScheme, lightBackground, darkBackground]);
  return null;
}
