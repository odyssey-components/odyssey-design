// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI renders the accessible switch control and hidden input inside the label.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, FieldDescription, FieldError, FieldLabel } from "../primitives/Field/Field";
import { Input } from "../primitives/Input/Input";
import { Switch, SwitchThumb } from "../primitives/Switch/Switch";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "../primitives/Tabs/Tabs";

describe("composed component contracts", () => {
  it("exposes stable semantic slots and switches tabs", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Tabs defaultValue="first">
        <TabsList aria-label="Sections">
          <TabsTab value="first">First</TabsTab>
          <TabsTab value="second">Second</TabsTab>
          <TabsIndicator />
        </TabsList>
        <TabsPanel value="first">First panel</TabsPanel>
        <TabsPanel value="second">Second panel</TabsPanel>
      </Tabs>,
    );
    expect(container.querySelector('[data-od-slot="tabs-list"]')).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Second" }));
    expect(screen.getByText("Second panel")).toBeVisible();
  });

  it("composes accessible field messaging", () => {
    render(
      <Field invalid>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" aria-invalid aria-describedby="email-help email-error" />
        <FieldDescription id="email-help">Work address</FieldDescription>
        <FieldError id="email-error">Invalid email</FieldError>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAccessibleDescription("Work address Invalid email");
    expect(screen.getByRole("alert")).toHaveAttribute("data-od-slot", "field-error");
  });

  it("keeps switch anatomy explicit", () => {
    render(
      <label>
        <Switch>
          <SwitchThumb />
        </Switch>
        Updates
      </label>,
    );
    expect(screen.getByRole("switch", { name: "Updates" })).toHaveAttribute("data-od-slot", "switch");
  });
});
