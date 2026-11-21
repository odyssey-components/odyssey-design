import { fireEvent, render, screen } from "@testing-library/react";
import { AILocaleProvider, aiLocales } from "../locale";
import { AIThread, AIThreadEmpty, AIThreadIf, AIThreadScrollToBottom, AIThreadViewport } from "./AIThread";

describe("AIThread", () => {
  it("smoothly returns to the bottom without hiding the control before scrolling", () => {
    const { container } = render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIThreadViewport>messages</AIThreadViewport>
      </AILocaleProvider>,
    );
    const viewport = container.querySelector('[data-od-slot="ai-thread-viewport"]') as HTMLDivElement;
    Object.defineProperties(viewport, {
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 300 },
      scrollTop: { configurable: true, writable: true, value: 0 },
    });
    const scrollTo = vi.fn();
    viewport.scrollTo = scrollTo;
    fireEvent.scroll(viewport);
    const jumpButton = screen.getByRole("button", { name: "Scroll to bottom" });
    expect(jumpButton).not.toHaveTextContent("Scroll to bottom");
    fireEvent.click(jumpButton);

    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1000, behavior: "smooth" }));
    expect(screen.getByRole("button", { name: "Scroll to bottom" })).toBeInTheDocument();
    viewport.scrollTop = 700;
    fireEvent.scroll(viewport);
    expect(screen.queryByRole("button", { name: "Scroll to bottom" })).not.toBeInTheDocument();
  });

  it("keeps the thread, empty and conditional anatomy composable", () => {
    const { container } = render(
      <AIThread>
        <AIThreadViewport>
          <AIThreadIf when="empty" state={{ messageCount: 0, running: false }}>
            <AIThreadEmpty>Nothing yet</AIThreadEmpty>
          </AIThreadIf>
          <AIThreadIf when="running" state={{ messageCount: 0, running: false }}>
            <span>spinner</span>
          </AIThreadIf>
        </AIThreadViewport>
      </AIThread>,
    );
    expect(container.querySelector('[data-od-slot="ai-thread-root"]')).not.toBeNull();
    expect(screen.getByText("Nothing yet")).toHaveAttribute("data-od-slot", "ai-thread-empty");
    expect(screen.queryByText("spinner")).not.toBeInTheDocument();
  });

  it("labels the explicit scroll action from the locale contract", () => {
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIThreadScrollToBottom />
      </AILocaleProvider>,
    );
    expect(screen.getByRole("button", { name: "Scroll to bottom" })).toBeInTheDocument();
  });
});
