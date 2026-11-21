import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OdysseyProvider } from "../../OdysseyProvider";
import { Button } from "../Button/Button";
import { Select, SelectContent, SelectItem, SelectList, SelectPortal, SelectPositioner, SelectTrigger, SelectValue } from "../Select/Select";
import { Drawer, DrawerClose, DrawerContent, DrawerTitle, DrawerTrigger } from "./Drawer";

it("renders in the provider portal and closes with Escape", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <OdysseyProvider>
      <Drawer>
        <DrawerTrigger render={<Button>设置</Button>} />
        <DrawerContent>
          <DrawerTitle>工作台设置</DrawerTitle>
          <DrawerClose render={<Button>完成</Button>} />
        </DrawerContent>
      </Drawer>
    </OdysseyProvider>,
  );
  await user.click(screen.getByRole("button", { name: "设置" }));
  expect(container.querySelector("[data-od-portal-host] [data-od-slot='drawer-popup']")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  expect(screen.queryByText("工作台设置")).not.toBeInTheDocument();
});

it("keeps a drag inside the drawer from moving the drawer", () => {
  // A drag inside the drawer belongs to the content: selecting text, scrolling
  // a log, resizing a terminal. The drawer must not travel with it.
  const { container } = render(
    <OdysseyProvider>
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>工作台设置</DrawerTitle>
        </DrawerContent>
      </Drawer>
    </OdysseyProvider>,
  );
  const popup = container.querySelector("[data-od-slot='drawer-popup']");
  expect(popup).toHaveAttribute("data-base-ui-swipe-ignore");
});

it("lets a caller opt the drawer back into the swipe gesture", () => {
  const { container } = render(
    <OdysseyProvider>
      <Drawer defaultOpen>
        <DrawerContent swipeDismissal>
          <DrawerTitle>工作台设置</DrawerTitle>
        </DrawerContent>
      </Drawer>
    </OdysseyProvider>,
  );
  const popup = container.querySelector("[data-od-slot='drawer-popup']");
  expect(popup).not.toHaveAttribute("data-base-ui-swipe-ignore");
});

it("keeps a nested Select above the drawer layer and interactive", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const { container } = render(
    <OdysseyProvider>
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>工作台设置</DrawerTitle>
          <Select defaultValue="three" onValueChange={onValueChange}>
            <SelectTrigger aria-label="选点范围">
              <SelectValue />
            </SelectTrigger>
            <SelectPortal>
              <SelectPositioner>
                <SelectContent>
                  <SelectList>
                    <SelectItem value="three">三圈</SelectItem>
                    <SelectItem value="full">全盘</SelectItem>
                  </SelectList>
                </SelectContent>
              </SelectPositioner>
            </SelectPortal>
          </Select>
        </DrawerContent>
      </Drawer>
    </OdysseyProvider>,
  );

  await user.click(screen.getByRole("combobox", { name: "选点范围" }));
  await user.click(await screen.findByRole("option", { name: "全盘" }));

  const viewport = container.querySelector<HTMLElement>("[data-od-slot='drawer-viewport']");
  const positioner = container.querySelector<HTMLElement>("[data-od-slot='select-positioner']");
  expect(viewport?.style.zIndex).toBe("var(--od-z-dialog)");
  expect(positioner?.style.zIndex).toBe("calc(var(--od-z-dialog) + 1)");
  expect(onValueChange).toHaveBeenCalledWith("full", expect.anything());
});
