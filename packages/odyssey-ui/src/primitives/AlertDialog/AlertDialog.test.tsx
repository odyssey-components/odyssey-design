import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "./AlertDialog";

it("traps a destructive confirmation and restores focus", async () => {
  const user = userEvent.setup();
  render(
    <AlertDialog>
      <AlertDialogTrigger render={<Button>删除</Button>} />
      <AlertDialogContent>
        <AlertDialogTitle>确认删除？</AlertDialogTitle>
        <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
        <AlertDialogClose render={<Button>取消</Button>} />
      </AlertDialogContent>
    </AlertDialog>,
  );
  const trigger = screen.getByRole("button", { name: "删除" });
  await user.click(trigger);
  expect(screen.getByRole("alertdialog", { name: "确认删除？" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "取消" }));
  expect(trigger).toHaveFocus();
});
