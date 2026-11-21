import type { PropsWithChildren } from "react";
import { renderWithProviders, screen, userEvent } from "./react";

describe("renderWithProviders", () => {
  it("composes providers outer-to-inner and keeps user-visible interaction real", async () => {
    const clicked = vi.fn();
    function Outer({ children }: PropsWithChildren) {
      return <section data-testid="outer">{children}</section>;
    }
    function Inner({ children }: PropsWithChildren) {
      return <div data-testid="inner">{children}</div>;
    }

    renderWithProviders(
      <button type="button" onClick={clicked}>
        Save
      </button>,
      { providers: [Outer, Inner] },
    );

    const outer = screen.getByTestId("outer");
    expect(outer.firstElementChild).toHaveAttribute("data-testid", "inner");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("composes an explicit consumer wrapper inside the requested providers", () => {
    function Outer({ children }: PropsWithChildren) {
      return <section data-testid="outer">{children}</section>;
    }
    function ConsumerWrapper({ children }: PropsWithChildren) {
      return <aside data-testid="consumer-wrapper">{children}</aside>;
    }

    renderWithProviders(<p>Ready</p>, { providers: [Outer], wrapper: ConsumerWrapper });

    const outer = screen.getByTestId("outer");
    expect(outer.querySelector("[data-testid='consumer-wrapper']")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
