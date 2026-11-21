import { odysseyLocales } from "@odyssey/ui/locale";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OdysseyAILocaleProvider, odysseyAILocales, useOdysseyAILocale } from "../src/locale";

function Probe() {
  return <span>{useOdysseyAILocale().composer.send}</span>;
}

afterEach(cleanup);

describe("Odyssey AI locale", () => {
  it("inherits the UI language", () => {
    render(
      <OdysseyProvider locale={odysseyLocales.enUS}>
        <Probe />
      </OdysseyProvider>,
    );
    expect(screen.getByText("Send")).toBeTruthy();
  });

  it("allows an explicit AI locale override", () => {
    render(
      <OdysseyAILocaleProvider locale={odysseyAILocales.enUS}>
        <Probe />
      </OdysseyAILocaleProvider>,
    );
    expect(screen.getByText("Send")).toBeTruthy();
  });
});
