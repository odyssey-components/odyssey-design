import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { OdysseyProvider } from "../../OdysseyProvider";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNextButton,
  PaginationNextLink,
  PaginationPreviousLink,
  PaginationStatus,
} from "./Pagination";

describe("Pagination", () => {
  it("renders semantic link and button anatomy with refs and native props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <OdysseyProvider>
        <Pagination ref={ref} aria-label="Results" data-testid="pagination">
          <PaginationContent>
            <PaginationItem>
              <PaginationPreviousLink href="/page/1" />
            </PaginationItem>
            <PaginationItem collapsible>
              <PaginationLink href="/page/2" current>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem collapsible>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationStatus>Page 2 of 4</PaginationStatus>
            </PaginationItem>
            <PaginationItem>
              <PaginationNextButton>Next</PaginationNextButton>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </OdysseyProvider>,
    );
    expect(ref.current).toBe(screen.getByRole("navigation", { name: "Results" }));
    expect(screen.getByRole("link", { name: "上一页" })).toHaveAttribute("href", "/page/1");
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "下一页" })).toHaveAttribute("type", "button");
    expect(screen.getByText("Page 2 of 4")).toHaveAttribute("aria-live", "polite");
    expect(document.querySelector('[data-collapsible="true"]')).toBeInTheDocument();
  });

  it("removes disabled links from navigation and exposes simple responsive state", () => {
    render(
      <Pagination simple responsive size="lg">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1" disabled>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationButton current>2</PaginationButton>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const disabled = screen.getByText("1");
    expect(disabled).not.toHaveAttribute("href");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-simple", "true");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-responsive", "true");
    expect(screen.getByRole("navigation")).toHaveAttribute("data-size", "lg");
  });
  it("keeps the selected and the disabled control distinguishable in one state matrix", () => {
    render(
      <OdysseyProvider>
        <Pagination aria-label="Results">
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" disabled>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2" current>
                2
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </OdysseyProvider>,
    );
    const selected = screen.getByRole("link", { name: "2" });
    const disabled = screen.getByText("1");
    expect(selected).toHaveAttribute("aria-current", "page");
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(selected).not.toHaveAttribute("aria-disabled");
  });

  it("does not invoke link callbacks while disabled", () => {
    const disabled = vi.fn();
    const previous = vi.fn();
    const next = vi.fn();
    const enabled = vi.fn();

    render(
      <OdysseyProvider>
        <>
          <PaginationLink disabled onClick={disabled}>
            Disabled
          </PaginationLink>
          <PaginationPreviousLink disabled onClick={previous} />
          <PaginationNextLink disabled onClick={next} />
          <PaginationLink onClick={enabled}>Enabled</PaginationLink>
        </>
      </OdysseyProvider>,
    );

    fireEvent.click(screen.getByText("Disabled"));
    fireEvent.click(screen.getByText("上一页"));
    fireEvent.click(screen.getByText("下一页"));
    fireEvent.click(screen.getByText("Enabled"));

    expect(disabled).not.toHaveBeenCalled();
    expect(previous).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(enabled).toHaveBeenCalledTimes(1);
  });

  it("keeps the keyboard focus visible without relying on colour alone", async () => {
    const user = userEvent.setup();
    render(
      <Pagination aria-label="Results">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const link = screen.getByRole("link", { name: "1" });

    await user.tab();
    expect(link).toHaveFocus();

    // The official focus paint is a spread halo — the ring at half its
    // opacity — so the focus ring is a shadow that carries a width of its
    // own rather than a solid outline.
    expect(link).toHaveClass("od-Pagination-link");
  });

  it("activates a pagination control on Enter and on Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Pagination aria-label="Results">
        <PaginationContent>
          <PaginationItem>
            <PaginationButton onClick={onClick}>2</PaginationButton>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const button = screen.getByRole("button", { name: "2" });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("adapts to the available space with a container query instead of a device breakpoint", () => {
    render(
      <Pagination aria-label="Results" responsive>
        <PaginationContent>
          <PaginationItem collapsible>
            <PaginationLink href="/page/2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationStatus responsiveOnly>Page 1 of 4</PaginationStatus>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const root = screen.getByRole("navigation", { name: "Results" });
    expect(root).toHaveClass("od-Pagination-root");
    expect(root).toHaveAttribute("data-responsive", "true");
    expect(document.querySelector('[data-collapsible="true"]')).toBeInTheDocument();
    expect(document.querySelector('[data-responsive-only="true"]')).toBeInTheDocument();
  });
});
