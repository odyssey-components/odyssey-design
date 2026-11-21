import { DropdownMenuItem } from "@odyssey/ui/dropdown-menu";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProAdminProvider } from "../ProAdminProvider";
import { ProAdminUserMenu } from "./ProAdminUserMenu";

function renderMenu(node: React.ReactNode) {
  return render(<ProAdminProvider appearance={{ storageKey: "user-menu-test" }}>{node}</ProAdminProvider>);
}

describe("ProAdminUserMenu", () => {
  it("renders identity and composable product actions", async () => {
    const user = userEvent.setup();
    const onProfile = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    renderMenu(
      <ProAdminUserMenu
        ref={ref}
        className="user-root"
        classNames={{ actions: "user-actions", identity: "user-identity" }}
        user={{ displayName: "alice", roleLabel: "管理员", secondaryText: "alice@example.test" }}
        onLogout={vi.fn(async () => undefined)}
        menuContent={<DropdownMenuItem onClick={onProfile}>个人资料</DropdownMenuItem>}
      />,
    );

    expect(ref.current).toHaveAttribute("data-od-slot", "pro-admin-user-menu-trigger");
    expect(ref.current).toHaveClass("user-root");
    ref.current?.focus();
    await user.keyboard("{Enter}");
    expect(screen.getAllByText("alice").length).toBeGreaterThan(0);
    expect(document.querySelector('[data-od-slot="pro-admin-user-menu-identity"]')).toHaveClass("user-identity");
    expect(document.querySelector('[data-od-slot="pro-admin-user-menu-actions"]')).toHaveClass("user-actions");
    expect(screen.getByText("管理员 · alice@example.test")).toBeVisible();
    await user.click(screen.getByText("个人资料"));
    expect(onProfile).toHaveBeenCalledOnce();
  });

  it("prevents duplicate logout and restores a recoverable failure state", async () => {
    const user = userEvent.setup();
    let rejectLogout: ((reason?: unknown) => void) | undefined;
    const onLogout = vi.fn(
      () =>
        new Promise<never>((_, reject) => {
          rejectLogout = reject;
        }),
    );
    renderMenu(<ProAdminUserMenu user={{ displayName: "alice", roleLabel: "管理员" }} onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: "用户菜单" }));
    const logout = await screen.findByText("退出登录");
    await user.click(logout);
    expect(onLogout).toHaveBeenCalledOnce();
    expect(screen.getByText("正在退出…")).toBeVisible();
    expect(screen.getByText("正在退出…").closest('[role="menuitem"]')).toHaveAttribute("aria-disabled", "true");
    rejectLogout?.(new Error("failed"));
    await waitFor(() => expect(screen.getByText("退出失败，请重试")).toBeVisible());
    expect(screen.getByText("退出登录")).toBeVisible();
  });

  it("restores focus to the trigger when dismissed with Escape", async () => {
    const user = userEvent.setup();
    renderMenu(<ProAdminUserMenu user={{ displayName: "alice", roleLabel: "管理员" }} onLogout={vi.fn(async () => undefined)} />);
    const trigger = screen.getByRole("button", { name: "用户菜单" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("退出登录")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
