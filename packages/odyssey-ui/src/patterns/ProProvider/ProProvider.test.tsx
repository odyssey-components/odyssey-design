import { odysseyLocales } from "@odyssey/ui/locale";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { render, screen } from "@testing-library/react";
import { proLocales, useProLocale } from "../locale";
import { ProProvider } from "./ProProvider";

function Probe() {
  return <span>{useProLocale().form.submit}</span>;
}

describe("ProProvider", () => {
  it("uses an explicit locale", () => {
    render(
      <ProProvider locale={proLocales.enUS}>
        <Probe />
      </ProProvider>,
    );
    expect(screen.getByText("Submit")).toBeVisible();
  });

  it("inherits the Odyssey locale", () => {
    render(
      <OdysseyProvider locale={odysseyLocales.enUS}>
        <Probe />
      </OdysseyProvider>,
    );
    expect(screen.getByText("Submit")).toBeVisible();
  });
});
