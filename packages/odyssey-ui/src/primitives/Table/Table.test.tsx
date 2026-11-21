import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./Table";

describe("Table", () => {
  it("accepts attributes on the scroll region independently of the table", () => {
    render(
      <Table
        containerClassName="scroll"
        containerProps={{ role: "region", "aria-label": "Scrollable users", tabIndex: 0, className: "focus-ring" }}
        aria-label="Users"
      />,
    );
    const region = screen.getByRole("region", { name: "Scrollable users" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("data-od-slot", "table-container");
    expect(region).toHaveClass("scroll", "focus-ring");
    expect(region).toContainElement(screen.getByRole("table", { name: "Users" }));
  });

  it("keeps pagination outside the scrolling table region", () => {
    render(
      <Table
        aria-label="Users"
        containerProps={{ role: "region", "aria-label": "Scrollable users" }}
        pagination={<nav aria-label="Users pages" />}
      />,
    );
    const region = screen.getByRole("region", { name: "Scrollable users" });
    const pagination = screen.getByRole("navigation", { name: "Users pages" });
    expect(region).not.toContainElement(pagination);
    expect(region.parentElement).toContainElement(pagination);
    expect(region).toContainElement(screen.getByRole("table", { name: "Users" }));
  });

  it("renders controlled built-in pagination and bounds page navigation", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<Table pagination={{ page: 2, pageSize: 20, total: 85, onPageChange, onPageSizeChange }} />);
    const pagination = screen.getByRole("navigation");
    expect(pagination).toHaveTextContent(/共 85 条|85 rows/);
    fireEvent.click(screen.getByRole("button", { name: /上一页|previous page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: /下一页|next page/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
    const jump = screen.getByRole("spinbutton");
    fireEvent.change(jump, { target: { value: "6" } });
    expect(screen.getByRole("button", { name: /跳转|^go$/i })).toBeDisabled();
    fireEvent.change(jump, { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /跳转|^go$/i }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);
  });

  it("renders semantic compound anatomy and forwards the table ref", () => {
    const ref = createRef<HTMLTableElement>();
    const { container } = render(
      <Table ref={ref} className="custom">
        <TableCaption>Users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
    expect(screen.getByRole("table")).toHaveClass("custom");
    expect(screen.getByText("Ada")).toBeVisible();
    expect(container.querySelector('[data-od-slot="table-container"]')).toBeInTheDocument();
  });
});
