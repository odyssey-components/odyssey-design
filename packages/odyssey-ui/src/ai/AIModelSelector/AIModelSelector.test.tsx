import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIModelSelector } from "./AIModelSelector";

const models = [
  { id: "fast", label: "Fast model" },
  { id: "deep", label: "Deep model" },
];

describe("AIModelSelector", () => {
  it("shows the selected model and reports a new selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<AIModelSelector models={models} value="fast" onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("data-od-slot", "ai-model-selector-trigger");
    expect(screen.getByText("Fast model")).toBeInTheDocument();

    await user.click(trigger);
    await user.click(await screen.findByRole("option", { name: "Deep model" }));

    expect(onValueChange).toHaveBeenCalledWith("deep");
  });

  it("renders nothing without a model to choose from", () => {
    const { container } = render(<AIModelSelector models={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("offers the placeholder first and shows it while nothing is picked", async () => {
    const onValueChange = vi.fn();
    render(<AIModelSelector models={models} value="" onValueChange={onValueChange} placeholder="沿用会话设置" />);

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("沿用会话设置");

    fireEvent.click(trigger);
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(3);
    expect(screen.getByRole("option", { name: "沿用会话设置" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fast model" })).toBeInTheDocument();

    const placeholder = screen.getByRole("option", { name: "沿用会话设置" });
    fireEvent.pointerDown(placeholder);
    fireEvent.click(placeholder);
    expect(onValueChange).toHaveBeenCalledWith("");
  });

  it("marks the default model", async () => {
    render(<AIModelSelector models={[{ id: "fast", label: "Fast model", isDefault: true }]} value="fast" placeholder="沿用会话设置" />);

    fireEvent.click(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: /Fast model/ });
    expect(option.textContent).toContain("默认");
  });
});
