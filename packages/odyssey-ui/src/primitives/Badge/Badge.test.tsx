import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

it("renders badge content and slot", () => {
  render(<Badge>Beta</Badge>);
  expect(screen.getByText("Beta")).toHaveAttribute("data-od-slot", "badge");
});

it("uses static utilities and merges consumer class overrides", () => {
  render(
    <Badge className="px-4 rounded-none" tone="success">
      Ready
    </Badge>,
  );
  const badge = screen.getByText("Ready");
  expect(badge).toHaveClass("inline-flex", "px-4", "rounded-none");
  expect(badge.className).not.toContain("--od-space-2");
  expect(badge).toHaveAttribute("data-tone", "success");
});
