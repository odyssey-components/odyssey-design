import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Popover, PopoverContent, PopoverPortal, PopoverPositioner, PopoverTrigger } from "./Popover";

it("opens and restores focus", async () => {
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>Content</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>,
  );
  const trigger = screen.getByRole("button", { name: "Open" });
  await user.click(trigger);
  expect(screen.getByText("Content")).toBeVisible();
  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});

it("opens the popover from the keyboard on Enter and on Space", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>Content</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>,
  );
  const trigger = screen.getByRole("button", { name: "Open" });

  await user.tab();
  expect(trigger).toHaveFocus();

  await user.keyboard("{Enter}");
  expect(screen.queryByRole("dialog")).not.toBeNull();

  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(trigger).toHaveFocus();

  await user.keyboard(" ");
  expect(screen.queryByRole("dialog")).not.toBeNull();

  // Both keys opened the popover, so the trigger behaves like the native
  // button it renders.
  const opened = onOpenChange.mock.calls.filter(([open]) => open === true);
  expect(opened).toHaveLength(2);
});

it("keeps the settled and the transitioning popover apart in one state matrix", async () => {
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>Content</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  const content = screen.getByRole("dialog");
  expect(content).toHaveAttribute("data-open");

  expect(content).toHaveClass("od-Popover-popup", "od-Popover-popover");
});

it("paints the floating surface with the menu shadow the contract publishes", async () => {
  const user = userEvent.setup();
  render(
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>Content</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  const content = screen.getByRole("dialog");

  // The contract publishes the floating surface's elevation as the menu
  // shadow, so the surface paints that path's variable: the published path is
  // the one that decides the pixels.
  expect(content).toHaveClass("od-Popover-popup");
});

it("keeps the caller's open state authoritative", async () => {
  const user = userEvent.setup();
  const onOpenChange = vi.fn();
  render(
    <Popover open={false} onOpenChange={onOpenChange}>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>Content</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>,
  );
  const trigger = screen.getByRole("button", { name: "Open" });

  await user.click(trigger);
  // The caller owns the state: the popover reports the requested change but
  // stays closed until the caller opens it.
  expect(onOpenChange).toHaveBeenCalledTimes(1);
  expect(onOpenChange.mock.calls[0]?.[0]).toBe(true);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
