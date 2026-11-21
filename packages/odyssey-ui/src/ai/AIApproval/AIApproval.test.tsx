import { render, screen } from "@testing-library/react";
import { Button } from "../../primitives/Button";
import { AIApproval, AIApprovalActions, AIApprovalDescription, AIApprovalTitle } from "./AIApproval";

describe("AIApproval", () => {
  it("renders caller-supplied choices without performing native approval", () => {
    const { container } = render(
      <AIApproval state="pending" aria-labelledby="request-title">
        <AIApprovalTitle id="request-title">Permission requested</AIApprovalTitle>
        <AIApprovalDescription>Run tests on device A</AIApprovalDescription>
        <AIApprovalActions>
          <Button disabled>Allow once</Button>
          <Button>Deny</Button>
        </AIApprovalActions>
      </AIApproval>,
    );
    expect(container.querySelector('[data-od-slot="ai-approval"]')).toHaveAttribute("data-state", "pending");
    expect(container.querySelector('[data-od-slot="ai-approval"]')).toHaveClass("od-AIApproval-root");
    expect(screen.getByRole("button", { name: "Allow once" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Deny" })).toBeEnabled();
  });
});
