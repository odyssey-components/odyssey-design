import { MDXProvider } from "@mdx-js/react";
import { lazy, Suspense, useLayoutEffect, useMemo } from "react";
import type { DocRecord } from "../docs/types";
import { DocLink } from "./DocLink";
import { DocSkeleton } from "./DocSkeleton";
import { resolveDocAsset } from "./MarkdownDocument";
import Mermaid from "./Mermaid";

interface MdxDocumentProps {
  basePath: string;
  doc: DocRecord;
  docAssets: Record<string, string>;
  docPaths: Record<string, string>;
  docRoutes: Record<string, string>;
  onNavigate: (docId: string, hash?: string) => void;
  onRendered: (docId: string) => void;
}

function MdxReady({ docId, onRendered }: { docId: string; onRendered: (docId: string) => void }) {
  useLayoutEffect(() => {
    onRendered(docId);
  }, [docId, onRendered]);

  return null;
}

export function MdxDocument({ basePath, doc, docAssets, docPaths, docRoutes, onNavigate, onRendered }: MdxDocumentProps) {
  const Component = useMemo(() => {
    if (!doc.loader) return undefined;
    return lazy(doc.loader);
  }, [doc.loader]);
  const mdxComponents = {
    Mermaid,
    a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <DocLink basePath={basePath} currentDocId={doc.id} docPaths={docPaths} docRoutes={docRoutes} href={href} onNavigate={onNavigate} {...props}>
        {children}
      </DocLink>
    ),
    img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
      <img alt={alt ?? ""} src={resolveDocAsset(doc.path, src, docAssets)} loading="lazy" {...props} />
    ),
  };

  if (!Component) {
    return null;
  }

  return (
    <MDXProvider components={mdxComponents}>
      <Suspense fallback={<DocSkeleton />}>
        <Component />
        <MdxReady docId={doc.id} onRendered={onRendered} />
      </Suspense>
    </MDXProvider>
  );
}
