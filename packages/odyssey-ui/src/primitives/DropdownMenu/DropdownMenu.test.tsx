import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OdysseyProvider } from "../../OdysseyProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("supports keyboard selection and restores focus", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <OdysseyProvider>
        <DropdownMenu>
          <DropdownMenuTrigger>设置</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onClick}>个人资料</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenu>
      </OdysseyProvider>,
    );
    const trigger = screen.getByRole("button", { name: "设置" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveFocus();
  });

  it("keeps the caller's controlled radio value in a labeled radio group", async () => {
    const user = userEvent.setup();
    render(
      <OdysseyProvider>
        <DropdownMenu>
          <DropdownMenuTrigger>主题</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value="system">
                  <DropdownMenuGroupLabel>显示模式</DropdownMenuGroupLabel>
                  <DropdownMenuRadioItem value="system">跟随系统</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenu>
      </OdysseyProvider>,
    );

    const trigger = screen.getByRole("button", { name: "主题" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByText("显示模式")).toBeVisible();
    expect(screen.getByRole("menuitemradio", { name: "跟随系统" })).toHaveAttribute("aria-checked", "true");
  });

  it("exposes the disabled state and never invokes the action of a disabled item", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <OdysseyProvider>
        <DropdownMenu>
          <DropdownMenuTrigger>设置</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onClick}>个人资料</DropdownMenuItem>
                <DropdownMenuItem disabled onClick={onClick}>
                  已删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenu>
      </OdysseyProvider>,
    );
    const trigger = screen.getByRole("button", { name: "设置" });
    trigger.focus();
    await user.keyboard("{Enter}");

    const enabled = screen.getByRole("menuitem", { name: "个人资料" });
    const disabled = screen.getByRole("menuitem", { name: "已删除" });
    // The item publishes the disabled state for assistive technology and for
    // the styles that paint it.
    expect(disabled).toHaveAttribute("aria-disabled", "true");
    expect(disabled).toHaveAttribute("data-disabled");
    expect(disabled).not.toHaveAttribute("data-highlighted");

    await user.click(disabled);
    expect(onClick).not.toHaveBeenCalled();

    // The enabled item still runs its action, so the disabled one is the only
    // reason the action stayed silent.
    await user.click(enabled);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps the highlighted, disabled and checked states distinguishable in the state matrix", async () => {
    const user = userEvent.setup();
    render(
      <OdysseyProvider>
        <DropdownMenu>
          <DropdownMenuTrigger>主题</DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuPositioner>
              <DropdownMenuContent>
                <DropdownMenuItem>个人资料</DropdownMenuItem>
                <DropdownMenuItem disabled>已删除</DropdownMenuItem>
                <DropdownMenuRadioGroup value="system">
                  <DropdownMenuRadioItem value="system">跟随系统</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenuPositioner>
          </DropdownMenuPortal>
        </DropdownMenu>
      </OdysseyProvider>,
    );
    const trigger = screen.getByRole("button", { name: "主题" });
    trigger.focus();
    await user.keyboard("{Enter}");

    const item = screen.getByRole("menuitem", { name: "个人资料" });
    const disabledItem = screen.getByRole("menuitem", { name: "已删除" });
    const radioItem = screen.getByRole("menuitemradio", { name: "跟随系统" });

    // The keyboard position is published on the item under the pointer.
    expect(item).toHaveAttribute("data-highlighted");
    expect(disabledItem).not.toHaveAttribute("data-highlighted");
    expect(disabledItem).toHaveAttribute("data-disabled");
    // The checked radio item publishes its own state.
    expect(radioItem).toHaveAttribute("aria-checked", "true");
    expect(radioItem).toHaveAttribute("data-checked");
    expect(radioItem).not.toHaveAttribute("data-disabled");

    expect(item).toHaveClass("od-DropdownMenu-item");
    expect(disabledItem).toHaveClass("od-DropdownMenu-item");
    expect(radioItem).toHaveClass("od-DropdownMenu-item");
  });
});
