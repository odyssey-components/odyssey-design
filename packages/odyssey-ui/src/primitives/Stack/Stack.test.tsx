import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

it("forwards native attributes", () => {
  render(
    <Stack aria-label="Actions" wrap style={{ justifyContent: "space-evenly" }}>
      Content
    </Stack>,
  );
  expect(screen.getByLabelText("Actions")).toHaveAttribute("data-wrap", "true");
  expect(screen.getByLabelText("Actions")).toHaveStyle({ justifyContent: "space-evenly" });
});
