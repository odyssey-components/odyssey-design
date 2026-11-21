import { render, screen } from "@testing-library/react";
import { AITimeline, AITimelineItem } from "./AITimeline";

describe("AITimeline", () => {
  it("provides a composable list without owning event ordering", () => {
    render(
      <AITimeline aria-label="Conversation">
        <AITimelineItem>First</AITimelineItem>
        <AITimelineItem>Second</AITimelineItem>
      </AITimeline>,
    );
    expect(screen.getByRole("list", { name: "Conversation" })).toHaveAttribute("data-od-slot", "ai-timeline");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
