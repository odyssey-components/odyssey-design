import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "./Tooltip";

it("shows accessible content on focus", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>Details</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>,
  );
  await user.tab();
  expect(await screen.findByRole("tooltip")).toHaveTextContent("Details");
});

it("exposes a meaningful role and an accessible name", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>Details</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>,
  );

  // The trigger is a real button, so the tooltip hangs off a nameable owner.
  const trigger = screen.getByRole("button", { name: "Help" });
  expect(trigger).toHaveAccessibleName("Help");

  await user.tab();
  // The popup carries the tooltip role and the name of its own content.
  const tooltip = await screen.findByRole("tooltip", { name: "Details" });
  expect(tooltip).toHaveAttribute("role", "tooltip");
  expect(tooltip).toHaveAccessibleName("Details");
});

it("activates the tooltip from the keyboard and lets the keyboard dismiss it", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>Details</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Help" });

  // Keyboard focus is the activation a tooltip answers to.
  await user.tab();
  expect(trigger).toHaveFocus();
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toHaveTextContent("Details");

  // The keyboard dismisses the overlay again, and the trigger keeps the focus.
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});

it("distinguishes its open, closed and disabled states in the state matrix", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Help</TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>Details</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger disabled>Muted</TooltipTrigger>
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>Hidden</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>,
  );
  const trigger = screen.getByRole("button", { name: "Help" });
  const muted = screen.getByRole("button", { name: "Muted" });

  // Open: the surface is the component's own popup, marked as open.
  await user.tab();
  const tooltip = await screen.findByRole("tooltip");
  expect(tooltip).toHaveAttribute("data-od-slot", "tooltip-content");
  expect(tooltip).toHaveAttribute("data-open");
  expect(trigger).toHaveAttribute("data-popup-open");
  expect(tooltip).toHaveClass("od-Tooltip-tooltip");

  // Closed: the open markers are gone.
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  expect(trigger).not.toHaveAttribute("data-popup-open");

  // Disabled: the trigger never reaches the open state.
  expect(muted).toHaveAttribute("data-trigger-disabled");
  await user.click(muted);
  expect(muted).toHaveFocus();
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
});
