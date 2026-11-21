import { createI18n } from "@odyssey/ui/i18n";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DocsApp, type DocsCatalog } from "./DocsApp";

const catalog: DocsCatalog = {
  defaultDocId: "intro",
  docAssets: {},
  docPaths: { guide: "guide", intro: "intro" },
  docRoutes: { guide: "guide", intro: "intro" },
  docs: [
    {
      content: "# Intro\n\nWelcome.",
      extension: "md",
      frontmatter: {},
      id: "intro",
      outline: [],
      path: "intro.md",
      title: "Intro",
    },
    {
      content: "# Guide\n\nHome.",
      extension: "md",
      frontmatter: {},
      id: "guide",
      outline: [],
      path: "guide.md",
      title: "Guide",
    },
  ],
  homeDocId: "guide",
  navbar: [{ docId: "intro", label: "Intro", sidebarRoot: "intro" }],
  navTree: [{ docId: "intro", key: "intro", label: "Intro", order: 0, type: "doc" }],
  siteConfig: {
    basePath: "/docs",
    docsDir: "docs",
    title: "Docs",
  },
};

describe("DocsApp", () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");
    window.history.replaceState(null, "", "/");
  });

  it("persists compact density through the Odyssey appearance menu", async () => {
    const user = userEvent.setup();

    render(<DocsApp catalog={catalog} />);

    await user.click(screen.getByRole("button", { name: "外观设置" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "紧凑" }));

    const stored = localStorage.getItem("odyssey:docs:appearance");
    expect(stored).toContain('"density":"compact"');
  });

  it("offers the shared user actions menu when session props are provided", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn().mockResolvedValue(undefined);

    render(<DocsApp catalog={catalog} onLogout={onLogout} username="alice" />);

    await user.click(screen.getByRole("button", { name: "用户菜单" }));
    await user.click(await screen.findByRole("menuitem", { name: "退出登录" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("navigates to the site home doc when clicking the header brand", async () => {
    const user = userEvent.setup();

    render(<DocsApp catalog={catalog} />);

    const brandButton = screen.getAllByRole("button", { name: "Docs" })[0];
    if (!brandButton) throw new Error("Docs brand button was not rendered");
    await user.click(brandButton);

    expect(screen.getByRole("heading", { level: 1, name: "Guide" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/docs/guide");
  });

  it("selects the English docs locale from the supplied i18n instance", async () => {
    const { instance, ready } = createI18n({ fallbackLng: "en", resources: { en: { common: {} } } });
    await ready;
    await instance.changeLanguage("en-US");
    render(<DocsApp catalog={catalog} i18n={instance} />);
    expect(screen.getByRole("button", { name: "Appearance" })).toBeInTheDocument();
  });

  it("renders on the server without accessing browser globals", () => {
    expect(() => renderToString(<DocsApp catalog={catalog} />)).not.toThrow();
  });
});
