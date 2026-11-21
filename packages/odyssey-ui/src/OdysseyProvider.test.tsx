import { createI18n } from "@odyssey/i18n";
import { act, render, screen } from "@testing-library/react";
import { useOdysseyLocale } from "./locale";
import { OdysseyProvider, useOdysseyTheme } from "./OdysseyProvider";
import { createOdysseyTheme, odysseyThemes } from "./theme";

function Probe() {
  const theme = useOdysseyTheme();
  return <span>{`${theme.name}:${theme.resolvedColorScheme}:${theme.density}`}</span>;
}

function LocaleProbe() {
  return <span>{useOdysseyLocale().spinner.loading}</span>;
}

describe("OdysseyProvider", () => {
  it("exposes runtime theme attributes and context", () => {
    render(
      <OdysseyProvider theme={odysseyThemes.shadcn} colorScheme="dark" density="compact">
        <Probe />
      </OdysseyProvider>,
    );
    const root = document.querySelector("[data-od-root]");
    expect(root).toHaveAttribute("data-od-theme", "shadcn");
    expect(root).toHaveAttribute("data-od-resolved-color-scheme", "dark");
    expect(screen.getByText("shadcn:dark:compact")).toBeInTheDocument();
  });

  it("publishes resolved semantic CSS variables on the provider root", () => {
    render(
      <OdysseyProvider theme={odysseyThemes.shadcn} colorScheme="light" density="standard">
        <Probe />
      </OdysseyProvider>,
    );
    const root = document.querySelector<HTMLElement>("[data-od-root]");
    expect(root?.style.getPropertyValue("--od-background")).toBe("oklch(1 0 0)");
    expect(root?.style.getPropertyValue("--od-primary")).toBe("oklch(0.205 0 0 / 1)");
    expect(root).toHaveAttribute("data-od-density", "standard");
  });

  it("updates when the theme object changes", () => {
    const first = createOdysseyTheme("brand-a", {}, odysseyThemes.shadcn);
    const second = createOdysseyTheme("brand-b", {}, odysseyThemes.shadcn);
    const view = render(
      <OdysseyProvider theme={first}>
        <Probe />
      </OdysseyProvider>,
    );
    expect(document.querySelector("[data-od-root]")).toHaveAttribute("data-od-theme", "brand-a");
    view.rerender(
      <OdysseyProvider theme={second}>
        <Probe />
      </OdysseyProvider>,
    );
    expect(document.querySelector("[data-od-root]")).toHaveAttribute("data-od-theme", "brand-b");
  });

  it("defaults to zh-CN and follows the supplied i18n instance", async () => {
    const { instance, ready } = createI18n({ fallbackLng: "zh", resources: { zh: { common: {} }, en: { common: {} } } });
    await ready;
    await instance.changeLanguage("zh");
    const view = render(
      <OdysseyProvider i18n={instance}>
        <LocaleProbe />
      </OdysseyProvider>,
    );
    expect(screen.getByText("加载中")).toBeVisible();
    await act(() => instance.changeLanguage("en"));
    expect(screen.getByText("Loading")).toBeVisible();
    view.unmount();
  });
});
