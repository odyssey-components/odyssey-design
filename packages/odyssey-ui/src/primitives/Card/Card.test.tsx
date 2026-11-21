import { render, screen } from "@testing-library/react";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";

describe("Card", () => {
  it("exposes stable compound anatomy while preserving simple children", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Recent project activity</CardDescription>
          <CardAction>Manage</CardAction>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Workspace")).toBeVisible();
    for (const slot of ["card", "card-header", "card-title", "card-description", "card-action", "card-content", "card-footer"])
      expect(container.querySelector(`[data-od-slot="${slot}"]`)).toBeInTheDocument();
  });

  it("supports title-only and title-with-description headers", () => {
    const { container } = render(
      <>
        <Card>
          <CardHeader>
            <CardTitle>Title only</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>With description</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      </>,
    );
    expect(container.querySelectorAll('[data-od-slot="card-header"]')).toHaveLength(2);
    expect(screen.getByText("Title only")).toBeVisible();
    expect(screen.getByText("Description")).toBeVisible();
  });

  it("marks hoverable cards without inventing interaction semantics", () => {
    render(
      <Card hoverable data-testid="hover-card">
        Preview
      </Card>,
    );
    const card = screen.getByTestId("hover-card");
    expect(card).toHaveAttribute("data-hoverable", "true");
    expect(card).not.toHaveAttribute("role");
    expect(card).not.toHaveAttribute("tabindex");
  });

  it("uses a hover-only utility variant when hoverable is enabled", () => {
    const { rerender } = render(
      <Card hoverable data-testid="card">
        Preview
      </Card>,
    );
    const card = screen.getByTestId("card");

    expect(card).toHaveClass("bg-[var(--od-card)]", "[@media(hover:hover)]:hover:-translate-y-[2px]");

    // The hover treatment is opt-in, so a card that does not ask for it keeps
    // the resting look.
    rerender(<Card data-testid="card">Preview</Card>);
    expect(card).not.toHaveAttribute("data-hoverable");
    expect(card.className).not.toContain("hover:-translate-y-[2px]");
  });

  it("keeps the header divider only when the card has a body below it", () => {
    const { container: metric } = render(
      <Card>
        <CardHeader>
          <CardTitle>Metric</CardTitle>
        </CardHeader>
      </Card>,
    );
    const metricHeader = metric.querySelector('[data-od-slot="card-header"]')!;
    expect(metricHeader.matches(":last-child")).toBe(true);
    expect(metricHeader).toHaveClass("last:border-b-0");

    const { container: detailed } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    const detailedHeader = detailed.querySelector('[data-od-slot="card-header"]')!;
    expect(detailedHeader.matches(":last-child")).toBe(false);
  });

  it("composes header, title and footer spacing from token utilities", () => {
    render(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter data-testid="footer">Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByTestId("header")).toHaveClass("grid", "grid-auto-rows-[min-content]", "pb-[var(--od-card-header-padding-block-end)]");
    expect(screen.getByTestId("title")).toHaveClass("leading-none", "text-[length:var(--od-font-size-lg)]");
    expect(screen.getByTestId("footer")).toHaveClass("pt-[var(--od-card-footer-padding-block-start)]");
  });
});
