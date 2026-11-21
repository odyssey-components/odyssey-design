import { screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import { Badge } from "../primitives/Badge";
import { Button } from "../primitives/Button";
import { Dialog } from "../primitives/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuContent,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "../primitives/DropdownMenu";
import { EmptyState, EmptyStateDescription, EmptyStateTitle } from "../primitives/EmptyState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNextButton } from "../primitives/Pagination";
import { Popover, PopoverContent, PopoverPortal, PopoverPositioner, PopoverTrigger } from "../primitives/Popover";
import { Progress } from "../primitives/Progress";
import { Skeleton } from "../primitives/Skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../primitives/Tabs";
import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "../primitives/Tooltip";
import { bySlot, type RtlCase } from "./rtl-harness";

const paginationClick = vi.fn();
const menuClick = vi.fn();

/** The overlay and display capabilities the contract requires on the Web platform. */
export const OVERLAY_RTL_CASES: RtlCase[] = [
  {
    id: "Badge",
    classPrefix: "od-Badge-",
    dirProp: true,
    render: (dir) => <Badge dir={dir}>Beta</Badge>,
    root: bySlot("badge"),
  },
  {
    id: "EmptyState",
    classPrefix: "od-EmptyState-",
    dirProp: true,
    render: (dir) => (
      <EmptyState dir={dir}>
        <EmptyStateTitle>Empty</EmptyStateTitle>
        <EmptyStateDescription>No records</EmptyStateDescription>
      </EmptyState>
    ),
    root: bySlot("empty-state"),
  },
  {
    id: "Progress",
    classPrefix: "od-Progress-",
    dirProp: true,
    render: (dir) => <Progress dir={dir} value={25} max={50} label="Completion" />,
    root: bySlot("progress"),
  },
  {
    id: "Skeleton",
    classPrefix: "od-Skeleton-",
    dirProp: true,
    render: (dir) => <Skeleton dir={dir} shape="circular" animation="pulse" />,
    root: bySlot("skeleton"),
  },
  {
    id: "Dialog",
    classPrefix: "od-Dialog-",
    render: () => <Dialog title="Save settings" description="Confirm the current settings" trigger={<Button>Open</Button>} cancel={{ label: "Cancel" }} />,
    root: bySlot("dialog-trigger"),
    keyboard: async (user, container) => {
      const trigger = bySlot("dialog-trigger")(container);
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(await screen.findByRole("dialog")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
    },
  },
  {
    id: "Popover",
    classPrefix: "od-Popover-",
    render: () => (
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner>
            <PopoverContent>Content</PopoverContent>
          </PopoverPositioner>
        </PopoverPortal>
      </Popover>
    ),
    root: bySlot("popover-trigger"),
    keyboard: async (user, container) => {
      const trigger = bySlot("popover-trigger")(container);
      trigger.focus();
      await user.keyboard("{Enter}");
      expect(await screen.findByText("Content")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
    },
  },
  {
    id: "DropdownMenu",
    classPrefix: "od-DropdownMenu-",
    render: () => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Settings</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={menuClick}>Profile</DropdownMenuItem>
              <DropdownMenuSubmenu>
                <DropdownMenuSubmenuTrigger>More</DropdownMenuSubmenuTrigger>
                <DropdownMenuSubmenuContent>
                  <DropdownMenuItem>Nested</DropdownMenuItem>
                </DropdownMenuSubmenuContent>
              </DropdownMenuSubmenu>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenu>
    ),
    root: bySlot("dropdown-menu-trigger"),
    keyboard: async (user, container) => {
      const trigger = bySlot("dropdown-menu-trigger")(container);
      trigger.focus();
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");
      expect(menuClick).toHaveBeenCalled();
      expect(trigger).toHaveFocus();
    },
  },
  {
    id: "Tooltip",
    classPrefix: "od-Tooltip-",
    render: () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipPortal>
            <TooltipPositioner>
              <TooltipContent>Details</TooltipContent>
            </TooltipPositioner>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    ),
    root: bySlot("tooltip-trigger"),
    keyboard: async (_user, container) => {
      bySlot("tooltip-trigger")(container).focus();
      expect(await screen.findByRole("tooltip")).toBeInTheDocument();
    },
  },
  {
    id: "Tabs",
    classPrefix: "od-Tabs-",
    dirProp: true,
    render: (dir) => (
      <Tabs dir={dir} defaultValue="a">
        <TabsList>
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
          <TabsTab value="c">C</TabsTab>
        </TabsList>
        <TabsPanel value="a">One</TabsPanel>
      </Tabs>
    ),
    root: bySlot("tabs"),
    keyboard: async (user, container) => {
      const tabs = bySlot("tabs")(container);
      const first = tabs.querySelector('[data-od-slot="tabs-tab"]') as HTMLElement;
      first.focus();
      await user.keyboard("{ArrowRight}");
      // A right-to-left layout mirrors the horizontal arrow keys, so ArrowRight
      // walks backwards and wraps from the first tab to the last one.
      expect(document.activeElement?.textContent).toBe("C");
    },
  },
  {
    id: "Pagination",
    classPrefix: "od-Pagination-",
    dirProp: true,
    render: (dir) => (
      <Pagination dir={dir} aria-label="Results">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="/page/1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNextButton onClick={paginationClick} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
    root: bySlot("pagination"),
    keyboard: async (user, container) => {
      const next = container.querySelector('[data-od-slot="pagination-next-button"]') as HTMLElement;
      next.focus();
      await user.keyboard("{Enter}");
      expect(paginationClick).toHaveBeenCalled();
    },
  },
];
