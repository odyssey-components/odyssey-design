import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type ProColumnDef, ProTable } from "./ProTable";

interface Person {
  id: string;
  name: string;
}
const columns: ProColumnDef<Person>[] = [{ accessorKey: "name", header: "Name" }];
describe("ProTable", () => {
  it("renders data from options", () => {
    render(<ProTable options={{ columns, dataSource: [{ id: "1", name: "Ada" }], rowKey: "id" }} />);
    expect(screen.getByText("Ada")).toBeInTheDocument();
  });
  it("renders its option toolbar", () => {
    render(<ProTable options={{ columns, dataSource: [], rowKey: "id", toolbar: <span>Tools</span> }} />);
    expect(screen.getByText("Tools")).toBeInTheDocument();
  });
});
