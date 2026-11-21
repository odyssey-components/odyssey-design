import { expect, test } from "@playwright/test";

test("Stack wraps with the current density and ControlGroup preserves focus", async ({ page }) => {
  await page.goto("/3-components/layout/?density=spacious");
  const stack = page.locator("[data-layout-wrap-demo]");
  await expect(stack).toBeVisible();
  const rows = await stack.evaluate((element) => {
    const children = Array.from(element.querySelectorAll(":scope > button"));
    return new Set(children.map((child) => child.getBoundingClientRect().top)).size;
  });
  expect(rows).toBeGreaterThan(1);
  expect(await stack.evaluate((element) => getComputedStyle(element).gap)).toBe("20px");

  const group = page.getByRole("group", { name: "搜索记录" });
  const input = group.getByRole("textbox");
  const clear = group.getByRole("button", { name: "清除" });
  await expect(input).toBeVisible();
  for (const direction of ["ltr", "rtl"]) {
    await group.evaluate((element, value) => element.setAttribute("dir", value), direction);
    const field = await input.boundingBox();
    const button = await clear.boundingBox();
    expect(field).not.toBeNull();
    expect(button).not.toBeNull();
    expect(direction === "ltr" ? field!.x + field!.width : button!.x + button!.width)
      .toBeCloseTo(direction === "ltr" ? button!.x : field!.x, 0);
    expect(await clear.evaluate((element) => getComputedStyle(element).borderInlineStartWidth)).toBe("0px");
  }
  await input.focus();
  await page.keyboard.press("Tab");
  await expect(clear).toBeFocused();
  expect(await clear.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("");
  await expect(clear).toBeDisabled();
});
