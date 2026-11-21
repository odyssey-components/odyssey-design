import { fireEvent, render, screen } from "@testing-library/react";
import { AISuggestionDescription, AISuggestionList, AISuggestionTitle, AISuggestionTrigger } from "./AISuggestion";

const suggestion = { id: "summary", title: "Summarize material", description: "Extract the key points", prompt: "Summarize this material" };

describe("AISuggestion", () => {
  it("reports the selected prompt", () => {
    const onSelect = vi.fn();
    render(<AISuggestionList suggestions={[suggestion]} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Summarize material/ }));

    expect(onSelect).toHaveBeenCalledWith(suggestion.prompt);
    expect(screen.getByText("Extract the key points")).toHaveAttribute("data-od-slot", "ai-suggestion-description");
  });

  it("disables selection while loading", () => {
    const onSelect = vi.fn();
    const { rerender } = render(<AISuggestionTrigger suggestion={suggestion} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /Summarize material/ }));
    expect(onSelect).toHaveBeenCalledWith(suggestion.prompt);

    rerender(<AISuggestionTrigger suggestion={suggestion} onSelect={onSelect} loading />);
    expect(screen.getByRole("button", { name: /Summarize material/ })).toBeDisabled();
  });

  it("renders the suggestion title and description anatomy", () => {
    render(
      <AISuggestionTrigger suggestion={suggestion} onSelect={() => undefined}>
        <span>
          <AISuggestionTitle />
          <AISuggestionDescription />
        </span>
      </AISuggestionTrigger>,
    );
    expect(screen.getByText("Summarize material")).toHaveAttribute("data-od-slot", "ai-suggestion-title");
    expect(screen.getByText("Extract the key points")).toHaveAttribute("data-od-slot", "ai-suggestion-description");
  });
});
