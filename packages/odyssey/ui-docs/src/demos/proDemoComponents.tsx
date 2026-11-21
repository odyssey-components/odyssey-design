// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI controls render hidden form inputs inside these visible labels.

import { ProAdminLogin } from "@odyssey/pro/admin-login";
import { ProAdminProvider } from "@odyssey/pro/admin-provider";

import { ProCountBadge } from "@odyssey/pro/count-badge";
import { ProForm } from "@odyssey/pro/form";
import { ProNumberField } from "@odyssey/pro/number-field";
import { ProOtpField } from "@odyssey/pro/otp-field";

import { ProSelect } from "@odyssey/pro/select";
import { type ProColumnDef, ProTable, ProTableBulkActions, ProTableColumnVisibility, ProTableSearch, ProTableToolbar } from "@odyssey/pro/table";

import { Button, ButtonIcon } from "@odyssey/ui/button";

import { Dialog } from "@odyssey/ui/primitives/dialog";
import { Drawer, DrawerBody, DrawerContent, DrawerTitle, DrawerTrigger } from "@odyssey/ui/drawer";

import { Form } from "@odyssey/ui/form";

import { Input } from "@odyssey/ui/input";

import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@odyssey/ui/number-field";
import { OtpGroup, OtpInput, OtpSlot } from "@odyssey/ui/otp-input";
import { Page, PageActions, PageContent, PageDescription, PageHeader, PageTitle } from "@odyssey/ui/page";

import { Popover, PopoverContent, PopoverPortal, PopoverPositioner, PopoverTrigger } from "@odyssey/ui/popover";

import { Stack } from "@odyssey/ui/stack";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@odyssey/ui/table";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@odyssey/ui/tabs";

import { Tooltip, TooltipContent, TooltipPortal, TooltipPositioner, TooltipProvider, TooltipTrigger } from "@odyssey/ui/tooltip";
import * as z from "zod/v4";
import { CheckboxDemo, DropdownMenuDemo, RadioGroupDemo, SelectDemo, SwitchDemo } from "./demoComponents";

interface ProDemoRow extends Record<string, unknown> {
  id: string;
  name: string;
}

const proColumns: ProColumnDef<ProDemoRow>[] = [{ accessorKey: "name", header: "成员" }];
const proSchema = z.object({ name: z.string().min(1, "请输入名称") });

export function ProGalleryDemo() {
  return (
    <Stack gap={4}>
      <ProSelect
        label="工作区"
        options={[{ label: "设计系统", value: "design" }]}
        defaultValue="design"
        style={{ width: "10rem" }}
        contentProps={{ width: "18rem" }}
      />
      <ProTable<ProDemoRow>
        options={{
          columns: proColumns,
          dataSource: [{ id: "1", name: "Ada" }],
          rowKey: "id",
          selection: {},
          toolbar: (
            <ProTableToolbar>
              <ProTableSearch aria-label="搜索成员" placeholder="搜索成员" />
              <ProTableBulkActions>
                <Button size="sm">批量操作</Button>
              </ProTableBulkActions>
              <ProTableColumnVisibility />
            </ProTableToolbar>
          ),
        }}
      />
      <ProForm
        options={{ schema: proSchema, defaultValues: { name: "" }, fields: [{ label: "名称", name: "name", type: "text" }], onSubmit: () => undefined }}
      />
      <ProNumberField label="数量" defaultValue={1} min={0} />
      <ProOtpField label="动态验证码" defaultValue="123456" />
    </Stack>
  );
}
export function ProAdminLoginDemo() {
  return (
    <ProAdminProvider appearance={{ storageKey: "odyssey-docs-admin-appearance" }}>
      <ProAdminLogin appName="Odyssey Admin" onSubmit={() => undefined} style={{ minHeight: "28rem" }} />
    </ProAdminProvider>
  );
}
export function DialogDemo() {
  return (
    <Dialog
      title="保存设置"
      description="你可以随时回来修改。"
      trigger={<Button>打开对话框</Button>}
      content="确认后将保存当前设置。"
      confirm={{ onConfirm: () => undefined }}
    />
  );
}

export function NumberFieldDemo() {
  return (
    <NumberField defaultValue={2} min={0} max={10}>
      <NumberFieldGroup>
        <NumberFieldInput aria-label="数量" />
        <NumberFieldIncrement />
        <NumberFieldDecrement />
      </NumberFieldGroup>
    </NumberField>
  );
}

export function OtpInputDemo() {
  return (
    <OtpInput aria-label="动态验证码" defaultValue="123" maxLength={6}>
      <OtpGroup>
        {["one", "two", "three", "four", "five", "six"].map((key, index) => (
          <OtpSlot key={key} index={index} />
        ))}
      </OtpGroup>
    </OtpInput>
  );
}
export function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button>打开工作台设置</Button>} />
      <DrawerContent>
        <DrawerTitle>工作台设置</DrawerTitle>
        <DrawerBody>
          <SelectDemo />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button>打开浮层</Button>} />
      <PopoverPortal>
        <PopoverPositioner>
          <PopoverContent>这里可以放置补充操作或内容。</PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button>悬停或聚焦</Button>} />
        <TooltipPortal>
          <TooltipPositioner>
            <TooltipContent>这是一段辅助说明</TooltipContent>
          </TooltipPositioner>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}
export function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="项目">
        <TabsTab value="overview">概览</TabsTab>
        <TabsTab value="activity">动态</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="overview">项目概览内容</TabsPanel>
      <TabsPanel value="activity">最近动态内容</TabsPanel>
    </Tabs>
  );
}
export function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>门店</TableHead>
          <TableHead>状态</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>西湖店</TableCell>
          <TableCell>营业中</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export function FluentPresetMatrix() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <Stack direction="row" gap={2} wrap>
        <Button variant="solid">Primary</Button>
        <Button>Secondary</Button>
        <Button variant="ghost">Subtle</Button>
        <Button tone="danger">Danger</Button>
      </Stack>
      <Input aria-label="Fluent sample input" defaultValue="Fluent 2 Web" />
      <Stack direction="row" gap={4} wrap>
        <CheckboxDemo />
        <RadioGroupDemo />
        <SwitchDemo />
      </Stack>
      <Stack direction="row" gap={2} wrap>
        <DropdownMenuDemo />
        <DialogDemo />
      </Stack>
      <TabsDemo />
      <TableDemo />
    </div>
  );
}
export function PageFormDemo() {
  return (
    <Page style={{ padding: 0 }}>
      <PageHeader>
        <PageTitle>门店管理</PageTitle>
        <PageDescription>维护门店基础信息。</PageDescription>
        <PageActions>
          <Button variant="solid">
            <ButtonIcon>＋</ButtonIcon>新增门店
          </Button>
          <Button>导出</Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        <Form variant="responsive-grid">
          <Input aria-label="名称" placeholder="门店名称" />
          <Button type="submit">查询</Button>
        </Form>
      </PageContent>
    </Page>
  );
}

export function ProCountBadgeDemo() {
  return (
    <Stack direction="row" gap={6} align="center" wrap>
      <ProCountBadge count={120} overflowCount={99} />
      <ProCountBadge count={8}>
        <Button>消息</Button>
      </ProCountBadge>
      <ProCountBadge count={1} dot label="有新动态">
        <span>动态</span>
      </ProCountBadge>
    </Stack>
  );
}
