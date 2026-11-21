import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DocOutline } from "./DocOutline";

describe("DocOutline", () => {
  it("marks the active heading link", () => {
    render(
      <DocOutline
        activeHeadingId="section-two"
        outline={[
          { depth: 2, id: "section-one", text: "Section One" },
          { depth: 2, id: "section-two", text: "Section Two" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Section Two" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "Section Two" })).toHaveAttribute("aria-current", "true");
  });

  it("adds heading depth classes for indentation", () => {
    render(<DocOutline outline={[{ depth: 4, id: "deep-section", text: "Deep Section" }]} />);

    expect(screen.getByRole("link", { name: "Deep Section" }).closest(".od-Docs-outlineItem")).toHaveAttribute("data-depth", "4");
  });
});
