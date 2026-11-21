import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProAdminProvider } from "../ProAdminProvider";
import { ProAdminShell } from "./ProAdminShell";

describe("ProAdminShell", () => {
  it("opens one named mobile navigation drawer and restores focus on Escape", async () => {
    const user = userEvent.setup();
    render(
      <ProAdminProvider appearance={{ storageKey: "shell-mobile-navigation-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Console" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            children: <p>Content</p>,
          }}
        />
      </ProAdminProvider>,
    );
    const trigger = screen.getByRole("button", { name: "打开菜单" });
    await user.click(trigger);
    const dialogs = await screen.findAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
    expect(dialogs[0]).toHaveAccessibleName("Console");
    expect(dialogs[0]).toHaveAttribute("data-od-slot", "pro-admin-mobile-drawer");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("composes navigation, account and content from options", () => {
    render(
      <ProAdminProvider appearance={{ storageKey: "shell-options-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Console" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            account: { user: { displayName: "Ada", roleLabel: "Admin" }, onLogout: vi.fn(async () => undefined) },
            children: <main>Content</main>,
          }}
        />
      </ProAdminProvider>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
  });

  it("supports network consoles without an account or logout menu", () => {
    const { container } = render(
      <ProAdminProvider appearance={{ storageKey: "shell-no-account-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Mesh" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            children: <main>Network</main>,
          }}
        />
      </ProAdminProvider>,
    );
    expect(screen.getByText("Network")).toBeInTheDocument();
    expect(container.querySelector('[data-od-slot="pro-admin-user-menu-trigger"]')).toBeNull();
  });

  it("styles desktop modules as a compact top navigation", () => {
    const { container } = render(
      <ProAdminProvider appearance={{ storageKey: "shell-top-navigation-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Console" },
            navigation: {
              items: [
                { key: "home", label: "Home" },
                { key: "settings", label: "Settings" },
              ],
              activeKey: "home",
              onChange: vi.fn(),
            },
            children: <main>Content</main>,
          }}
        />
      </ProAdminProvider>,
    );
    const desktopNavigation = container.querySelector('[data-od-navigation-surface="desktop"]');
    expect(desktopNavigation).toBeTruthy();
    const activeItem = desktopNavigation?.querySelector('[aria-current="page"]');
    expect(activeItem).toHaveAttribute("data-od-navigation-surface", "desktop");
    expect(desktopNavigation).toHaveClass("od-ProAdminShell-navigation");
    expect(activeItem).toHaveClass("od-ProAdminShell-navigationItem");
    expect(activeItem).toHaveAttribute("aria-current", "page");
  });

  it("expands contextual navigation groups without selecting a resource", () => {
    const onChange = vi.fn();
    render(
      <ProAdminProvider appearance={{ storageKey: "shell-nested-navigation-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Console" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange },
            contextualNavigation: [{ key: "workloads", label: "Workloads", children: [{ key: "pods", label: "Pods" }] }],
            contextualActiveKey: "pods",
            children: <main>Content</main>,
          }}
        />
      </ProAdminProvider>,
    );

    const group = screen.getByRole("button", { name: "Workloads" });
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(group.querySelector('[data-od-slot="pro-admin-navigation-disclosure"]')).not.toHaveAttribute("data-state");
    expect(screen.getByRole("button", { name: "Pods" })).toBeInTheDocument();
    const submenu = screen.getByText("Pods").closest('[data-od-slot="pro-admin-navigation-submenu"]');
    expect(submenu).not.toHaveAttribute("inert");
    fireEvent.click(group);
    expect(group).toHaveAttribute("aria-expanded", "false");
    expect(group.querySelector('[data-od-slot="pro-admin-navigation-disclosure"]')).not.toHaveAttribute("data-state");
    expect(screen.queryByRole("button", { name: "Pods" })).toBeNull();
    expect(submenu).toHaveAttribute("inert");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders nested navigation inside an animated disclosure region", () => {
    const { container } = render(
      <ProAdminProvider appearance={{ storageKey: "shell-nested-motion-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "Console" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            contextualNavigation: [{ key: "workloads", label: "Workloads", children: [{ key: "pods", label: "Pods" }] }],
            children: <main>Content</main>,
          }}
        />
      </ProAdminProvider>,
    );
    const disclosure = container.querySelector('[data-od-slot="pro-admin-navigation-submenu"]');
    expect(disclosure).toHaveAttribute("data-state", "open");
    const navigation = disclosure?.closest('[data-od-slot="pro-admin-navigation"]');
    expect(navigation).toHaveClass("od-ProAdminShell-navigation");
    expect(disclosure).toHaveAttribute("data-state", "open");
  });

  it("gives the brand room to shrink and ellipsizes its name instead of cutting it", () => {
    const { container } = render(
      <ProAdminProvider appearance={{ storageKey: "shell-brand-test" }}>
        <ProAdminShell
          options={{
            brand: { name: "OdyDelivery", subtitle: "BUILD · SHIP · RUN" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            children: <main>Content</main>,
          }}
        />
      </ProAdminProvider>,
    );
    const brand = container.querySelector('[data-od-slot="pro-admin-brand"]')!;
    expect(brand).toHaveClass("od-ProAdminShell-brand");
    expect(brand).toHaveTextContent("OdyDelivery");
    expect(container.querySelector('[data-od-slot="pro-admin-header-actions"]')).toHaveClass("od-ProAdminShell-headerActions");
  });

  it("supports consumer styling and content slots without leaking props to the DOM", () => {
    const { container } = render(
      <ProAdminProvider appearance={{ storageKey: "shell-sidebar-width-test" }}>
        <ProAdminShell
          className="console"
          classNames={{ root: "workspace-shell", sidebar: "resource-sidebar" }}
          styles={{ sidebar: { maxWidth: 320 } }}
          slots={{ content: (content) => <section aria-label="Workspace">{content}</section> }}
          options={{
            brand: { name: "Console" },
            navigation: { items: [{ key: "home", label: "Home" }], activeKey: "home", onChange: vi.fn() },
            contextualNavigation: [{ key: "resources", label: "资源", children: [{ key: "persistentvolumeclaims", label: "PersistentVolumeClaim" }] }],
            children: <p>Content</p>,
          }}
        />
      </ProAdminProvider>,
    );
    const sidebar = container.querySelector('[data-od-slot="pro-admin-sidebar"]')!;
    expect(sidebar).toHaveClass("od-ProAdminShell-sidebar", "resource-sidebar");
    expect(sidebar).toHaveStyle({ maxWidth: "320px" });
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("region", { name: "Workspace" }));
    expect(container.querySelector('[data-od-slot="pro-admin-shell"]')).toHaveClass("workspace-shell", "console");
  });
});
