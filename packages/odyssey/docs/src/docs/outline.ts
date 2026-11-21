/// <reference path="../types/github-slugger.d.ts" />

import GithubSlugger from "github-slugger";
import matter from "gray-matter";
import { toString as mdastToString } from "mdast-util-to-string";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import type { Frontmatter, OutlineItem } from "./types";

interface HeadingNode {
  depth: number;
  type: "heading";
}

export function readFrontmatter(source: string): { content: string; data: Frontmatter } {
  const parsed = matter(source);
  return {
    content: parsed.content,
    data: parsed.data as Frontmatter,
  };
}

export function extractOutline(markdown: string, extension: "md" | "mdx" = "md"): OutlineItem[] {
  const processor = unified().use(remarkParse);
  if (extension === "mdx") {
    processor.use(remarkMdx);
  }
  const tree = processor.parse(markdown);
  const slugger = new GithubSlugger();
  const outline: OutlineItem[] = [];

  visit(tree, "heading", (node) => {
    const heading = node as HeadingNode;
    if (heading.depth > 3) return;
    const text = mdastToString(node).trim();
    if (!text) return;
    outline.push({
      depth: heading.depth,
      id: slugger.slug(text),
      text,
    });
  });

  return outline;
}

export function titleFromMarkdown(markdown: string, fallback: string, extension: "md" | "mdx" = "md"): string {
  const firstHeading = extractOutline(markdown, extension).find((item) => item.depth === 1);
  return firstHeading?.text ?? fallback;
}
