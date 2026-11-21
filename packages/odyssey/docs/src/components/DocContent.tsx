import { Card, CardContent } from "@odyssey/ui/card";
import type { DocRecord } from "../docs/types";
import { useDocsLocale } from "../locale";
import "./DocContent.css";
import { MarkdownDocument } from "./MarkdownDocument";
import { MdxDocument } from "./MdxDocument";

interface DocContentProps {
  basePath: string;
  doc?: DocRecord;
  docAssets: Record<string, string>;
  docPaths: Record<string, string>;
  docRoutes: Record<string, string>;
  onNavigate: (docId: string, hash?: string) => void;
  onRendered: (docId: string) => void;
}

export function DocContent({ basePath, doc, docAssets, docPaths, docRoutes, onNavigate, onRendered }: DocContentProps) {
  const locale = useDocsLocale();
  if (!doc) {
    return (
      <main className="od-Docs-content">
        <Card className="od-Docs-loading">
          <CardContent>{locale.content.empty}</CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="od-Docs-content">
      {doc.extension === "mdx" ? (
        <MdxDocument
          basePath={basePath}
          doc={doc}
          docAssets={docAssets}
          docPaths={docPaths}
          docRoutes={docRoutes}
          onNavigate={onNavigate}
          onRendered={onRendered}
        />
      ) : (
        <MarkdownDocument
          content={doc.content}
          currentDocId={doc.id}
          currentDocPath={doc.path}
          docAssets={docAssets}
          docPaths={docPaths}
          docRoutes={docRoutes}
          basePath={basePath}
          onNavigate={onNavigate}
          onRendered={onRendered}
        />
      )}
    </main>
  );
}
