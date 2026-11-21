// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI controls render hidden form inputs inside these visible labels.

import { ProCheckboxGroup } from "@odyssey/pro/checkbox-group";

import { ProPagination } from "@odyssey/pro/pagination";
import { ProRadioGroup } from "@odyssey/pro/radio-group";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@odyssey/ui/alert";
import { Button } from "@odyssey/ui/button";

import { Checkbox, CheckboxGroup, CheckboxIndicator } from "@odyssey/ui/checkbox";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@odyssey/ui/collapsible";

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPortal, ComboboxPositioner } from "@odyssey/ui/combobox";
import { DescriptionDetail, DescriptionItem, DescriptionList, DescriptionTerm } from "@odyssey/ui/description-list";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuTrigger,
} from "@odyssey/ui/dropdown-menu";

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@odyssey/ui/input-group";

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNextLink, PaginationPreviousLink } from "@odyssey/ui/pagination";

import { RadioButton, RadioGroup, RadioGroupIndicator, RadioGroupItem } from "@odyssey/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@odyssey/ui/select";
import { Skeleton } from "@odyssey/ui/skeleton";
import { Stack } from "@odyssey/ui/stack";
import { Switch, SwitchThumb } from "@odyssey/ui/switch";

import { useToast } from "@odyssey/ui/toast";
import { ToggleButton } from "@odyssey/ui/toggle-button";
import { ToggleGroup } from "@odyssey/ui/toggle-group";

import { useState } from "react";

export function ToastDemo() {
  const toast = useToast();
  return (
    <Button
      onClick={() =>
        toast.show({
          title: "保存成功",
          description: "内容已经同步。",
          tone: "success",
        })
      }
    >
      显示通知
    </Button>
  );
}

export function AlertDemo() {
  const [visible, setVisible] = useState(true);
  if (!visible) return <Button onClick={() => setVisible(true)}>再次显示</Button>;
  return (
    <Alert tone="warning" style={{ maxWidth: "32rem" }}>
      <AlertTitle>同步暂时中断</AlertTitle>
      <AlertDescription>本地修改仍然安全，可以立即重试或关闭提示。</AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          重试
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setVisible(false)}>
          关闭
        </Button>
      </AlertAction>
    </Alert>
  );
}
export function CheckboxDemo() {
  return (
    <CheckboxGroup aria-label="通知渠道" defaultValue={["product"]} orientation="horizontal">
      <label>
        <Checkbox value="product">
          <CheckboxIndicator />
        </Checkbox>{" "}
        产品更新
      </label>
      <label>
        <Checkbox value="security">
          <CheckboxIndicator />
        </Checkbox>{" "}
        安全提醒
      </label>
    </CheckboxGroup>
  );
}
export function ProCheckboxGroupDemo() {
  return (
    <ProCheckboxGroup
      aria-label="权限"
      defaultValue={["read"]}
      orientation="horizontal"
      options={[
        { value: "read", label: "读取" },
        { value: "write", label: "写入" },
      ]}
    />
  );
}
export function CollapsibleDemo() {
  return (
    <Collapsible>
      <CollapsibleTrigger>查看技术详情</CollapsibleTrigger>
      <CollapsibleContent>所有内容使用原生 details/summary 语义。</CollapsibleContent>
    </Collapsible>
  );
}
export function DescriptionListDemo() {
  return (
    <DescriptionList columns={2} layout="responsive" size="md" aria-label="项目详情">
      <DescriptionItem>
        <DescriptionTerm>状态</DescriptionTerm>
        <DescriptionDetail>运行中</DescriptionDetail>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>区域</DescriptionTerm>
        <DescriptionDetail>华东</DescriptionDetail>
      </DescriptionItem>
    </DescriptionList>
  );
}
export function SkeletonDemo() {
  return (
    <Stack gap={3} aria-label="加载占位示例">
      <Skeleton shape="text" style={{ width: "65%" }} />
      <Skeleton shape="rectangular" style={{ height: 72 }} />
      <Skeleton shape="circular" animation="pulse" style={{ width: 40 }} />
    </Stack>
  );
}
export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button>账户</Button>} />
      <DropdownMenuPortal>
        <DropdownMenuPositioner>
          <DropdownMenuContent>
            <DropdownMenuItem>个人资料</DropdownMenuItem>
            <DropdownMenuItem>退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
