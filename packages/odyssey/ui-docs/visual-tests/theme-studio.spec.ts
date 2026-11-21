import { expect, type Page, test } from "@playwright/test";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

test("default theme studio", async ({ page }) => {
  await page.goto("/");
  await settle(page);
  await expect(page.locator("[data-od-root]")).toHaveAttribute("data-od-theme", "docs-default");
  await expect(page.locator(".docs-header")).toHaveScreenshot("default-light.png");
});

test("default compact density", async ({ page }) => {
  await page.goto("/?compact=true");
  const root = page.locator(".docs-root");
  await expect(root).toHaveAttribute("data-od-density", "compact");
  await expect
    .poll(() =>
      root.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          fontSize: style.getPropertyValue("--od-font-size-md").trim(),
          itemHeight: style.getPropertyValue("--od-item-height").trim(),
          selectionControlSize: style.getPropertyValue("--od-selection-control-size").trim(),
          space2: style.getPropertyValue("--od-space-2").trim(),
          space8: style.getPropertyValue("--od-space-8").trim(),
          switchHeight: style.getPropertyValue("--od-switch-height").trim(),
          switchWidth: style.getPropertyValue("--od-switch-width").trim(),
        };
      }),
    )
    .toEqual({ fontSize: "0.875rem", itemHeight: "28px", selectionControlSize: "18px", space2: "4px", space8: "24px", switchHeight: "22px", switchWidth: "40px" });
  const densitySwitch = page.getByRole("switch", { name: "Compact" });
  const switchBox = await densitySwitch.boundingBox();
  expect(switchBox?.width).toBeCloseTo(40, 1);
  expect(switchBox?.height).toBeCloseTo(22, 1);
  await expect.poll(() => root.evaluate((element) => getComputedStyle(element).getPropertyValue("--od-interactive-target-min").trim())).toBe("44px");
  await settle(page);
  await expect(page.locator(".docs-header")).toHaveScreenshot("default-compact.png");
});

test("Odyssey UI Pro gallery inherits theme and density", async ({ page }) => {
  await page.goto("/5-pro/?compact=true&dark=true");
  const gallery = page.locator('[data-demo-id="proGallery"]');
  await expect(gallery).toBeVisible();
  await expect(page.locator('[data-od-slot="pro-table"]')).toBeVisible();
  await expect(page.locator('[data-od-slot="pro-form-field"]')).toBeVisible();
  await settle(page);
  await expect(gallery).toHaveScreenshot("pro-gallery-dark-compact.png");
});

test("shadcn dark compact state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: "shadcn" }).click();
  await page.getByRole("switch", { name: "Compact" }).click();
  await page.getByRole("switch", { name: "Dark" }).click();
  await expect(page.locator("[data-od-root]")).toHaveAttribute("data-od-theme", "docs-shadcn");
  await expect(page.locator("[data-od-root]")).toHaveAttribute("data-od-resolved-color-scheme", "dark");
  await settle(page);
  await expect(page.locator(".docs-header")).toHaveScreenshot("shadcn-dark-compact.png");
});

test("ant design preset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: "Ant Design" }).click();
  await expect(page.locator("[data-od-root]")).toHaveAttribute("data-od-theme", "docs-ant-design");
  await settle(page);
  await expect(page.locator(".docs-header")).toHaveScreenshot("ant-design-light.png");
});

