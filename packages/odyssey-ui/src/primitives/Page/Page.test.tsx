import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Page, PageActions, PageContent, PageDescription, PageHeader, PageTitle } from "./Page";

describe("Page", () => {
  it("provides semantic page anatomy", () => {
    const { container } = render(
      <Page>
        <PageHeader>
          <PageTitle>Stores</PageTitle>
          <PageDescription>Manage stores</PageDescription>
        </PageHeader>
        <PageContent>Content</PageContent>
      </Page>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Stores" })).toBeVisible();
    expect(container.querySelector('[data-od-slot="page-content"]')).toHaveTextContent("Content");
  });

  it("composes responsive page actions with refs and native attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PageHeader>
        <PageTitle>Stores</PageTitle>
        <PageDescription>Manage stores</PageDescription>
        <PageActions ref={ref} aria-label="Page actions">
          <button type="button">Add</button>
        </PageActions>
      </PageHeader>,
    );
    expect(ref.current).toBe(screen.getByLabelText("Page actions"));
    expect(ref.current).toHaveAttribute("data-od-slot", "page-actions");
    expect(screen.getByRole("button", { name: "Add" })).toHaveAttribute("type", "button");
  });
});
