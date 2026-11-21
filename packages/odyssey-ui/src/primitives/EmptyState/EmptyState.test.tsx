import { render, screen } from "@testing-library/react";
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "./EmptyState";

it("exposes empty state anatomy", () => {
  render(
    <EmptyState>
      <EmptyStateTitle>Empty</EmptyStateTitle>
      <EmptyStateDescription>No records</EmptyStateDescription>
    </EmptyState>,
  );
  expect(screen.getByText("Empty")).toHaveAttribute("data-od-slot", "empty-state-title");
});
