import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { createRef, type MouseEvent } from "react";
import { Link } from "./Link";

describe("Link", () => {
  it("forwards native attributes, refs, and click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/story" id="story-link" onClick={onClick}>
        阅读报道
      </Link>,
    );
    const link = screen.getByRole("link", { name: "阅读报道" });
    expect(link).toHaveAttribute("href", "/story");
    expect(link).toHaveAttribute("id", "story-link");
    expect(ref.current).toBe(link);
    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("adds a safe default rel for new tabs and preserves an explicit rel", () => {
    const { rerender } = render(
      <Link href="https://example.com" target="_blank">
        外部链接
      </Link>,
    );
    expect(screen.getByRole("link", { name: "外部链接" })).toHaveAttribute("rel", "noopener noreferrer");
    rerender(
      <Link href="https://example.com" target="_blank" rel="nofollow">
        外部链接
      </Link>,
    );
    expect(screen.getByRole("link", { name: "外部链接" })).toHaveAttribute("rel", "nofollow");
  });

  it("exposes tone, underline, ellipsis, label, and decorative icon anatomy", () => {
    render(
      <Link href="/story" tone="muted" underline="always" ellipsis leadingIcon={<span>前</span>} trailingIcon={<span>后</span>}>
        很长的报道标题
      </Link>,
    );
    const link = screen.getByRole("link", { name: "很长的报道标题" });
    expect(link).toHaveAttribute("data-tone", "muted");
    expect(link).toHaveAttribute("data-underline", "always");
    expect(link).toHaveAttribute("data-ellipsis", "true");
    expect(link.querySelector('[data-od-slot="link-label"]')).toHaveTextContent("很长的报道标题");
    expect(link.querySelector('[data-od-slot="link-leading-icon"]')).toHaveAttribute("aria-hidden", "true");
    expect(link.querySelector('[data-od-slot="link-trailing-icon"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("has no basic accessibility violations", async () => {
    const { container } = render(<Link href="/story">阅读报道</Link>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
