import { fireEvent, render, screen } from "@testing-library/react";
import { AILocaleProvider, aiLocales } from "../locale";
import { AIThreadList, AIThreadListItems, AIThreadListNew } from "./AIThreadList";

const threads = [
  { id: "thread-1", title: "First conversation" },
  { id: "thread-2", title: "Second conversation" },
];

describe("AIThreadList", () => {
  it("renders controlled threads and reports selection", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <AIThreadList items={threads} activeId="thread-2" onSelect={onSelect}>
        <AIThreadListItems />
      </AIThreadList>,
    );

    fireEvent.click(screen.getByRole("button", { name: "First conversation" }));

    expect(onSelect).toHaveBeenCalledWith("thread-1");
    expect(container.querySelector('[data-od-slot="ai-thread-list-root"]')).not.toBeNull();
    expect(screen.getByRole("button", { name: "Second conversation" })).toHaveAttribute("aria-current", "page");
  });

  it("creates a thread through the locale contract", () => {
    const onCreate = vi.fn();
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIThreadList items={threads} onCreate={onCreate}>
          <AIThreadListNew />
        </AIThreadList>
      </AILocaleProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "New conversation" }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("disables thread creation while the list is loading", () => {
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIThreadList items={threads} loading>
          <AIThreadListNew />
        </AIThreadList>
      </AILocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "New conversation" })).toBeDisabled();
  });
});
