import { Button } from "@odyssey/ui/primitives/button";
import { ControlGroup } from "@odyssey/ui/primitives/control-group";
import { Input } from "@odyssey/ui/primitives/input";
import { Stack, type StackProps } from "@odyssey/ui/primitives/stack";
import { useState } from "react";

export function StackWrapDemo({ gap, wrap }: Pick<StackProps, "gap" | "wrap">) {
  return (
    <Stack data-layout-wrap-demo direction="row" gap={gap} align="center" wrap={wrap} style={{ maxInlineSize: 224 }}>
      <Button>刷新列表</Button>
      <Button>导出选中项</Button>
      <Button>查看历史记录</Button>
    </Stack>
  );
}

export function ControlGroupDemo() {
  const [value, setValue] = useState("Odyssey");
  return (
    <ControlGroup aria-label="搜索记录">
      <Input aria-label="关键词" value={value} onChange={(event) => setValue(event.target.value)} />
      <Button disabled={!value} onClick={() => setValue("")}>
        清除
      </Button>
    </ControlGroup>
  );
}
