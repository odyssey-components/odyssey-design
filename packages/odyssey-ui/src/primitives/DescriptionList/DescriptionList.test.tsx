import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { DescriptionDetail, DescriptionItem, DescriptionList, DescriptionTerm } from "./DescriptionList";

describe("DescriptionList", () => {
  it("renders semantic anatomy, layout state, and forwarded refs", () => {
    const listRef = createRef<HTMLDListElement>();
    const itemRef = createRef<HTMLDivElement>();
    const termRef = createRef<HTMLElement>();
    const detailRef = createRef<HTMLElement>();
    render(
      <DescriptionList ref={listRef} columns={3} layout="responsive" size="lg" className="custom-list" aria-label="种子信息">
        <DescriptionItem ref={itemRef} className="custom-item">
          <DescriptionTerm ref={termRef}>状态</DescriptionTerm>
          <DescriptionDetail ref={detailRef}>做种中</DescriptionDetail>
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getByText("状态").tagName).toBe("DT");
    expect(screen.getByText("做种中").tagName).toBe("DD");
    expect(listRef.current).toHaveAttribute("data-columns", "3");
    expect(listRef.current).toHaveAttribute("data-layout", "responsive");
    expect(listRef.current).toHaveAttribute("data-size", "lg");
    expect(listRef.current).toHaveClass("custom-list");
    expect(itemRef.current).toHaveClass("custom-item");
    expect(termRef.current).toBe(screen.getByText("状态"));
    expect(detailRef.current).toBe(screen.getByText("做种中"));
  });
});
