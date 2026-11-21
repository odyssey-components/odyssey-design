import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createDocsLocale, DocsLocaleContext, docsLocales, useDocsLocale } from "./locale";

function Probe() {
  const locale = useDocsLocale();
  return <span>{locale.appearance.label}</span>;
}

describe("Docs locale", () => {
  it("defaults to zh-CN", () => {
    render(<Probe />);
    expect(screen.getByText("外观设置")).toBeInTheDocument();
  });

  it("supports typed overrides without mutating the base locale", () => {
    const locale = createDocsLocale(docsLocales.enUS, { appearance: { label: "Display" } });
    render(
      <DocsLocaleContext.Provider value={locale}>
        <Probe />
      </DocsLocaleContext.Provider>,
    );
    expect(screen.getByText("Display")).toBeInTheDocument();
    expect(docsLocales.enUS.appearance.label).toBe("Appearance");
  });
});