test("fluent preset exposes Fluent 2 tokens in both densities", async ({ page }) => {
  await page.goto("/?theme=fluent");
  const root = page.locator(".docs-root");
  await expect(root).toHaveAttribute("data-od-theme", "docs-fluent");
  await expect
    .poll(() =>
      root.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          buttonPadding: style.getPropertyValue("--od-button-padding-inline-md").trim(),
          controlHeight: style.getPropertyValue("--od-control-height-md").trim(),
          focus: style.getPropertyValue("--od-focus-indicator").trim(),
          primary: style.getPropertyValue("--od-primary").trim(),
          tableRow: style.getPropertyValue("--od-table-row-height").trim(),
        };
      }),
    )
    .toEqual({ buttonPadding: "12px", controlHeight: "32px", focus: "#000000", primary: "#0f6cbd", tableRow: "44px" });
  await settle(page);
  await expect(page.locator(".docs-header")).toHaveScreenshot("fluent-light.png");

  await page.goto("/2-foundations/theming/?theme=fluent");
  await expect(page.locator('[data-demo-id="fluentPresetMatrix"]')).toBeVisible();
  await settle(page);
  await expect(page.locator('[data-demo-id="fluentPresetMatrix"]')).toHaveScreenshot("fluent-component-matrix-light.png");

  await page.getByRole("switch", { name: "Compact" }).click();
  await page.getByRole("switch", { name: "Dark" }).click();
  await expect(root).toHaveAttribute("data-od-density", "compact");
  await expect(root).toHaveAttribute("data-od-resolved-color-scheme", "dark");
  await expect
    .poll(() =>
      root.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          controlHeight: style.getPropertyValue("--od-control-height-md").trim(),
          focus: style.getPropertyValue("--od-focus-indicator").trim(),
          primary: style.getPropertyValue("--od-primary").trim(),
          switchSize: `${style.getPropertyValue("--od-switch-width").trim()}×${style.getPropertyValue("--od-switch-height").trim()}`,
          tableRow: style.getPropertyValue("--od-table-row-height").trim(),
        };
      }),
    )
    .toEqual({ controlHeight: "28px", focus: "#ffffff", primary: "#115ea3", switchSize: "36px×18px", tableRow: "36px" });
  await settle(page);
  await expect(page.locator(".docs-header")).toHaveScreenshot("fluent-dark-compact.png");
  await expect(page.locator('[data-demo-id="fluentPresetMatrix"]')).toHaveScreenshot("fluent-component-matrix-dark-compact.png");
});

test("customizer state round-trips through the URL", async ({ page }) => {
  await page.goto("/?theme=ant-design&radius=large&primary=rose&compact=true&dark=true");
  const root = page.locator("[data-od-root]");
  await expect(root).toHaveAttribute("data-od-theme", "docs-ant-design");
  await expect(root).toHaveAttribute("data-docs-radius", "large");
  await expect(root).toHaveAttribute("data-docs-primary", "rose");
  await expect(root).toHaveAttribute("data-od-density", "compact");
  await expect(root).toHaveAttribute("data-od-resolved-color-scheme", "dark");

  await page.getByRole("switch", { name: "Dark" }).click();
  await expect(page).not.toHaveURL(/dark=/);
  await page.reload();
  await expect(page.getByRole("switch", { name: "Dark" })).not.toBeChecked();
  await expect(root).toHaveAttribute("data-od-theme", "docs-ant-design");
});

test("ant design recipe waves selection controls", async ({ isMobile, page }) => {
  test.skip(isMobile, "The mobile docs navigation is intentionally collapsed.");
  await page.goto("/?theme=ant-design");
  await page.getByRole("button", { name: "组件", exact: true }).click();
  await page.getByRole("button", { name: "Checkbox", exact: true }).click();
  const checkbox = page.getByRole("checkbox", { name: "接收产品更新" });
  await checkbox.click();
  await expect(checkbox.locator('[data-od-slot="checkbox-feedback-effect"]')).toHaveCount(1);

  await page.getByRole("button", { name: "Switch", exact: true }).click();
  const switchControl = page.getByRole("switch", { name: "启用深色模式" });
  await switchControl.click();
  await expect(switchControl.locator('[data-od-slot="switch-feedback-effect"]')).toHaveCount(1);
});

test("preset recipes drive button feedback while input keeps focus feedback", async ({ isMobile, page }) => {
  test.skip(isMobile, "The mobile docs navigation is intentionally collapsed.");
  await page.goto("/");
  await page.getByRole("button", { name: "组件", exact: true }).click();
  await page.getByRole("button", { name: "Button", exact: true }).click();
  const solidButton = page.getByRole("button", { name: "开始探索" });

  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: "Ant Design" }).click();
  await expect
    .poll(() => solidButton.evaluate((element) => getComputedStyle(element).getPropertyValue("--_od-feedback-outline-wave-enabled").trim()))
    .toBe("1");
  await solidButton.click();
  const outlineWave = solidButton.locator('[data-od-slot="button-outline-feedback"] [data-od-slot="button-feedback-effect"]');
  await expect(outlineWave).toHaveCount(1);
  await page.waitForTimeout(100);
  const outlineWaveFrame = await outlineWave.evaluate((element) => {
    const style = getComputedStyle(element);
    return { boxShadow: style.boxShadow, opacity: Number(style.opacity) };
  });
  expect(outlineWaveFrame.boxShadow).not.toBe("none");
  expect(outlineWaveFrame.opacity).toBeGreaterThan(0);

  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: "Material UI" }).click();
  await expect
    .poll(() => solidButton.evaluate((element) => getComputedStyle(element).getPropertyValue("--_od-feedback-radial-ripple-enabled").trim()))
    .toBe("1");
  await solidButton.dispatchEvent("pointerdown", { clientX: 12, clientY: 12, pointerId: 1, pointerType: "mouse" });
  await expect(solidButton.locator('[data-od-slot="button-radial-feedback"] [data-od-slot="button-feedback-effect"]')).toHaveCount(1);
  await solidButton.dispatchEvent("pointerup", { pointerId: 1, pointerType: "mouse" });

  await page.getByRole("button", { name: "Input 与 Textarea", exact: true }).click();
  const input = page.getByPlaceholder("输入昵称");
  await input.focus();
  await expect.poll(() => input.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  await expect(input.locator('[data-od-slot="button-feedback-effect"]')).toHaveCount(0);
  await input.evaluate((element) => element.blur());
  await expect.poll(() => input.evaluate((element) => getComputedStyle(element).boxShadow)).toBe("none");
});

