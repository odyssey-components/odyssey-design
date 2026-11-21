import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack } from "./Slider";

it("supports keyboard value changes", async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Slider defaultValue={2} min={1} max={5} onValueChange={onValueChange}>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
        </SliderTrack>
        <SliderThumb aria-label="候选点" />
      </SliderControl>
    </Slider>,
  );
  const thumb = screen.getByRole("slider", { name: "候选点" });
  thumb.focus();
  await user.keyboard("{ArrowRight}");
  expect(onValueChange).toHaveBeenLastCalledWith(3, expect.anything());
});

it("keeps the native range input visually hidden", () => {
  render(
    <Slider defaultValue={2} min={1} max={5}>
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
        </SliderTrack>
        <SliderThumb aria-label="候选点" />
      </SliderControl>
    </Slider>,
  );

  expect(screen.getByRole("slider", { name: "候选点" }).parentElement?.parentElement?.parentElement).toHaveClass("[&_input[type=range]]:opacity-0");
  expect(document.querySelector('[data-od-slot="slider-control"]')).toHaveClass("relative");
});
