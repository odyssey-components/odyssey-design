import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AppShell, AppShellContent, AppShellHeader, AppShellMain, AppShellSidebar } from "./AppShell";

describe("AppShell", () => {
  it("exposes semantic anatomy and forwards attributes", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell ref={ref} aria-label="Workspace">
        <AppShellSidebar>Navigation</AppShellSidebar>
        <AppShellMain>
          <AppShellHeader>Header</AppShellHeader>
          <AppShellContent>Content</AppShellContent>
        </AppShellMain>
      </AppShell>,
    );
    expect(ref.current).toHaveAttribute("data-od-slot", "app-shell");
    expect(screen.getByText("Navigation").closest("aside")).toHaveAttribute("data-od-slot", "app-shell-sidebar");
    expect(screen.getByText("Header").closest("header")).toHaveAttribute("data-od-slot", "app-shell-header");
  });
});
