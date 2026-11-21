import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Prose } from "./Prose";

describe("Prose", () => {
  it("styles caller-owned trusted content without accepting an HTML API", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Prose ref={ref}>
        <h2>Article</h2>
        <p>Body</p>
      </Prose>,
    );
    expect(ref.current).toHaveAttribute("data-od-slot", "prose");
    expect(screen.getByRole("heading", { name: "Article" })).toBeInTheDocument();
  });
});
