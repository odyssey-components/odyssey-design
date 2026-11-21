import { OdysseyProvider } from "@odyssey/ui/provider";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProAdminLogin } from "./ProAdminLogin";

describe("ProAdminLogin", () => {
  it("forwards native props and submits injected credentials", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const ref = createRef<HTMLElement>();
    render(
      <OdysseyProvider>
        <ProAdminLogin
          ref={ref}
          aria-label="后台登录"
          className="custom-login"
          classNames={{ root: "min-h-0", card: "custom-card", submit: "custom-submit" }}
          styles={{ card: { opacity: 0.9 } }}
          slots={{ title: () => "自定义 Console" }}
          appName="Console"
          onSubmit={submit}
        />
      </OdysseyProvider>,
    );

    expect(ref.current).toHaveAttribute("data-od-slot", "pro-admin-login");
    expect(ref.current).toHaveClass("custom-login");
    expect(ref.current).toHaveClass("min-h-0");
    expect(ref.current).not.toHaveClass("min-h-dvh");
    expect(document.querySelector('[data-od-slot="pro-admin-login-card"]')).toHaveClass("custom-card");
    expect(document.querySelector('[data-od-slot="pro-admin-login-card"]')).toHaveStyle({ opacity: "0.9" });
    expect(screen.getByText("自定义 Console")).toHaveAttribute("data-od-slot", "pro-admin-login-title");
    expect(screen.getByRole("button", { name: "登录" })).toHaveClass("custom-submit");
    await user.type(screen.getByLabelText("账号"), "operator");
    await user.type(screen.getByLabelText("密码"), "a-secure-password");
    await user.click(screen.getByRole("button", { name: "登录" }));
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ username: "operator", password: "a-secure-password" }));
  });

  it("supports TOTP and validates matching password confirmation", async () => {
    const user = userEvent.setup();
    const submit = vi.fn();
    const view = render(<ProAdminLogin appName="Console" phase="totp" onSubmit={submit} />);
    expect(screen.getByLabelText("动态验证码")).toHaveAttribute("maxLength", "6");

    view.rerender(<ProAdminLogin appName="Console" phase="password-change" onSubmit={submit} />);
    await user.type(screen.getByLabelText("新密码"), "a-secure-password");
    await user.type(screen.getByLabelText("确认新密码"), "a-different-password");
    await user.click(screen.getByRole("button", { name: "更新密码" }));
    expect(screen.getByText("两次输入的新密码不一致")).toBeVisible();
    expect(submit).not.toHaveBeenCalled();
  });

  it("uses static utility styles without fixed field ids", () => {
    const html = renderToString(
      <OdysseyProvider>
        <ProAdminLogin appName="Console A" onSubmit={vi.fn()} />
        <ProAdminLogin appName="Console B" onSubmit={vi.fn()} />
      </OdysseyProvider>,
    );
    expect(html).toContain("min-h-dvh");
    expect(html).not.toContain("<style");
    expect(html.match(/data-od-slot="pro-admin-login"/g)).toHaveLength(2);
    expect(html).not.toContain("od-pro-admin-login-username");
  });

  it("has no obvious accessibility violations", async () => {
    const { container } = render(
      <OdysseyProvider>
        <ProAdminLogin appName="Console" error="登录失败" onSubmit={vi.fn()} />
      </OdysseyProvider>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
