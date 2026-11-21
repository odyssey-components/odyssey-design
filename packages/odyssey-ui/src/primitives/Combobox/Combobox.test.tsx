import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPortal, ComboboxPositioner } from "./Combobox";

describe("Combobox", () => {
  it("supports keyboard selection", () => {
    render(
      <Combobox items={["Apple", "Banana"]} defaultValue="Apple">
        <ComboboxInput aria-label="Fruit" />
        <ComboboxPortal>
          <ComboboxPositioner>
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="Apple">Apple</ComboboxItem>
                <ComboboxItem value="Banana">Banana</ComboboxItem>
                <ComboboxEmpty>Empty</ComboboxEmpty>
              </ComboboxList>
            </ComboboxContent>
          </ComboboxPositioner>
        </ComboboxPortal>
      </Combobox>,
    );
    const input = screen.getByLabelText("Fruit");
    expect(input).toHaveValue("Apple");
  });

  it("supports content and custom popup widths independently of the input", () => {
    const contentRef = createRef<HTMLDivElement>();
    render(
      <Combobox open items={["A very long option"]}>
        <ComboboxInput aria-label="Options" style={{ inlineSize: "9rem" }} />
        <ComboboxPortal>
          <ComboboxPositioner>
            <ComboboxContent ref={contentRef} width="clamp(12rem, 40vw, 24rem)">
              <ComboboxList>
                <ComboboxItem value="A very long option">A very long option</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </ComboboxPositioner>
        </ComboboxPortal>
      </Combobox>,
    );

    // jsdom 30 resolves logical properties in the computed style to a used value,
    // so the declared inline value is what these assertions check.
    expect(screen.getByLabelText("Options").style.inlineSize).toBe("9rem");
    expect(contentRef.current).toHaveAttribute("data-width", "custom");
    expect(contentRef.current?.style.inlineSize).toBe("clamp(12rem, 40vw, 24rem)");
    expect(contentRef.current).toHaveClass("od-Combobox-content");
  });

  it.each([
    [undefined, "trigger"],
    ["content" as const, "content"],
  ])("maps width %s to the %s popup mode", (width, mode) => {
    render(
      <Combobox open items={["one"]}>
        <ComboboxInput aria-label="Option" />
        <ComboboxPortal>
          <ComboboxPositioner>
            <ComboboxContent width={width} data-testid="sized-combobox-popup">
              <ComboboxList>
                <ComboboxItem value="one">One</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </ComboboxPositioner>
        </ComboboxPortal>
      </Combobox>,
    );
    expect(document.querySelector('[data-testid="sized-combobox-popup"]')).toHaveAttribute("data-width", mode);
  });
});
