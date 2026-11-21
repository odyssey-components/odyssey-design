import { screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "../primitives/Alert";
import { Button } from "../primitives/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../primitives/Card";
import { Checkbox, CheckboxIndicator } from "../primitives/Checkbox";
import { Divider } from "../primitives/Divider";
import { Field, FieldLabel } from "../primitives/Field";
import { IconButton } from "../primitives/IconButton";
import { Input } from "../primitives/Input";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "../primitives/Select";
import { Switch, SwitchThumb } from "../primitives/Switch";
import { bySlot, type RtlCase } from "./rtl-harness";

const buttonClick = vi.fn();
const iconClick = vi.fn();

/** The core capabilities the contract requires on the Web platform. */
export const PRIMITIVE_RTL_CASES: RtlCase[] = [
  {
    id: "Button",
    classPrefix: "od-Button-",
    dirProp: true,
    render: (dir) => (
      <Button dir={dir} onClick={buttonClick}>
        Save
      </Button>
    ),
    root: bySlot("button"),
    keyboard: async (user, container) => {
      bySlot("button")(container).focus();
      await user.keyboard("{Enter}");
      expect(buttonClick).toHaveBeenCalled();
    },
  },
  {
    id: "IconButton",
    classPrefix: "od-IconButton-",
    dirProp: true,
    render: (dir) => (
      <IconButton dir={dir} aria-label="Favorite" onClick={iconClick}>
        <svg aria-hidden="true" />
      </IconButton>
    ),
    root: bySlot("icon-button"),
    keyboard: async (user, container) => {
      bySlot("icon-button")(container).focus();
      await user.keyboard("{Enter}");
      expect(iconClick).toHaveBeenCalled();
    },
  },
  {
    id: "TextInput",
    classPrefix: "od-Input-",
    dirProp: true,
    render: (dir) => (
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input dir={dir} />
      </Field>
    ),
    root: bySlot("input"),
    keyboard: async (user, container) => {
      const input = bySlot("input")(container);
      await user.click(input);
      await user.keyboard("abc");
      expect(input).toHaveValue("abc");
    },
  },
  {
    id: "Field",
    classPrefix: "od-Field-",
    dirProp: true,
    render: (dir) => (
      <Field dir={dir}>
        <FieldLabel>Email</FieldLabel>
        <Input />
      </Field>
    ),
    root: bySlot("field"),
    keyboard: async (user, container) => {
      const input = bySlot("input")(container);
      await user.click(input);
      await user.keyboard("z");
      expect(input).toHaveValue("z");
    },
  },
  {
    id: "Checkbox",
    classPrefix: "od-Checkbox-",
    dirProp: true,
    render: (dir) => (
      <label>
        <Checkbox dir={dir}>
          <CheckboxIndicator />
        </Checkbox>
        Receive updates
      </label>
    ),
    root: bySlot("checkbox"),
    keyboard: async (user, container) => {
      const checkbox = bySlot("checkbox")(container);
      checkbox.focus();
      await user.keyboard(" ");
      expect(checkbox).toBeChecked();
    },
  },
  {
    id: "Switch",
    classPrefix: "od-Switch-",
    dirProp: true,
    render: (dir) => (
      <Switch dir={dir} aria-label="Updates" defaultChecked>
        <SwitchThumb />
      </Switch>
    ),
    root: bySlot("switch"),
    keyboard: async (user, container) => {
      const control = bySlot("switch")(container);
      control.focus();
      await user.keyboard(" ");
      expect(control).not.toBeChecked();
    },
  },
  {
    id: "Select",
    classPrefix: "od-Select-",
    render: () => (
      <Select items={[{ label: "Shanghai", value: "shanghai" }]} value="shanghai">
        <SelectTrigger aria-label="City">
          <SelectValue placeholder="City" />
          <SelectIcon />
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectContent>
              <SelectList>
                <SelectItem value="shanghai">
                  <SelectItemText>Shanghai</SelectItemText>
                </SelectItem>
              </SelectList>
            </SelectContent>
          </SelectPositioner>
        </SelectPortal>
      </Select>
    ),
    root: bySlot("select-trigger"),
    keyboard: async (user, container) => {
      bySlot("select-trigger")(container).focus();
      await user.keyboard("{ArrowDown}");
      expect(await screen.findByRole("option")).toBeInTheDocument();
    },
  },
  {
    id: "Card",
    classPrefix: "od-Card-",
    dirProp: true,
    render: (dir) => (
      <Card dir={dir}>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    ),
    root: bySlot("card"),
  },
  {
    id: "Divider",
    classPrefix: "od-Divider-",
    dirProp: true,
    render: (dir) => <Divider dir={dir} orientation="vertical" />,
    root: bySlot("divider"),
  },
  {
    id: "Alert",
    classPrefix: "od-Alert-",
    dirProp: true,
    render: (dir) => (
      <Alert dir={dir} tone="warning">
        <AlertTitle>Sync failed</AlertTitle>
        <AlertDescription>Retrying</AlertDescription>
      </Alert>
    ),
    root: bySlot("alert"),
  },
];
