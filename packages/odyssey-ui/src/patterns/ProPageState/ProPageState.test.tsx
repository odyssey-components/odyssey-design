import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ProPageState } from "./ProPageState";

it("renders overridable empty state", () => {
  render(<ProPageState state="empty" title="没有结果" />);
  expect(screen.getByText("没有结果")).toBeInTheDocument();
});

it("renders loading skeletons and an error retry", async () => {
  const retry = vi.fn();
  const { rerender } = render(<ProPageState state="loading" skeletons={2} />);
  expect(document.querySelectorAll('[data-od-slot="skeleton"]')).toHaveLength(2);
  rerender(<ProPageState state="error" title="网络错误" description="稍后重试" onRetry={retry} />);
  await userEvent.click(screen.getByRole("button", { name: "重试" }));
  expect(retry).toHaveBeenCalledTimes(1);
});

it("allows state slots to replace defaults", () => {
  render(<ProPageState state="empty" classNames={{ root: "state-root" }} slots={{ empty: () => <div>自定义空状态</div> }} />);
  expect(screen.getByText("自定义空状态")).toBeVisible();
  expect(screen.getByText("自定义空状态").closest('[data-od-slot="empty-state"]')).toBeInTheDocument();
  expect(document.querySelector('[data-od-slot="pro-page-state"]')).toHaveClass("state-root");
});
