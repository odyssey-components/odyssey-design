import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

it("toggles collapsible content and forwards anatomy refs and native props", async () => {
  const user = userEvent.setup();
  const rootRef = createRef<HTMLDetailsElement>();
  const triggerRef = createRef<HTMLElement>();
  const contentRef = createRef<HTMLDivElement>();
  render(
    <Collapsible ref={rootRef} className="custom-root" onToggle={() => undefined}>
      <CollapsibleTrigger ref={triggerRef} className="custom-trigger">
        More
      </CollapsibleTrigger>
      <CollapsibleContent ref={contentRef} className="custom-content">
        Details
      </CollapsibleContent>
    </Collapsible>,
  );
  await user.click(screen.getByText("More"));
  expect(screen.getByText("More").closest("details")).toHaveAttribute("open");
  expect(rootRef.current).toHaveClass("custom-root");
  expect(triggerRef.current).toHaveAttribute("data-od-slot", "collapsible-trigger");
  expect(contentRef.current).toHaveClass("custom-content");
});
