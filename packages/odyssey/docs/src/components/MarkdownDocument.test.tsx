import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MarkdownDocument } from "./MarkdownDocument";

describe("MarkdownDocument", () => {
  it("adds stable heading ids through the markdown render pipeline", () => {
    render(
      <MarkdownDocument
        basePath="/ops-docs"
        content={"## 章节标题\n\n正文"}
        currentDocId="byproduct/intro"
        currentDocPath="byproduct/intro.md"
        docAssets={{}}
        docPaths={{}}
        docRoutes={{}}
        onNavigate={() => {}}
        onRendered={() => {}}
      />,
    );

    expect(screen.getByRole("heading", { name: "章节标题" })).toHaveAttribute("id", "章节标题");
  });

  it("rewrites Docusaurus-style relative doc links to app doc URLs", async () => {
    const user = userEvent.setup();
    const navigated: string[] = [];

    render(
      <MarkdownDocument
        basePath="/ops-docs"
        content={"[用户指南](./user-guide/overview)"}
        currentDocId="byproduct/intro"
        currentDocPath="byproduct/intro.md"
        docAssets={{}}
        docPaths={{ "byproduct/01-user-guide/overview": "byproduct/user-guide/overview" }}
        docRoutes={{ "byproduct/user-guide/overview": "byproduct/01-user-guide/overview" }}
        onNavigate={(docId) => navigated.push(docId)}
        onRendered={() => {}}
      />,
    );

    const link = screen.getByRole("link", { name: "用户指南" });
    expect(link).toHaveAttribute("href", "/ops-docs/byproduct/user-guide/overview");

    await user.click(link);

    expect(navigated).toEqual(["byproduct/01-user-guide/overview"]);
  });

  it("renders raw HTML tables like Docusaurus markdown pages", () => {
    render(
      <MarkdownDocument
        basePath="/ops-docs"
        content={'<table><tbody><tr><td rowspan="2">DCM</td><td>入罐</td></tr></tbody></table>'}
        currentDocId="byproduct/03-business-rules/byproduct-categories"
        currentDocPath="byproduct/03-business-rules/byproduct-categories.md"
        docAssets={{}}
        docPaths={{}}
        docRoutes={{}}
        onNavigate={() => {}}
        onRendered={() => {}}
      />,
    );

    expect(screen.getByRole("cell", { name: "DCM" })).toHaveAttribute("rowspan", "2");
    expect(screen.getByRole("cell", { name: "入罐" })).toBeInTheDocument();
  });

  it("resolves relative image paths from the current document path", () => {
    render(
      <MarkdownDocument
        basePath="/ebr-user-guide-web"
        content={"![登录入口](./images/s009_img01.png)"}
        currentDocId="ebr-cleaning-engineer/02-account-login"
        currentDocPath="ebr-cleaning-engineer/02-account-login.md"
        docAssets={{ "ebr-cleaning-engineer/images/s009_img01.png": "/assets/s009_img01.hash.png" }}
        docPaths={{}}
        docRoutes={{}}
        onNavigate={() => {}}
        onRendered={() => {}}
      />,
    );

    expect(screen.getByRole("img", { name: "登录入口" })).toHaveAttribute("src", "/assets/s009_img01.hash.png");
  });
});
