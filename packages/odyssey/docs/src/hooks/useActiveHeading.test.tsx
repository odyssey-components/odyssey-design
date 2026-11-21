import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useActiveHeading } from "./useActiveHeading";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("useActiveHeading", () => {
  it("uses the first outline item as the initial active heading", () => {
    const { result } = renderHook(() =>
      useActiveHeading([
        { depth: 2, id: "first", text: "First" },
        { depth: 2, id: "second", text: "Second" },
      ]),
    );

    expect(result.current).toBe("first");
  });

  it("updates the active heading from the app main scroll position", async () => {
    const outline = [
      { depth: 2, id: "first", text: "First" },
      { depth: 2, id: "second", text: "Second" },
    ];
    let observerCallback: IntersectionObserverCallback | undefined;
    let observerInstance: IntersectionObserver | undefined;
    const BaseIntersectionObserver = IntersectionObserver;
    vi.stubGlobal(
      "IntersectionObserver",
      class extends BaseIntersectionObserver {
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          super(callback, options);
          observerCallback = callback;
          observerInstance = this;
        }
      },
    );

    const root = document.createElement("main");
    root.className = "app-main";
    root.getBoundingClientRect = vi.fn(() => ({ bottom: 700, height: 600, left: 0, right: 900, toJSON: () => "", top: 100, width: 900, x: 0, y: 100 }));

    const firstHeading = document.createElement("h2");
    firstHeading.id = "first";
    firstHeading.getBoundingClientRect = vi.fn(() => ({
      bottom: 100,
      height: 40,
      left: 0,
      right: 900,
      toJSON: () => "",
      top: 80,
      width: 900,
      x: 0,
      y: 80,
    }));

    const secondHeading = document.createElement("h2");
    secondHeading.id = "second";
    secondHeading.getBoundingClientRect = vi.fn(() => ({
      bottom: 200,
      height: 40,
      left: 0,
      right: 900,
      toJSON: () => "",
      top: 160,
      width: 900,
      x: 0,
      y: 160,
    }));

    root.append(firstHeading, secondHeading);
    document.body.append(root);

    const { result } = renderHook(() => useActiveHeading(outline));

    await waitFor(() => expect(result.current).toBe("first"));

    firstHeading.getBoundingClientRect = vi.fn(() => ({
      bottom: -280,
      height: 40,
      left: 0,
      right: 900,
      toJSON: () => "",
      top: -320,
      width: 900,
      x: 0,
      y: -320,
    }));
    secondHeading.getBoundingClientRect = vi.fn(() => ({
      bottom: 140,
      height: 40,
      left: 0,
      right: 900,
      toJSON: () => "",
      top: 120,
      width: 900,
      x: 0,
      y: 120,
    }));
    if (!observerCallback || !observerInstance) throw new Error("IntersectionObserver was not created");
    const notify = observerCallback;
    const observer = observerInstance;
    act(() => {
      notify(
        [
          { isIntersecting: false, target: firstHeading },
          { isIntersecting: true, target: secondHeading },
        ] as unknown as IntersectionObserverEntry[],
        observer,
      );
    });

    await waitFor(() => expect(result.current).toBe("second"));
  });

  it("observes headings that arrive after the outline when content revision advances", () => {
    const outline = [
      { depth: 2, id: "first", text: "First" },
      { depth: 2, id: "second", text: "Second" },
    ];
    const observed: Element[] = [];
    const disconnected = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}
        observe(element: Element) {
          observed.push(element);
        }
        unobserve() {}
        disconnect() {
          disconnected();
        }
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = "";
        thresholds = [0];
      },
    );

    const { rerender } = renderHook(({ revision }) => useActiveHeading(outline, revision), { initialProps: { revision: 0 } });
    expect(observed).toEqual([]);

    const first = document.createElement("h2");
    first.id = "first";
    const second = document.createElement("h2");
    second.id = "second";
    document.body.append(first, second);

    rerender({ revision: 1 });

    expect(disconnected).toHaveBeenCalledTimes(1);
    expect(observed).toEqual([first, second]);
  });
});
