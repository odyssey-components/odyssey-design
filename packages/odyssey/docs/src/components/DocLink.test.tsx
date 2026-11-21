import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { DocLink } from "./DocLink";

function renderLink(props: Partial<ComponentProps<typeof DocLink>> = {}) {
  const onNavigate = vi.fn();
  render(
    <DocLink
      basePath="/docs"
      currentDocId="guide/intro"
      docPaths={{ "guide/next": "guide/next" }}
      docRoutes={{ "guide/next": "guide/next" }}
      href="./next#heading"
      {...props}
      onNavigate={onNavigate}
    >
      Next page
    </DocLink>,
  );
  return { link: screen.getByRole("link", { name: "Next page" }), onNavigate };
}

function clickDecision(link: HTMLElement, options: MouseEventInit = {}) {
  let preventedByHandlers: boolean | undefined;
  // React's handlers have run before this document listener. Observe their
  // decision, then suppress jsdom navigation only in the test harness.
  document.addEventListener(
    "click",
    (event) => {
      preventedByHandlers = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent(link, createEvent.click(link, { button: 0, ...options }));
  expect(preventedByHandlers).toBeDefined();
  return preventedByHandlers;
}

describe("DocLink activation", () => {
  it("keeps the resolved href and intercepts an ordinary internal click", () => {
    const { link, onNavigate } = renderLink();
    expect(link).toHaveAttribute("href", "/docs/guide/next#heading");
    expect(clickDecision(link)).toBe(true);
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("guide/next", "heading");
  });

  it.each(["altKey", "ctrlKey", "metaKey", "shiftKey"] as const)("preserves native activation with %s", (modifier) => {
    const onClick = vi.fn();
    const { link, onNavigate } = renderLink({ onClick });
    expect(clickDecision(link, { [modifier]: true })).toBe(false);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("does not intercept a non-primary click", () => {
    const { link, onNavigate } = renderLink();
    expect(clickDecision(link, { button: 1 })).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it.each(["_blank", "_parent", "_top", "named-frame"])("preserves target=%s", (target) => {
    const { link, onNavigate } = renderLink({ target });
    expect(link).toHaveAttribute("target", target);
    expect(clickDecision(link)).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it.each(["", "_self", "_SeLf"])("keeps current-context target=%s as SPA navigation", (target) => {
    const { link, onNavigate } = renderLink({ target });
    expect(clickDecision(link)).toBe(true);
    expect(onNavigate).toHaveBeenCalledExactlyOnceWith("guide/next", "heading");
  });

  it.each([true, "", "guide.html"])("preserves a download attribute (%s)", (download) => {
    const { link, onNavigate } = renderLink({ download });
    expect(link).toHaveAttribute("download");
    expect(clickDecision(link)).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("does not treat download=false as a present download attribute", () => {
    const { link, onNavigate } = renderLink({ download: false });
    expect(link).not.toHaveAttribute("download");
    expect(clickDecision(link)).toBe(true);
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("preserves caller cancellation before considering navigation", () => {
    const onClick = vi.fn((event) => event.preventDefault());
    const { link, onNavigate } = renderLink({ onClick });
    expect(clickDecision(link)).toBe(true);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("leaves external links to their native activation", () => {
    const { link, onNavigate } = renderLink({ href: "https://example.com/docs" });
    expect(link).toHaveAttribute("href", "https://example.com/docs");
    expect(clickDecision(link)).toBe(false);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
