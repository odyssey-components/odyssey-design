import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { createRef } from "react";
import { OdysseyProvider } from "../../OdysseyProvider";
import { odysseyThemes } from "../../theme";
import { Button, ButtonIcon } from "./Button";

describe("Button", () => {
  it("forwards its ref and renders static utility classes", () => {
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<Button ref={ref}>引用</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    const button = screen.getByRole("button", { name: "引用" });
    expect(button).toHaveClass("inline-flex", "focus-visible:outline-none");
    rerender(
      <Button ref={ref} className="px-8">
        引用
      </Button>,
    );
    expect(button).toHaveClass("px-8");
  });

  it("fires actions and forwards native attributes", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} type="button">
        保存
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks interaction while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );
    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["sm", "md", "lg"] as const)("composes decorative icons at %s size without changing DOM order", (size) => {
    const startRef = createRef<HTMLSpanElement>();
    render(
      <Button size={size}>
        <ButtonIcon ref={startRef} data-testid="start-icon">
          <svg />
        </ButtonIcon>
        保存
        <ButtonIcon data-testid="end-icon">
          <svg />
        </ButtonIcon>
      </Button>,
    );
    const button = screen.getByRole("button", { name: "保存" });
    expect(startRef.current).toHaveAttribute("data-od-slot", "button-icon");
    expect(startRef.current).toHaveAttribute("aria-hidden", "true");
    expect(button.children[0]).toBe(screen.getByTestId("start-icon"));
    expect(startRef.current?.nextElementSibling).toBe(screen.getByTestId("end-icon"));
  });

  it("keeps keyboard focus visible without relying on colour alone", async () => {
    const user = userEvent.setup();
    render(<Button>保存</Button>);
    const button = screen.getByRole("button", { name: "保存" });

    await user.tab();
    expect(button).toHaveFocus();

    // The official focus paint is a spread halo — the ring at half its
    // opacity — so the focus ring is a shadow that carries a width of its
    // own rather than a solid outline.
    expect(button.className).toContain("focus-visible:shadow-[var(--od-button-focus-shadow)]");
  });

  /**
   * The official recipe swaps the border for the ring colour on every
   * variant. Each variant carries the border it already wears, so only the
   * colour moves: the border width is never touched.
   */
  it("recolours the border of every variant on focus", () => {
    const cases = [
      ["outline", "neutral", "--od-button-focus-border"],
      ["solid", "neutral", "--od-button-solid-focus-border"],
      ["soft", "neutral", "--od-button-ghost-focus-border"],
      ["ghost", "neutral", "--od-button-ghost-focus-border"],
      ["link", "neutral", "--od-button-ghost-focus-border"],
      ["solid", "danger", "--od-button-danger-solid-focus-border"],
    ] as const;
    for (const [variant, tone, variable] of cases) {
      const { unmount } = render(
        <Button variant={variant} tone={tone} data-od-slot="button">
          {variant}
        </Button>,
      );
      const button = screen.getByRole("button", { name: variant });
      expect(button.className).toContain(`focus-visible:border-[var(${variable})]`);
      unmount();
    }
  });

  it("activates on Enter and on Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>保存</Button>);
    const button = screen.getByRole("button", { name: "保存" });

    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("distinguishes its hover, active and disabled states in the state matrix", () => {
    const { rerender } = render(<Button variant="solid">保存</Button>);
    const button = screen.getByRole("button", { name: "保存" });

    expect(button.className).toContain("hover:bg-[var(--od-primary-hover)]");
    expect(button.className).toContain("active:bg-[var(--od-primary-active)]");
    expect(button.className).toContain("disabled:cursor-not-allowed");

    rerender(
      <Button variant="solid" disabled>
        保存
      </Button>,
    );
    expect(button).toBeDisabled();
    expect(button.className).toContain("disabled:bg-[color-mix(in_oklch,var(--_od-button-background)_50%,transparent)]");
  });

  it("has no basic accessibility violations", async () => {
    const { container } = render(<Button>继续</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps ghost buttons transparent and shadowless through its variant classes", () => {
    render(<Button variant="ghost">次级操作</Button>);
    const button = screen.getByRole("button", { name: "次级操作" });
    expect(button).toHaveClass("bg-[var(--_od-button-background)]", "border-transparent", "shadow-none");
  });

  it("renders and cleans up an outline wave selected by the preset recipe", () => {
    render(<Button>保存</Button>);
    const button = screen.getByRole("button", { name: "保存" });
    button.style.setProperty("--_od-feedback-outline-wave-enabled", "1");
    button.style.setProperty("--od-duration-fast", "120ms");
    fireEvent.click(button);
    const effect = button.querySelector('[data-od-slot="button-feedback-effect"]');
    expect(effect).toBeInTheDocument();
    if (effect) {
      effect.dispatchEvent(Object.assign(new Event("animationend", { bubbles: true }), { animationName: "od-outline-wave-opacity", elapsedTime: 2 }));
    }
    expect(button.querySelector('[data-od-slot="button-feedback-effect"]')).not.toBeInTheDocument();
  });

  it("starts a positional ripple and releases it with the pointer", () => {
    render(<Button variant="solid">继续</Button>);
    const button = screen.getByRole("button", { name: "继续" });
    button.style.setProperty("--_od-feedback-radial-ripple-enabled", "1");
    button.style.setProperty("--od-duration-fast", "120ms");
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      bottom: 40,
      height: 40,
      left: 0,
      right: 100,
      toJSON: () => ({}),
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    });
    fireEvent.pointerDown(button, { clientX: 20, clientY: 10, pointerId: 1, pointerType: "mouse" });
    const effect = button.querySelector('[data-od-slot="button-feedback-effect"]');
    expect(effect).toBeInTheDocument();
    expect((effect as HTMLElement).style.getPropertyValue("--_od-ripple-x")).not.toBe("");
    fireEvent.pointerUp(button, { pointerId: 1, pointerType: "mouse" });
    const child = effect?.firstElementChild;
    if (child) fireEvent.animationEnd(child);
    expect(button.querySelector('[data-od-slot="button-feedback-effect"]')).not.toBeInTheDocument();
  });

  it("allows interaction feedback to be disabled without affecting clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disablePressFeedback onClick={onClick}>
        保存
      </Button>,
    );
    const button = screen.getByRole("button", { name: "保存" });
    button.style.setProperty("--_od-feedback-outline-wave-enabled", "1");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.querySelector('[data-od-slot="button-feedback-effect"]')).not.toBeInTheDocument();
  });
});

