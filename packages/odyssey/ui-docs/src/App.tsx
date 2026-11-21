import { defaultDocId, docAssets, docPaths, docRoutes, docs, homeDocId, navbar, navTree, siteConfig } from "odyssey:docs";
import { MDXProvider } from "@mdx-js/react";
import { type DocsCatalog, type NavNode, useDocsRuntime } from "@odyssey/docs/headless";
import { Button } from "@odyssey/ui/button";
import { odysseyLocales } from "@odyssey/ui/locale";
import { OdysseyProvider } from "@odyssey/ui/provider";
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
import { Stack } from "@odyssey/ui/stack";
import { Switch, SwitchThumb } from "@odyssey/ui/switch";
import { createOdysseyTheme, odysseyThemes } from "@odyssey/ui/theme";
import { Toaster } from "@odyssey/ui/toast";
import type { OdysseyColorScheme, OdysseyDensity } from "@odyssey/ui/types";
import { lazy, Suspense, useMemo, useState } from "react";
import { odysseyCatalog } from "./catalog";
import { ApiTable } from "./components/ApiTable";
import { ComponentDemo } from "./components/ComponentDemo";
import { TokenTable } from "./components/TokenTable";
import type { DocsPrimaryValue, DocsRadiusValue, DocsThemeValue } from "./customizer-search";
import { docsPrimaryOptions, docsRadiusOptions } from "./theme-options";
import { useCustomizerSearch } from "./use-customizer-search";

const docsCatalog: DocsCatalog = { defaultDocId, docAssets, docPaths, docRoutes, docs, homeDocId, navbar, navTree, siteConfig };
const docsThemes = odysseyThemes;

function flattenNodes(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => (node.type === "doc" ? [node] : flattenNodes(node.children ?? [])));
}

function DocsSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
}) {
  return (
    <Select value={value} onValueChange={(next) => next && onChange(next as string)}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
        <SelectIcon />
      </SelectTrigger>
      <SelectPortal>
        <SelectPositioner>
          <SelectContent>
            <SelectList>
              {options.map(([optionLabel, optionValue]) => (
                <SelectItem key={optionValue} value={optionValue}>
                  <SelectItemIndicator />
                  <SelectItemText>{optionLabel}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </SelectPositioner>
      </SelectPortal>
    </Select>
  );
}

export function App() {
  const [language, setLanguage] = useState<"zh-CN" | "en-US">("zh-CN");
  const runtime = useDocsRuntime(docsCatalog);
  const [search, updateCustomizer] = useCustomizerSearch();
  const dark = search.dark === true;
  const themeId = search.theme ?? "shadcn";
  const radius: keyof typeof docsRadiusOptions = search.radius ?? "default";
  const primary: keyof typeof docsPrimaryOptions = search.primary ?? "default";
  const selectDoc = (docId: string) => {
    const customizerSearch = window.location.search;
    runtime.selectDoc(docId);
    if (customizerSearch) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${customizerSearch}${window.location.hash}`);
    }
  };
  const colorScheme: OdysseyColorScheme = dark ? "dark" : "light";
  const density: OdysseyDensity = search.density ?? (search.compact ? "compact" : "standard");
  const Document = useMemo(() => (runtime.activeDoc?.loader ? lazy(runtime.activeDoc.loader) : null), [runtime.activeDoc]);
  const theme = useMemo(() => {
    const primaryValue = docsPrimaryOptions[primary];
    const radiusValue = docsRadiusOptions[radius];
    return createOdysseyTheme(
      `docs-${themeId}`,
      {
        seed: {
          ...(primaryValue ? { colors: { primary: primaryValue } } : {}),
          ...(radiusValue !== undefined ? { geometry: { radius: radiusValue } } : {}),
        },
      },
      docsThemes[themeId],
    );
  }, [primary, radius, themeId]);
  const componentMeta = odysseyCatalog.find((item) => item.docId === runtime.activeDoc?.id);

  return (
    <OdysseyProvider
      className="docs-root"
      colorScheme={colorScheme}
      data-docs-primary={primary}
      data-docs-radius={radius}
      density={density}
      locale={language === "en-US" ? odysseyLocales.enUS : odysseyLocales.zhCN}
      theme={theme}
    >
      <Toaster>
        <header className="docs-header">
          <Button variant="ghost" className="brand" onClick={() => selectDoc(homeDocId ?? defaultDocId ?? "")}>
            Odyssey UI <span>v0.11</span>
          </Button>
          <nav className="docs-navbar" aria-label="主导航">
            {navbar.map((item) => (
              <Button
                key={item.docId}
                size="sm"
                variant={runtime.activeNavbarItem?.docId === item.docId ? "solid" : "ghost"}
                onClick={() => selectDoc(item.docId)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
          <Stack className="docs-customizer" direction="row" gap={2} align="center">
            <DocsSelect
              label="Language"
              value={language}
              onChange={(value) => setLanguage(value as "zh-CN" | "en-US")}
              options={[
                ["中文", "zh-CN"],
                ["English", "en-US"],
              ]}
            />
            <DocsSelect
              label="Theme"
              value={themeId}
              onChange={(value) => updateCustomizer({ theme: value as DocsThemeValue })}
              options={[
                ["shadcn", "shadcn"],
                ["Ant Design", "ant-design"],
                ["Fluent UI", "fluent"],
                ["Material Design", "material-design"],
              ]}
            />
            <DocsSelect
              label="Radius"
              value={radius}
              onChange={(value) => updateCustomizer({ radius: value === "default" ? undefined : (value as Exclude<DocsRadiusValue, "default">) })}
              options={[
                ["默认", "default"],
                ["0", "none"],
                ["4px", "small"],
                ["8px", "medium"],
                ["12px", "large"],
                ["16px", "full"],
              ]}
            />
            <DocsSelect
              label="Primary color"
              value={primary}
              onChange={(value) => updateCustomizer({ primary: value === "default" ? undefined : (value as Exclude<DocsPrimaryValue, "default">) })}
              options={[
                ["跟随主题", "default"],
                ["Blue", "blue"],
                ["Indigo", "indigo"],
                ["Emerald", "emerald"],
                ["Orange", "orange"],
                ["Rose", "rose"],
              ]}
            />
            <DocsSelect
              label="Density"
              value={density}
              onChange={(value) => updateCustomizer({ density: value as OdysseyDensity, compact: undefined })}
              options={[
                ["紧凑", "compact"],
                ["标准", "standard"],
                ["宽松", "spacious"],
              ]}
            />
            <span className="docs-toggle">
              <Switch aria-label="Dark" checked={dark} onCheckedChange={(checked) => updateCustomizer({ dark: checked ? true : undefined })}>
                <SwitchThumb />
              </Switch>
              <span>Dark</span>
            </span>
          </Stack>
        </header>
        <div className="docs-layout">
          <aside className="docs-sidebar" aria-label="文档导航">
            {flattenNodes(runtime.sidebarTree).map((node) => (
              <button
                type="button"
                className={node.docId === runtime.activeDocId ? "active" : ""}
                key={node.key}
                onClick={() => selectDoc(node.docId ?? node.key)}
              >
                {node.label}
              </button>
            ))}
          </aside>
          <main className="docs-main">
            <article className="docs-article">
              {componentMeta && (
                <div className="component-meta">
                  <span>{componentMeta.status}</span>
                  {componentMeta.platforms.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                  {componentMeta.accessibility.length > 0 && <span>a11y ready</span>}
                </div>
              )}
              {Document ? (
                <MDXProvider components={{ ApiTable, ComponentDemo, TokenTable }}>
                  <Suspense fallback={<p>正在加载文档…</p>}>
                    <Document />
                  </Suspense>
                </MDXProvider>
              ) : (
                <pre>{runtime.activeDoc?.content}</pre>
              )}
              <nav className="docs-pagination" aria-label="文档分页">
                {runtime.pagination.previous && (
                  <Button onClick={() => selectDoc(runtime.pagination.previous?.docId ?? "")}>← {runtime.pagination.previous.label}</Button>
                )}
                {runtime.pagination.next && <Button onClick={() => selectDoc(runtime.pagination.next?.docId ?? "")}>{runtime.pagination.next.label} →</Button>}
              </nav>
            </article>
          </main>
          <aside className="docs-outline" aria-label="本页目录">
            {runtime.activeDoc?.outline.map((item) => (
              <a key={item.id} href={`#${item.id}`} style={{ paddingLeft: `${Math.max(0, item.depth - 2)}rem` }}>
                {item.text}
              </a>
            ))}
          </aside>
        </div>
      </Toaster>
    </OdysseyProvider>
  );
}
