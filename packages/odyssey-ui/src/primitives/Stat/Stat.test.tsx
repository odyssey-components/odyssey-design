import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat, StatDescription, StatLabel, StatValue } from "./Stat";

describe("Stat", () => {
  it("provides stable metric anatomy", () => {
    render(
      <Stat>
        <StatLabel>Sources</StatLabel>
        <StatValue>64</StatValue>
        <StatDescription>Active feeds</StatDescription>
      </Stat>,
    );
    expect(screen.getByText("64")).toHaveAttribute("data-od-slot", "stat-value");
    expect(screen.getByText("Sources")).toHaveAttribute("data-od-slot", "stat-label");
  });
});
