import { useLayoutEffect } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { DocLink } from "./DocLink";

interface MarkdownDocumentProps {
  basePath: string;
  content: string;
  currentDocId: string;
  currentDocPath: string;
  docAssets: Record<string, string>;
  docPaths: Record<string, string>;
  docRoutes: Record<string, string>;
  onNavigate: (docId: string, hash?: string) => void;
  onRendered: (docId: string) => void;
}

export function MarkdownDocument({
  basePath,
  content,
  currentDocId,
  currentDocPath,
  docAssets,
  docPaths,
  docRoutes,
  onNavigate,
  onRendered,
}: MarkdownDocumentProps) {
  useLayoutEffect(() => {
    onRendered(currentDocId);
  }, [currentDocId, onRendered]);

  const components: Components = {
    a: ({ children, href, ...props }) => (
      <DocLink basePath={basePath} currentDocId={currentDocId} docPaths={docPaths} docRoutes={docRoutes} href={href} onNavigate={onNavigate} {...props}>
        {children}
      </DocLink>
    ),
    img: ({ alt, src, ...props }) => <img alt={alt ?? ""} src={resolveDocAsset(currentDocPath, src, docAssets)} loading="lazy" {...props} />,
  };

  return (
    <ReactMarkdown components={components} rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]} remarkPlugins={[remarkGfm, remarkMath]}>
      {content}
    </ReactMarkdown>
  );
}

export function resolveDocAsset(currentDocPath: string, src: string | undefined, docAssets: Record<string, string>): string | undefined {
  if (!src || /^(https?:|data:|blob:|\/)/.test(src)) {
    return src;
  }

  const currentDirectory = currentDocPath.split("/").slice(0, -1);
  const resolvedParts: string[] = [];
  for (const part of [...currentDirectory, ...src.split("/")]) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      resolvedParts.pop();
      continue;
    }

    resolvedParts.push(part);
  }

  return docAssets[resolvedParts.join("/")] ?? src;
}
