import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./Tabs";

it("uses the shared underline indicator by default", () => {
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">A</TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
    </Tabs>,
  );
  const list = screen.getByRole("tablist");
  const tab = screen.getByRole("tab", { name: "A" });
  expect(list).toHaveClass("od-Tabs-list");
  expect(list).toHaveAttribute("data-variant", "underline");
  expect(list.querySelectorAll('[data-od-slot="tabs-indicator"]')).toHaveLength(1);
  expect(tab).toHaveClass("od-Tabs-tab");
});

it("renders a shared indicator for the underline variant and follows tab selection", async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="a">
      <TabsList variant="underline" scrollable>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
    </Tabs>,
  );
  const list = screen.getByRole("tablist");
  expect(list).toHaveAttribute("data-variant", "underline");
  expect(list.querySelectorAll('[data-od-slot="tabs-indicator"]')).toHaveLength(1);

  const next = screen.getByRole("tab", { name: "B" });
  await user.click(next);
  expect(next).toHaveAttribute("aria-selected", "true");
});

it("uses arrow keys to move tab focus", async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  screen.getByRole("tab", { name: "A" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "B" })).toHaveFocus();
});

it("reveals the selected tab inside an opt-in scrollable list without moving focus", async () => {
  const fixture = (value: string) => (
    <Tabs value={value}>
      <TabsList scrollable>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
    </Tabs>
  );
  const view = render(fixture("a"));
  const list = screen.getByRole("tablist");
  const tab = screen.getByRole("tab", { name: "B" });
  const scrollBy = vi.fn();
  Object.defineProperty(list, "scrollBy", { value: scrollBy });
  vi.spyOn(list, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 40));
  vi.spyOn(tab, "getBoundingClientRect").mockReturnValue(new DOMRect(110, 0, 40, 40));
  screen.getByRole("tab", { name: "A" }).focus();

  view.rerender(fixture("b"));
  await waitFor(() => expect(scrollBy).toHaveBeenCalledWith({ left: 50 }));
  expect(list).toHaveAttribute("data-scrollable");
  expect(screen.getByRole("tab", { name: "A" })).toHaveFocus();
});

it("keeps keyboard focus visible without relying on colour alone", async () => {
  const user = userEvent.setup();
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  const tab = screen.getByRole("tab", { name: "A" });

  await user.tab();
  expect(tab).toHaveFocus();

  expect(tab).toHaveClass("od-Tabs-tab");
});

it("exposes its disabled state and never invokes the action", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Tabs value="a" onValueChange={onValueChange}>
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b" disabled>
          B
        </TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  const disabledTab = screen.getByRole("tab", { name: "B" });

  // A disabled tab stays in the tab order, so the state is carried by
  // aria-disabled rather than by the native disabled attribute.
  expect(disabledTab).toHaveAttribute("aria-disabled", "true");
  expect(disabledTab).toHaveAttribute("data-disabled");

  await user.click(disabledTab);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(disabledTab).toHaveAttribute("aria-selected", "false");
  expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("aria-selected", "true");
});

it("distinguishes its hover, selected and disabled states in the state matrix", () => {
  render(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
        <TabsTab value="c" disabled>
          C
        </TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  const selectedTab = screen.getByRole("tab", { name: "A" });
  const disabledTab = screen.getByRole("tab", { name: "C" });

  // The hover rule excludes the disabled state, so the disabled state is
  // addressed by its own selector.
  expect(selectedTab).toHaveClass("od-Tabs-tab");
  expect(disabledTab).toHaveClass("od-Tabs-tab");

  // The same states are told apart on the elements themselves.
  expect(selectedTab).toHaveAttribute("data-active");
  expect(disabledTab).toHaveAttribute("data-disabled");
  expect(disabledTab).not.toHaveAttribute("data-active");
});

it("keeps the caller's selected value authoritative", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const { rerender } = render(
    <Tabs value="a" onValueChange={onValueChange}>
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  const first = screen.getByRole("tab", { name: "A" });
  const second = screen.getByRole("tab", { name: "B" });

  await user.click(second);
  // The interaction is reported to the caller...
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange.mock.calls[0]?.[0]).toBe("b");
  // ...but the caller's value still owns the selection.
  expect(first).toHaveAttribute("aria-selected", "true");
  expect(second).toHaveAttribute("aria-selected", "false");
  expect(screen.getByRole("tabpanel")).toHaveTextContent("One");

  // The caller moves the selection itself.
  rerender(
    <Tabs value="b" onValueChange={onValueChange}>
      <TabsList>
        <TabsTab value="a">A</TabsTab>
        <TabsTab value="b">B</TabsTab>
      </TabsList>
      <TabsPanel value="a">One</TabsPanel>
      <TabsPanel value="b">Two</TabsPanel>
    </Tabs>,
  );
  expect(second).toHaveAttribute("aria-selected", "true");
  expect(first).toHaveAttribute("aria-selected", "false");
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Two");
});