describe("Button press states", () => {
  const variants = [
    ["outline", "neutral"],
    ["solid", "neutral"],
    ["soft", "neutral"],
    ["ghost", "neutral"],
    ["link", "neutral"],
    ["solid", "danger"],
  ] as const;

  function renderButton(variant: (typeof variants)[number][0], tone: (typeof variants)[number][1], scheme: "light" | "dark") {
    const view = render(
      <OdysseyProvider theme={odysseyThemes.shadcn} colorScheme={scheme}>
        <Button variant={variant} tone={tone}>
          press
        </Button>
      </OdysseyProvider>,
    );
    const button = screen.getByRole("button", { name: "press" });
    return { ...view, button };
  }

  it.each((["light", "dark"] as const).flatMap((scheme) => variants.map(([variant, tone]) => [scheme, variant, tone] as const)))(
    "keeps utility variants static in %s mode for the %s button",
    (scheme, variant, tone) => {
      const { button, unmount } = renderButton(variant, tone, scheme);
      expect(button).toHaveAttribute("data-variant", variant);
      expect(button).toHaveAttribute("data-tone", tone);
      expect(button.className).toContain(variant === "ghost" ? "bg-transparent" : "inline-flex");
      unmount();
    },
  );

  it.each(["ant-design", "fluent", "material-design"] as const)("keeps the preset press nudge scoped to its theme %s", (themeId) => {
    const view = render(
      <OdysseyProvider theme={odysseyThemes[themeId]} colorScheme="light">
        <Button variant="outline">press</Button>
      </OdysseyProvider>,
    );
    const button = screen.getByRole("button", { name: "press" });
    expect(button).toHaveClass("od-Button-outline");
    view.unmount();
  });
});
