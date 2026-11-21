// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI controls render hidden form inputs inside these visible labels.

import { Button } from "@odyssey/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@odyssey/ui/card";

import { Code } from "@odyssey/ui/code";

import { ColorPicker } from "@odyssey/ui/color-picker";

import { FileInput } from "@odyssey/ui/file-input";

import { IconButton } from "@odyssey/ui/icon-button";
import { Input } from "@odyssey/ui/input";

import { Link } from "@odyssey/ui/link";

import { OdysseyProvider } from "@odyssey/ui/provider";
import { Textarea } from "@odyssey/ui/textarea";
import { odysseyThemes } from "@odyssey/ui/theme";
import type { ElementType } from "react";
import { ControlGroupDemo, StackWrapDemo } from "./layoutDemo";

export type DemoControl = { type: "boolean" } | { type: "text" } | { type: "select"; options: string[] };
export interface DemoDefinition {
  Component: ElementType;
  initialProps: Record<string, unknown>;
  controls: Record<string, DemoControl>;
  source: (props: Record<string, unknown>) => string;
}
const simple = (Component: ElementType, initialProps: Record<string, unknown>, controls: Record<string, DemoControl>, name: string): DemoDefinition => ({
  Component,
  controls,
  initialProps,
  source: (props) =>
    `<${name} ${Object.entries(props)
      .map(([key, value]) => (typeof value === "boolean" ? (value ? key : "") : `${key}=${JSON.stringify(value)}`))
      .filter(Boolean)
      .join(" ")} />`,
});

import * as DemoComponents from "./demoComponents";
import * as ProDemoComponents from "./proDemoComponents";

