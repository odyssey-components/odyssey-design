import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OdysseyProvider } from "../OdysseyProvider";
import { odysseyThemes } from "../theme";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuPositioner, DropdownMenuTrigger } from "./DropdownMenu";

const stylesheet = readFileSync("src/styles.css", "utf8");

function highlightedRule() {
  const start = stylesheet.indexOf(".od-DropdownMenu-item[data-highlighted]");
  if (start < 0) throw new Error("Missing static highlighted menu rule");
  const open = stylesheet.indexOf("{", start);
  const close = stylesheet.indexOf("}", open);
  return stylesheet.slice(open + 1, close);
}

/**
 * The official menu focus recipe, read off the stylesheet.
 *
 * The official shadcn menu recipes read a focused entry by its fill:
 * `focus:bg-accent focus:text-accent-foreground`, and they declare no ring
 * around it. The three facts the contract publishes about that treatment are
 * asserted here against the rule the stylesheet really paints.
 */

/** Opens the menu and returns the entry the keyboard landed on. */
async function highlightedItem() {
  const user = userEvent.setup();
  render(
    <OdysseyProvider theme={odysseyThemes.shadcn} colorScheme="light">
      <DropdownMenu>
        <DropdownMenuTrigger>主题</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuPositioner>
            <DropdownMenuContent>
              <DropdownMenuItem>个人资料</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPositioner>
        </DropdownMenuPortal>
      </DropdownMenu>
    </OdysseyProvider>,
  );
  const trigger = screen.getByRole("button", { name: "主题" });
  trigger.focus();
  await user.keyboard("{Enter}");
  const item = screen.getByRole("menuitem", { name: "个人资料" });
  expect(item).toHaveAttribute("data-highlighted");
  return item;
}

describe("the official menu focus recipe", () => {
  it("fills a focused entry with the accent surface and writes it in the accent ink", async () => {
    expect(await highlightedItem()).toHaveAttribute("data-highlighted");
    expect(highlightedRule()).toContain("background: var(--od-accent)");
    expect(highlightedRule()).toContain("color: var(--od-accent-foreground)");
  });

  it("draws no outline around a focused entry", async () => {
    expect(await highlightedItem()).toHaveAttribute("data-highlighted");
    expect(highlightedRule()).not.toMatch(/\b(outline|border)[-a-z]*\s*:/);
  });
});
