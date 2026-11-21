import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { ControlGroup } from "./ControlGroup";

it("groups the controls while preserving their native behavior", () => {
  const submit = vi.fn();
  render(
    <ControlGroup aria-label="Search">
      <Input aria-label="Query" defaultValue="Odyssey" />
      <Button onClick={submit}>Go</Button>
      <Button disabled>Reset</Button>
    </ControlGroup>,
  );
  const group = within(screen.getByRole("group", { name: "Search" }));
  const query = group.getByRole("textbox", { name: "Query" });
  query.focus();
  expect(query).toHaveFocus();
  expect(query).toHaveValue("Odyssey");
  fireEvent.click(group.getByRole("button", { name: "Go" }));
  expect(submit).toHaveBeenCalledOnce();
  expect(group.getByRole("button", { name: "Reset" })).toBeDisabled();
});
