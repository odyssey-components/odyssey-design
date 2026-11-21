import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { NavNode } from "../docs/types";
import { DocNavigation } from "./DocNavigation";

describe("DocNavigation", () => {
  it("navigates when clicking a category title that has a page", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const navTree: NavNode[] = [
      {
        children: [
          {
            docId: "guide/details",
            key: "guide/details",
            label: "Details",
            order: 1,
            type: "doc",
          },
        ],
        docId: "guide/index",
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ];

    render(<DocNavigation navTree={navTree} onSelect={onSelect} />);

    await user.click(screen.getByText("Guide"));

    expect(onSelect).toHaveBeenCalledWith("guide/index");
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("toggles expansion without navigating when clicking the submenu arrow area", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const navTree: NavNode[] = [
      {
        children: [
          {
            docId: "guide/details",
            key: "guide/details",
            label: "Details",
            order: 1,
            type: "doc",
          },
        ],
        docId: "guide/index",
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ];

    render(<DocNavigation navTree={navTree} onSelect={onSelect} />);
    const toggle = screen.getByRole("button", { expanded: true, name: "Guide" });
    expect(screen.getByText("Details")).toBeInTheDocument();

    await user.click(toggle);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });

  it("toggles expansion when clicking a category title without a page", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const navTree: NavNode[] = [
      {
        children: [
          {
            docId: "guide/details",
            key: "guide/details",
            label: "Details",
            order: 1,
            type: "doc",
          },
        ],
        key: "guide",
        label: "Guide",
        order: 1,
        type: "category",
      },
    ];

    render(<DocNavigation navTree={navTree} onSelect={onSelect} />);

    expect(screen.getByText("Details")).toBeInTheDocument();

    const categoryAction = screen.getAllByRole("button", { name: "Guide" }).find((button) => button.classList.contains("od-Docs-navigationAction"));
    if (!categoryAction) throw new Error("Category action was not rendered");
    await user.click(categoryAction);

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText("Details")).not.toBeInTheDocument();
  });
});
