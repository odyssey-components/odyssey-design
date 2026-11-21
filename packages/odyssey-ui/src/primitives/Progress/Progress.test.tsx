import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("exposes progress semantics", () => {
    render(<Progress value={25} max={50} label="完成度" />);
    const progress = screen.getByRole("progressbar");
    expect(progress.getAttribute("aria-valuenow")).toBe("25");
    expect(screen.getByText("50%")).toBeTruthy();
  });
});
