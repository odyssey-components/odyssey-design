import { render } from "@testing-library/react";
import { createRef } from "react";
import { Skeleton } from "./Skeleton";

it("marks loading content as hidden decoration and forwards its contract", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <Skeleton ref={ref} shape="circular" animation="pulse" className="custom-skeleton" style={{ width: 40 }} aria-label="ignored" />,
  );
  const skeleton = container.querySelector('[data-od-slot="skeleton"]');
  expect(skeleton).toBe(ref.current);
  expect(skeleton).toHaveAttribute("aria-hidden", "true");
  expect(skeleton).toHaveAttribute("data-shape", "circular");
  expect(skeleton).toHaveAttribute("data-animation", "pulse");
  expect(skeleton).toHaveClass("custom-skeleton");
  expect(skeleton).toHaveStyle({ width: "40px" });
});

it("stops the shimmer under the reduced motion preference", () => {
  const { container } = render(<Skeleton animation="wave" />);
  const skeleton = container.querySelector('[data-od-slot="skeleton"]');
  expect(skeleton).toBeInTheDocument();

  expect(skeleton).toHaveClass("od-Skeleton");
  expect(skeleton).toHaveAttribute("data-animation", "wave");
});
