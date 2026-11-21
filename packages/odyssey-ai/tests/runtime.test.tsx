import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OdysseyAIRuntimeProvider, useComposerState } from "../src/react";
import { createOdysseyAIRuntime } from "../src/runtime";

describe("Odyssey AI runtime", () => {
  it("publishes stable selector updates", () => {
    const runtime = createOdysseyAIRuntime();
    const listener = vi.fn();
    runtime.subscribe(listener);
    const Probe = () => <span>{useComposerState((state) => state.input)}</span>;
    render(
      <OdysseyAIRuntimeProvider runtime={runtime}>
        <Probe />
      </OdysseyAIRuntimeProvider>,
    );

    act(() => runtime.update({ ...runtime.getSnapshot().thread, input: "Odyssey", hydrated: true }));

    expect(screen.getByText("Odyssey")).not.toBeNull();
    expect(listener).toHaveBeenCalledOnce();
  });
});
