import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog options", () => {
  it("closes an uncontrolled dialog once after successful confirmation and restores trigger focus", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(async () => undefined);
    const onOpenChange = vi.fn();
    render(
      <Dialog
        defaultOpen
        onOpenChange={onOpenChange}
        trigger={<button type="button">Open editor</button>}
        title={"Edit"}
        content={"Body"}
        confirm={{ label: "Save", onConfirm }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Edit" })).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Open editor" })).toHaveFocus();
  });

  it("closes a controlled dialog through the caller's open state", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(async () => undefined);
    const onOpenChange = vi.fn();
    function ControlledDialog() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
          title={"Controlled"}
          confirm={{ label: "Save", onConfirm }}
        />
      );
    }

    render(<ControlledDialog />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Controlled" })).not.toBeInTheDocument());
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps internal pending active when the caller's pending prop is false", async () => {
    const user = userEvent.setup();
    let release: (() => void) | undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
    render(<Dialog defaultOpen pending={false} title={"Pending"} confirm={{ label: "Save", onConfirm }} />);
    const save = screen.getByRole("button", { name: "Save" });

    await user.click(save);
    expect(save).toBeDisabled();
    await user.click(save);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    release?.();
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Pending" })).not.toBeInTheDocument());
  });

  it("leaves the dialog open after rejection so caller-owned error and retry remain available", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    let attempt = 0;
    function RetryDialog() {
      const [error, setError] = useState<string>();
      return (
        <Dialog
          defaultOpen
          onOpenChange={onOpenChange}
          title={"Retry"}
          error={error}
          confirm={{
            label: "Save",
            onConfirm: async () => {
              attempt += 1;
              if (attempt === 1) {
                setError("Save failed");
                throw new Error("request failed");
              }
            },
          }}
        />
      );
    }

    render(<RetryDialog />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed");
    expect(screen.getByRole("dialog", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Retry" })).not.toBeInTheDocument());
    expect(attempt).toBe(2);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps Escape cancellation and focus restoration intact", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Dialog trigger={<button type="button">Open editor</button>} title={"Escape"} content={"Body"} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Open editor" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Escape" })).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });

  it("closes from the cancel action and restores focus", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Dialog trigger={<button type="button">Open editor</button>} title={"Cancel"} content={"Body"} onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Open editor" });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "取消" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Cancel" })).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveFocus();
  });
});
