import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "./Alert";

it("announces feedback with its semantic tone", async () => {
  const { container } = render(
    <Alert tone="warning">
      <AlertTitle>连接异常</AlertTitle>
      <AlertDescription>正在重试</AlertDescription>
    </Alert>,
  );
  expect(screen.getByRole("alert")).toHaveAttribute("data-tone", "warning");
  expect(screen.getByRole("alert")).toHaveClass("grid", "[--alert-color:var(--od-warning)]");
  expect(await axe(container)).toHaveNoViolations();
});

it("keeps actions in the alert anatomy without changing button semantics", () => {
  const ref = { current: null as HTMLDivElement | null };
  render(
    <Alert ref={ref} aria-label="同步失败">
      <AlertTitle>无法同步</AlertTitle>
      <AlertDescription>请检查网络后重试。</AlertDescription>
      <AlertAction data-testid="alert-action">
        <button type="button">重试</button>
      </AlertAction>
    </Alert>,
  );
  expect(ref.current).toBe(screen.getByRole("alert", { name: "同步失败" }));
  expect(screen.getByTestId("alert-action")).toHaveAttribute("data-od-slot", "alert-action");
  expect(screen.getByRole("button", { name: "重试" })).toHaveAttribute("type", "button");
  expect(screen.getByTestId("alert-action")).toHaveClass("col-start-2");
  expect(screen.getByRole("alert")).toHaveClass("@container/od-alert");
});
