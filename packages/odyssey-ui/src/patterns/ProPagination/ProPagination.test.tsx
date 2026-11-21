import { OdysseyProvider } from "@odyssey/ui";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { createPaginationRange, ProPagination } from "./ProPagination";

describe("ProPagination", () => {
  it("creates deterministic page ranges", () => {
    expect(createPaginationRange(6, 12, 1, 1)).toEqual([1, "start-ellipsis", 5, 6, 7, "end-ellipsis", 12]);
    expect(createPaginationRange(2, 3, 1, 1)).toEqual([1, 2, 3]);
  });

  it("supports uncontrolled paging, refs, totals, and semantic classes", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLElement>();
    const onPageChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProPagination
          ref={ref}
          aria-label="Results"
          classNames={{ action: "action" }}
          defaultPage={2}
          pageSize={10}
          total={120}
          showTotal
          onPageChange={onPageChange}
        />
      </OdysseyProvider>,
    );
    expect(ref.current).toHaveAttribute("data-od-slot", "pro-pagination");
    expect(screen.getByRole("button", { name: "第 2 页" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("第 11–20 项，共 120 项")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "第 3 页" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    expect(screen.getByRole("button", { name: "第 3 页" })).toHaveClass("action");
  });

  it("keeps the operator on the same rows when the page size changes", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <OdysseyProvider>
        <ProPagination
          page={3}
          pageSize={10}
          total={100}
          showPageSize
          pageSizeOptions={[10, 20]}
          onPageSizeChange={(size) => calls.push(`size:${size}`)}
          onPageChange={(page) => calls.push(`page:${page}`)}
        />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "每页条数" }));
    await user.click(screen.getByRole("option", { name: "20" }));
    // Ant Design keeps the page that still holds the first visible row:
    // row 21 of a ten row page three lands on page two of a twenty row page,
    // so the rows under the cursor do not change under the operator.
    expect(calls).toEqual(["size:20", "page:2"]);
  });

  it("reads like Ant Design: total first, page buttons in the middle, options last", () => {
    render(
      <OdysseyProvider>
        <ProPagination page={1} pageSize={10} total={30} align="end" showTotal showPageSize showQuickJumper />
      </OdysseyProvider>,
    );
    const bar = screen.getByRole("navigation");
    const slots = [...bar.querySelectorAll("[data-od-slot]")].map((node) => node.getAttribute("data-od-slot"));
    expect(slots.indexOf("pro-pagination-total")).toBeLessThan(slots.indexOf("pro-pagination-content"));
    expect(slots.indexOf("pro-pagination-content")).toBeLessThan(slots.indexOf("pro-pagination-controls"));
    expect(bar).toHaveAttribute("data-align", "end");
  });

  it("separates the total from end-aligned pagination controls with static classes", () => {
    const { container } = render(
      <OdysseyProvider>
        <ProPagination page={1} pageSize={10} total={84} showTotal showPageSize showQuickJumper />
      </OdysseyProvider>,
    );
    const bar = screen.getByRole("navigation");
    const controlGroup = container.querySelector('[data-od-slot="pro-pagination-control-group"]');
    expect(controlGroup).toContainElement(bar.querySelector('[data-od-slot="pro-pagination-content"]'));
    expect(controlGroup).toContainElement(bar.querySelector('[data-od-slot="pro-pagination-controls"]'));
    expect(bar).toHaveClass("justify-between", "max-[640px]:items-start");
    expect(controlGroup).toHaveClass("max-[640px]:w-full", "max-[640px]:justify-end");
  });

  it("clamps quick jumps and ignores empty input", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProPagination page={1} pageSize={10} total={30} showQuickJumper onPageChange={onPageChange} />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("button", { name: "跳转" }));
    expect(onPageChange).not.toHaveBeenCalled();
    const input = screen.getByRole("spinbutton", { name: "跳转到页码" });
    fireEvent.change(input, { target: { value: "99" } });
    input.focus();
    await user.keyboard("{Enter}");
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("asks for another chunk when a cursor list has more rows", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProPagination page={2} pageSize={50} total={100} hasMore onPageChange={onPageChange} />
      </OdysseyProvider>,
    );
    // Two pages are known, but the cursor still holds more rows: the next
    // button stays live and reports the page after the last known one.
    await user.click(screen.getByRole("button", { name: "下一页" }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it("supports controlled state", async () => {
    const user = userEvent.setup();
    function Example() {
      const [page, setPage] = useState(1);
      return (
        <OdysseyProvider>
          <ProPagination page={page} onPageChange={setPage} pageSize={10} total={30} />
        </OdysseyProvider>
      );
    }
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "下一页" }));
    expect(screen.getByRole("button", { name: "第 2 页" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps the pending next control focusable and allows moving to a known page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProPagination page={2} pageSize={50} total={100} hasMore nextPending onPageChange={onPageChange} />
      </OdysseyProvider>,
    );
    const next = screen.getByRole("button", { name: "下一页" });
    next.focus();
    expect(next).toHaveFocus();
    expect(next).toHaveAttribute("aria-disabled", "true");
    await user.keyboard("{Enter}");
    expect(onPageChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "上一页" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
