import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button/Button";
import { Toaster, useToast } from "./Toast";

function Fixture() {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast.show({ title: "保存成功", description: "内容已经同步" })}>通知</Button>
      <Button
        onClick={() => {
          const id = toast.show({ title: "等待更新", timeout: 0 });
          toast.update(id, { title: "更新成功", tone: "success" });
        }}
      >
        更新
      </Button>
      <Button
        onClick={() => {
          void toast.promise(Promise.resolve("文件"), { loading: {}, success: (value) => `${value}上传成功`, error: "上传失败" });
        }}
      >
        异步
      </Button>
    </>
  );
}

describe("Toast", () => {
  it("announces and dismisses notifications", async () => {
    const user = userEvent.setup();
    render(
      <Toaster>
        <Fixture />
      </Toaster>,
    );
    await user.click(screen.getByRole("button", { name: "通知" }));
    expect(screen.getByText("保存成功")).toBeInTheDocument();
    await user.click(screen.getByRole("dialog", { name: "保存成功" }));
    await user.click(screen.getByRole("button", { name: "关闭通知" }));
    expect(screen.queryByText("保存成功")).not.toBeInTheDocument();
  });

  it("updates existing notifications and resolves promise feedback", async () => {
    const user = userEvent.setup();
    render(
      <Toaster>
        <Fixture />
      </Toaster>,
    );

    await user.click(screen.getByRole("button", { name: "更新" }));
    expect(await screen.findByText("更新成功")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "异步" }));
    expect(await screen.findByText("文件上传成功")).toBeInTheDocument();
  });
});
