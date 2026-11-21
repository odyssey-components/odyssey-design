// biome-ignore-all lint/a11y/noLabelWithoutControl: Base UI controls render hidden form inputs inside these visible labels.
import { Button } from "@odyssey/ui/button";
import { Card } from "@odyssey/ui/card";
import { Select, SelectContent, SelectItem, SelectItemText, SelectList, SelectPortal, SelectPositioner, SelectTrigger, SelectValue } from "@odyssey/ui/select";
import { Stack } from "@odyssey/ui/stack";
import { Switch, SwitchThumb } from "@odyssey/ui/switch";
import { useMemo, useState } from "react";
import { odysseyCatalogByDemoId } from "../catalog";
import { type DemoControl, demos } from "../demos/registry";
import styles from "./ComponentDemo.module.css";

type Viewport = "mobile" | "tablet" | "desktop";
type DemoView = "preview" | "code";
export function ComponentDemo({ id }: { id: string }) {
  const demo = demos[id];
  const metadata = odysseyCatalogByDemoId.get(id);
  const [props, setProps] = useState<Record<string, unknown>>(() => ({
    ...demo?.initialProps,
  }));
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [view, setView] = useState<DemoView>("preview");
  const source = useMemo(() => demo?.source(props) ?? "", [demo, props]);
  if (!demo) return <Card>未知示例：{id}</Card>;
  const Preview = demo.Component;
  const setProp = (name: string, value: unknown) => setProps((current) => ({ ...current, [name]: value }));
  return (
    <section className={styles.demo} data-demo-id={id}>
      <div className={styles.toolbar}>
        <Stack direction="row" gap={2} align="center">
          <strong>{metadata?.title ?? id}</strong>
          <Button size="sm" variant={view === "preview" ? "solid" : "ghost"} onClick={() => setView("preview")}>
            预览
          </Button>
          <Button size="sm" variant={view === "code" ? "solid" : "ghost"} onClick={() => setView("code")}>
            代码
          </Button>
        </Stack>
        <Stack direction="row" gap={2}>
          <Button size="sm" variant={viewport === "mobile" ? "solid" : "ghost"} onClick={() => setViewport("mobile")}>
            手机
          </Button>
          <Button size="sm" variant={viewport === "tablet" ? "solid" : "ghost"} onClick={() => setViewport("tablet")}>
            平板
          </Button>
          <Button size="sm" variant={viewport === "desktop" ? "solid" : "ghost"} onClick={() => setViewport("desktop")}>
            桌面
          </Button>
        </Stack>
        <Stack direction="row" gap={2}>
          <Button size="sm" onClick={() => setProps({ ...demo.initialProps })}>
            重置
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(source);
                setCopyFailed(false);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
              } catch {
                setCopyFailed(true);
              }
            }}
          >
            {copied ? "已复制" : copyFailed ? "复制失败" : "复制代码"}
          </Button>
        </Stack>
      </div>
      <div className={styles.stage} data-viewport={viewport} hidden={view !== "preview"}>
        <div className={styles.canvas}>
          <Preview {...props} />
        </div>
      </div>
      {view === "preview" && Object.keys(demo.controls).length > 0 && (
        <div className={styles.controls}>
          {Object.entries(demo.controls).map(([name, control]) => (
            <Control key={name} label={name} control={control} value={props[name]} onChange={(value) => setProp(name, value)} />
          ))}
        </div>
      )}
      <pre hidden={view !== "code"}>
        <code>{source}</code>
      </pre>
    </section>
  );
}

function Control({ control, label, onChange, value }: { control: DemoControl; label: string; onChange: (value: unknown) => void; value: unknown }) {
  if (control.type === "boolean")
    return (
      <label>
        <Switch checked={Boolean(value)} onCheckedChange={onChange}>
          <SwitchThumb />
        </Switch>{" "}
        {label}
      </label>
    );
  if (control.type === "select")
    return (
      <div>
        <span>{label}</span>
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger aria-label={label}>
            <SelectValue />
          </SelectTrigger>
          <SelectPortal>
            <SelectPositioner>
              <SelectContent>
                <SelectList>
                  {control.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      <SelectItemText>{option}</SelectItemText>
                    </SelectItem>
                  ))}
                </SelectList>
              </SelectContent>
            </SelectPositioner>
          </SelectPortal>
        </Select>
      </div>
    );
  return (
    <label>
      {label}
      <input value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
