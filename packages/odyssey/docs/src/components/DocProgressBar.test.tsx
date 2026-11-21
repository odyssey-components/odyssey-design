import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { DocProgressBar } from "./DocProgressBar";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("removes the navigation indicator when an active document view unmounts", () => {
  vi.useFakeTimers();
  const indicator = () => document.querySelector("[data-od-slot='docs-progress']");
  const { rerender, unmount } = render(<DocProgressBar active />);

  expect(indicator()).toHaveAttribute("data-active");
  rerender(<DocProgressBar active={false} />);
  expect(indicator()).not.toHaveAttribute("data-active");
  rerender(<DocProgressBar active />);
  unmount();
  expect(indicator()).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