export const demos: Record<string, DemoDefinition> = {
  alert: simple(DemoComponents.AlertDemo, {}, {}, "DemoComponents.AlertDemo"),
  button: simple(
    Button,
    {
      children: "开始探索",
      disabled: false,
      loading: false,
      size: "md",
      variant: "solid",
    },
    {
      disabled: { type: "boolean" },
      loading: { type: "boolean" },
      size: { type: "select", options: ["sm", "md", "lg"] },
      variant: { type: "select", options: ["solid", "outline", "soft", "ghost", "link"] },
    },
    "Button",
  ),
  iconButton: simple(IconButton, { "aria-label": "收藏", children: "★" }, {}, "IconButton"),
  toggleButton: simple(DemoComponents.ToggleButtonDemo, {}, {}, "DemoComponents.ToggleButtonDemo"),
  toggleGroup: simple(DemoComponents.ToggleGroupDemo, {}, {}, "DemoComponents.ToggleGroupDemo"),
  code: simple(Code, { children: "tracker.min_interval", block: false }, { block: { type: "boolean" } }, "Code"),
  colorPicker: simple(ColorPicker, { label: "品牌色", defaultValue: "#1677ff" }, { disabled: { type: "boolean" } }, "ColorPicker"),
  link: simple(
    Link,
    {
      children: "阅读完整报道",
      ellipsis: false,
      href: "https://example.com",
      tone: "primary",
      underline: "hover",
    },
    {
      ellipsis: { type: "boolean" },
      tone: { type: "select", options: ["primary", "muted", "inherit"] },
      underline: { type: "select", options: ["hover", "always", "none"] },
    },
    "Link",
  ),
  card: {
    Component: () => (
      <Card hoverable style={{ maxWidth: "28rem" }}>
        <CardHeader>
          <CardTitle>设计工作区</CardTitle>
          <CardDescription>管理团队主题、组件与发布状态。</CardDescription>
          <CardAction>
            <Button size="sm" variant="ghost">
              设置
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>五个视觉预设共享同一套可访问组件 API。</CardContent>
        <CardFooter>
          <Button variant="solid">打开工作区</Button>
          <Button>查看变更</Button>
        </CardFooter>
      </Card>
    ),
    controls: {},
    initialProps: {},
    source: () => `<Card>\n  <CardHeader>…</CardHeader>\n  <CardContent>…</CardContent>\n  <CardFooter>…</CardFooter>\n</Card>`,
  },
  presetGallery: {
    Component: () => (
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(15rem, 1fr))" }}>
        {Object.entries(odysseyThemes).map(([name, theme]) => (
          <OdysseyProvider key={name} theme={theme} colorScheme="light">
            <Card>
              <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription>同一组件结构，不同视觉 recipe。</CardDescription>
              </CardHeader>
              <CardContent>
                <Input aria-label={`${name} 邮箱`} placeholder="name@example.com" />
              </CardContent>
              <CardFooter>
                <Button variant="solid">继续</Button>
                <Button>取消</Button>
              </CardFooter>
            </Card>
          </OdysseyProvider>
        ))}
      </div>
    ),
    controls: {},
    initialProps: {},
    source: () => `<OdysseyProvider theme={odysseyThemes.shadcn}>…</OdysseyProvider>`,
  },
  fluentPresetMatrix: simple(ProDemoComponents.FluentPresetMatrix, {}, {}, "ProDemoComponents.FluentPresetMatrix"),
  stack: simple(
    StackWrapDemo,
    { gap: 4, wrap: true },
    { gap: { type: "select", options: ["1", "2", "3", "4", "6", "8"] }, wrap: { type: "boolean" } },
    "StackWrapDemo",
  ),
  controlGroup: simple(ControlGroupDemo, {}, {}, "ControlGroupDemo"),
  input: simple(Input, { placeholder: "输入昵称" }, { disabled: { type: "boolean" }, placeholder: { type: "text" } }, "Input"),
  inputGroup: simple(DemoComponents.InputGroupDemo, {}, {}, "DemoComponents.InputGroupDemo"),
  numberField: simple(ProDemoComponents.NumberFieldDemo, {}, {}, "ProDemoComponents.NumberFieldDemo"),
  otpInput: simple(ProDemoComponents.OtpInputDemo, {}, {}, "ProDemoComponents.OtpInputDemo"),
  combobox: simple(DemoComponents.ComboboxDemo, {}, {}, "DemoComponents.ComboboxDemo"),
  fileInput: simple(FileInput, { "aria-label": "上传文件", accept: "image/png" }, { disabled: { type: "boolean" } }, "FileInput"),
  table: simple(ProDemoComponents.TableDemo, {}, {}, "ProDemoComponents.TableDemo"),
  pageForm: simple(ProDemoComponents.PageFormDemo, {}, {}, "ProDemoComponents.PageFormDemo"),
  proCountBadge: simple(ProDemoComponents.ProCountBadgeDemo, {}, {}, "ProDemoComponents.ProCountBadgeDemo"),
  textarea: simple(Textarea, { placeholder: "写下你的想法" }, { disabled: { type: "boolean" }, placeholder: { type: "text" } }, "Textarea"),
  checkbox: simple(DemoComponents.CheckboxDemo, {}, {}, "DemoComponents.CheckboxDemo"),
  collapsible: simple(DemoComponents.CollapsibleDemo, {}, {}, "DemoComponents.CollapsibleDemo"),
  descriptionList: simple(DemoComponents.DescriptionListDemo, {}, {}, "DemoComponents.DescriptionListDemo"),
  skeleton: simple(DemoComponents.SkeletonDemo, {}, {}, "DemoComponents.SkeletonDemo"),
  radioGroup: simple(DemoComponents.RadioGroupDemo, {}, {}, "DemoComponents.RadioGroupDemo"),
  proRadioGroup: simple(DemoComponents.ProRadioGroupDemo, {}, {}, "ProRadioGroupDemo"),
  pagination: simple(DemoComponents.PaginationDemo, {}, {}, "DemoComponents.PaginationDemo"),
  proPagination: simple(DemoComponents.ProPaginationDemo, {}, {}, "ProPaginationDemo"),
  proCheckboxGroup: simple(DemoComponents.ProCheckboxGroupDemo, {}, {}, "DemoComponents.ProCheckboxGroupDemo"),
  switch: simple(DemoComponents.SwitchDemo, {}, {}, "DemoComponents.SwitchDemo"),
  select: simple(DemoComponents.SelectDemo, {}, {}, "DemoComponents.SelectDemo"),
  dialog: simple(ProDemoComponents.DialogDemo, {}, {}, "ProDemoComponents.DialogDemo"),
  drawer: simple(ProDemoComponents.DrawerDemo, {}, {}, "ProDemoComponents.DrawerDemo"),
  popover: simple(ProDemoComponents.PopoverDemo, {}, {}, "ProDemoComponents.PopoverDemo"),
  dropdownMenu: simple(DemoComponents.DropdownMenuDemo, {}, {}, "DemoComponents.DropdownMenuDemo"),
  tooltip: simple(ProDemoComponents.TooltipDemo, {}, {}, "ProDemoComponents.TooltipDemo"),
  tabs: simple(ProDemoComponents.TabsDemo, {}, {}, "ProDemoComponents.TabsDemo"),
  toast: simple(DemoComponents.ToastDemo, {}, {}, "DemoComponents.ToastDemo"),
  proGallery: simple(ProDemoComponents.ProGalleryDemo, {}, {}, "ProDemoComponents.ProGalleryDemo"),
  proAdminLogin: simple(ProDemoComponents.ProAdminLoginDemo, {}, {}, "ProDemoComponents.ProAdminLoginDemo"),
};
