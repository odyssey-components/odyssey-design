import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "./InputGroup";

describe("InputGroup", () => {
  it("focuses the control when a non-interactive addon is pressed", () => {
    render(
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-label="URL" />
      </InputGroup>,
    );
    fireEvent.click(screen.getByText("https://"));
    expect(screen.getByLabelText("URL")).toHaveFocus();
  });
  it("does not steal an interactive addon's click", () => {
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupAddon>
          <button type="button" onClick={onClick}>
            Action
          </button>
        </InputGroupAddon>
        <InputGroupInput aria-label="Value" />
      </InputGroup>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Value")).not.toHaveFocus();
  });
  it("exposes group semantics and a non-submitting addon button", () => {
    render(
      <InputGroup aria-label="Search">
        <InputGroupInput aria-label="Query" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton>Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    expect(screen.getByRole("group", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "Go" })).toHaveAttribute("data-input-group-size", "xs");
  });
  it("supports textarea and block addons", () => {
    render(
      <InputGroup>
        <InputGroupAddon align="block-start">Note</InputGroupAddon>
        <InputGroupTextarea aria-label="Body" />
      </InputGroup>,
    );
    expect(screen.getByText("Note")).toHaveAttribute("data-align", "block-start");
    expect(screen.getByRole("textbox", { name: "Body" }).tagName).toBe("TEXTAREA");
  });
});
