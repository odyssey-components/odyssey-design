import { OdysseyProvider } from "@odyssey/ui";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ProConfirm } from "./ProConfirm";

describe("ProConfirm", () => {
  it("prevents duplicate asynchronous confirmation", async () => {
    const user = userEvent.setup();
    let release: (() => void) | undefined;
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
    const onOpenChange = vi.fn();
    function ControlledConfirm() {
      const [open, setOpen] = useState(true);
      return (
        <OdysseyProvider>
          <ProConfirm
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next);
              setOpen(next);
            }}
            title="删除记录"
            confirmLabel="删除"
            loading={false}
            onConfirm={onConfirm}
          />
        </OdysseyProvider>
      );
    }
    render(<ControlledConfirm />);
    const confirm = screen.getByRole("button", { name: "删除" });
    await user.click(confirm);
    expect(confirm).toBeDisabled();
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    release?.();
    await waitFor(() => expect(screen.queryByRole("alertdialog", { name: "删除记录" })).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps a rejected confirmation open and presents caller-owned error", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(async () => {
      throw new Error("request failed");
    });
    render(
      <OdysseyProvider>
        <ProConfirm open title="删除记录" confirmLabel="删除" error="保存失败" onConfirm={onConfirm} />
      </OdysseyProvider>,
    );

    await user.click(screen.getByRole("button", { name: "删除" }));

    expect(screen.getByRole("alertdialog", { name: "删除记录" })).toBeInTheDocument();
    expect(screen.getByText("保存失败")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeEnabled();
  });
});