export function RadioGroupDemo() {
  return (
    <Stack gap={4}>
      <RadioGroup defaultValue="standard" aria-label="显示密度">
        <label>
          <RadioGroupItem value="standard">
            <RadioGroupIndicator />
          </RadioGroupItem>{" "}
          舒适
        </label>
        <label>
          <RadioGroupItem value="compact">
            <RadioGroupIndicator />
          </RadioGroupItem>{" "}
          紧凑
        </label>
      </RadioGroup>
      <RadioGroup defaultValue="list" aria-label="视图" orientation="horizontal" buttonStyle="solid">
        <RadioButton value="list">列表</RadioButton>
        <RadioButton value="grid">网格</RadioButton>
      </RadioGroup>
    </Stack>
  );
}
export function ProRadioGroupDemo() {
  return (
    <ProRadioGroup
      aria-label="排序"
      defaultValue="recent"
      optionType="button"
      orientation="horizontal"
      options={[
        { value: "recent", label: "最近" },
        { value: "popular", label: "热门" },
      ]}
    />
  );
}
export function PaginationDemo() {
  return (
    <Pagination aria-label="文章分页">
      <PaginationContent>
        <PaginationItem>
          <PaginationPreviousLink href="?page=1" />
        </PaginationItem>
        <PaginationItem collapsible>
          <PaginationLink href="?page=1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem collapsible>
          <PaginationLink href="?page=2" current>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNextLink href="?page=3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
export function ProPaginationDemo() {
  // The page size stays with the bar: a controlled `pageSize` would freeze the
  // size changer, because the owner has to move the value for it to change.
  return <ProPagination defaultPage={4} defaultPageSize={10} total={128} showPageSize showQuickJumper showTotal />;
}
export function SwitchDemo() {
  return (
    <label>
      <Switch>
        <SwitchThumb />
      </Switch>{" "}
      启用深色模式
    </label>
  );
}
export function ToggleButtonDemo() {
  const [pressed, setPressed] = useState(true);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <ToggleButton pressed={pressed} onPressedChange={setPressed}>
        已选中
      </ToggleButton>
      <ToggleButton pressed={false} onPressedChange={setPressed}>
        未选中
      </ToggleButton>
      <ToggleButton pressed disabled>
        不可用
      </ToggleButton>
    </div>
  );
}
export function ToggleGroupDemo() {
  return (
    <ToggleGroup aria-label="视图" defaultValue={["list"]}>
      <ToggleButton value="list">列表</ToggleButton>
      <ToggleButton value="grid">网格</ToggleButton>
    </ToggleGroup>
  );
}
export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger aria-label="城市" style={{ width: "8rem" }}>
        <SelectValue placeholder="选择城市" />
        <SelectIcon />
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner>
          <SelectContent>
            <SelectList>
              {[
                ["上海", "shanghai"],
                ["杭州", "hangzhou"],
                ["中国东部的一个很长的城市选项", "long-city"],
              ].map(([label, value]) => (
                <SelectItem key={value} value={value}>
                  <SelectItemIndicator />
                  <SelectItemText>{label}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </SelectPositioner>
      </SelectPortal>
    </Select>
  );
}
export function InputGroupDemo() {
  return (
    <InputGroup>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-label="站点地址" placeholder="example.com" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>打开</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
export function ComboboxDemo() {
  const cities = ["上海", "杭州", "成都"];
  return (
    <Combobox items={cities}>
      <ComboboxInput aria-label="搜索城市" placeholder="输入城市" />
      <ComboboxPortal>
        <ComboboxPositioner>
          <ComboboxContent width="clamp(12rem, 36vw, 22rem)">
            <ComboboxList>
              {cities.map((city) => (
                <ComboboxItem key={city} value={city}>
                  {city}
                </ComboboxItem>
              ))}
              <ComboboxEmpty>没有匹配城市</ComboboxEmpty>
            </ComboboxList>
          </ComboboxContent>
        </ComboboxPositioner>
      </ComboboxPortal>
    </Combobox>
  );
}
