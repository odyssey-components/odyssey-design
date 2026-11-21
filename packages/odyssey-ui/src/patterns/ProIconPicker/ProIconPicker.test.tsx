import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { vi } from "vitest";
import { ProIconPicker } from "./ProIconPicker";

it("forwards its root contract and applies semantic parts", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLButtonElement>();
  render(
    <ProIconPicker
      ref={ref}
      label="图标"
      className="picker-root"
      classNames={{ content: "picker-content", option: "picker-option" }}
      styles={{ option: { opacity: 0.8 } }}
      options={[{ value: "star", icon: <span>★</span> }]}
    />,
  );
  expect(ref.current).toHaveClass("picker-root");
  expect(ref.current).toHaveAttribute("data-od-slot", "pro-icon-picker");
  await user.click(ref.current as HTMLButtonElement);
  expect(document.querySelector('[data-od-slot="pro-icon-picker-content"]')).toHaveClass("picker-content");
  expect(screen.getByRole("button", { name: "star" })).toHaveClass("picker-option");
});

it("selects an injected icon option", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<ProIconPicker label="图标" options={[{ value: "star", icon: <span>★</span> }]} onValueChange={change} />);
  await user.click(screen.getByRole("button", { name: "图标" }));
  await user.click(screen.getByRole("button", { name: "star" }));
  expect(change).toHaveBeenCalledWith("star");
  expect(screen.getByRole("button", { name: "图标" })).toHaveFocus();
});

it("filters options and renders the empty state", async () => {
  const user = userEvent.setup();
  render(<ProIconPicker label="图标" searchPlaceholder="搜索图标" emptyContent="没有匹配图标" options={[{ value: "star", icon: <span>★</span> }]} />);
  await user.click(screen.getByRole("button", { name: "图标" }));
  await user.type(screen.getByRole("textbox", { name: "搜索图标" }), "missing");
  expect(screen.getByText("没有匹配图标")).toBeVisible();
});
