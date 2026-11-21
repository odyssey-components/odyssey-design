import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

it("provides a localized status name", () => {
  render(<Spinner />);
  expect(screen.getByRole("status")).toHaveAttribute("data-od-slot", "spinner");
});
