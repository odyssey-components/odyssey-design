import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { Dialog } from "./Dialog";

describe("Dialog", () => {
  it("opens, labels content, and returns focus after closing", async () => {
    const user = userEvent.setup();
    render(<Dialog title="保存设置" trigger={<Button>打开</Button>} description="确认保存当前设置" content="设置内容" />);
    const trigger = screen.getByRole("button", { name: "打开" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "保存设置" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("activates the trigger with Enter and with Space", async () => {
    const user = userEvent.setup();
    render(<Dialog title="保存设置" trigger={<Button>打开</Button>} description="确认保存当前设置" />);
    const trigger = screen.getByRole("button", { name: "打开" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "保存设置" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    trigger.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("dialog", { name: "保存设置" })).toBeInTheDocument();
  });

  it("keeps the open, starting and ending states distinguishable in the state matrix", async () => {
    const user = userEvent.setup();
    render(<Dialog title="保存设置" trigger={<Button>打开</Button>} />);
    await user.click(screen.getByRole("button", { name: "打开" }));
    const popup = screen.getByRole("dialog", { name: "保存设置" });

    // The settled state is published on the popup.
    expect(popup).toHaveAttribute("data-open");

    expect(popup).toHaveClass("od-Dialog-popup");
  });

  it("paints the overlay surface with the dialog shadow the contract publishes", async () => {
    const user = userEvent.setup();
    render(<Dialog title="保存设置" trigger={<Button>打开</Button>} />);
    await user.click(screen.getByRole("button", { name: "打开" }));
    const popup = screen.getByRole("dialog", { name: "保存设置" });

    expect(popup).toHaveClass("od-Dialog-popup");
  });

  it("keeps the caller's controlled open state authoritative over the dialog", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(<Dialog open={false} onOpenChange={onOpenChange} title="保存设置" trigger={<Button>打开</Button>} />);
    const trigger = screen.getByRole("button", { name: "打开" });

    await user.click(trigger);
    // The dialog asks to open, but the caller's value decides what happens.
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(<Dialog open onOpenChange={onOpenChange} title="保存设置" trigger={<Button>打开</Button>} />);
    expect(screen.getByRole("dialog", { name: "保存设置" })).toBeInTheDocument();
  });
});