test("interactive state changes preserve geometry and foreground", async ({ isMobile, page }) => {
  test.skip(isMobile, "The mobile docs navigation is intentionally collapsed.");
  await page.goto("/");
  await page.getByRole("button", { name: "组件", exact: true }).click();
  await page.getByRole("button", { name: "Button", exact: true }).click();
  const solidButton = page.getByRole("button", { name: "开始探索" });
  const foregroundBefore = await solidButton.evaluate((element) => getComputedStyle(element).color);
  await solidButton.hover();
  await page.waitForTimeout(200);
  const foregroundAfter = await solidButton.evaluate((element) => getComputedStyle(element).color);
  expect(foregroundAfter).toBe(foregroundBefore);

  await page.getByRole("button", { name: "Checkbox", exact: true }).click();
  const checkbox = page.getByRole("checkbox", { name: "接收产品更新" });
  const checkboxBefore = await checkbox.boundingBox();
  await checkbox.click();
  const checkboxAfter = await checkbox.boundingBox();
  expect(checkboxAfter).toEqual(checkboxBefore);

  await page.getByRole("button", { name: "RadioGroup", exact: true }).click();
  const radio = page.getByRole("radio", { name: "紧凑" });
  const radioBefore = await radio.boundingBox();
  await radio.click();
  const radioAfter = await radio.boundingBox();
  expect(radioAfter).toEqual(radioBefore);

  await page.getByRole("button", { name: "Switch", exact: true }).click();
  const switchControl = page.getByRole("switch", { name: "启用深色模式" });
  const switchThumb = switchControl.locator('[data-od-slot="switch-thumb"]');
  const switchBox = await switchControl.boundingBox();
  const thumbBefore = await switchThumb.boundingBox();
  await switchControl.click();
  await page.waitForTimeout(200);
  const thumbAfter = await switchThumb.boundingBox();
  if (!switchBox || !thumbBefore || !thumbAfter) throw new Error("Switch geometry is unavailable");
  expect(thumbAfter.y).toBeCloseTo(thumbBefore.y, 1);
  expect(thumbAfter.x - thumbBefore.x).toBeCloseTo(20, 1);
  expect(thumbBefore.x - switchBox.x).toBeCloseTo(switchBox.x + switchBox.width - (thumbAfter.x + thumbAfter.width), 1);

  await page.getByRole("button", { name: "Tabs", exact: true }).click();
  const firstTab = page.getByRole("tab", { name: "概览" });
  const secondTab = page.getByRole("tab", { name: "动态" });
  const tabsIndicator = page.locator('[data-od-slot="tabs-indicator"]');
  const firstTabBox = await firstTab.boundingBox();
  const firstIndicatorBox = await tabsIndicator.boundingBox();
  if (!firstTabBox || !firstIndicatorBox) throw new Error("Initial Tabs geometry is unavailable");
  expect(firstIndicatorBox.x).toBeCloseTo(firstTabBox.x, 1);
  expect(firstIndicatorBox.width).toBeCloseTo(firstTabBox.width, 1);
  expect(firstIndicatorBox.y).toBeGreaterThan(firstTabBox.y);

  await secondTab.click();
  await page.waitForTimeout(250);
  const secondTabBox = await secondTab.boundingBox();
  const secondIndicatorBox = await tabsIndicator.boundingBox();
  if (!secondTabBox || !secondIndicatorBox) throw new Error("Updated Tabs geometry is unavailable");
  expect(secondIndicatorBox.x).toBeCloseTo(secondTabBox.x, 1);
  expect(secondIndicatorBox.width).toBeCloseTo(secondTabBox.width, 1);
  await expect(page.getByText("最近动态内容")).toBeVisible();
});
