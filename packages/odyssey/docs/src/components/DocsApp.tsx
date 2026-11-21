import type { OdysseyI18nInstance } from "@odyssey/ui/i18n";
import { IconButton } from "@odyssey/ui/icon-button";
import type { OdysseyLocale } from "@odyssey/ui/locale";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { TooltipProvider } from "@odyssey/ui/tooltip";
import { ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { type DocsAppearanceConfig, DocsAppearanceProvider, useDocsAppearance } from "../appearance";
import { createDocHref, readDocLocation } from "../docs/links";
import { findNavbarItemForDoc, getDocBreadcrumbs, getDocPagination, getSidebarTreeForNavbarItem } from "../docs/navigation";
import type { DocsCatalog } from "../docs/types";
import { type DocsLocale, DocsLocaleContext, resolveDocsLocale } from "../locale";

export type { DocsCatalog } from "../docs/types";

import { useActiveHeading } from "../hooks/useActiveHeading";
import { DocContent } from "./DocContent";
import { DocHeader } from "./DocHeader";
import { DocPagination } from "./DocPagination";
import { DocProgressBar } from "./DocProgressBar";
import { DocsAppHeader } from "./DocsAppHeader";
import { DocsAppOutline } from "./DocsAppOutline";
import { DocsAppSidebar } from "./DocsAppSidebar";
import "./DocsApp.css";

export interface DocsAppProps {
  appearance?: DocsAppearanceConfig;
  brand?: string;
  catalog: DocsCatalog;
  defaultTitle?: string;
  headerActions?: ReactNode;
  i18n?: OdysseyI18nInstance;
  locale?: DocsLocale;
  onLogout?: () => Promise<unknown>;
  hideBreadcrumbs?: boolean;
  username?: string;
  uiLocale?: OdysseyLocale;
  watermarkContent?: string | string[];
}

function getBasePath(catalog: DocsCatalog): string {
  return catalog.siteConfig.basePath;
}

function getMainElement(): HTMLElement | undefined {
  return document.querySelector(".od-Docs-main") ?? undefined;
}

function scrollMainToTop() {
  getMainElement()?.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollMainToHash(hash: string): boolean {
  const decodedHash = decodeURIComponent(hash);
  const element = document.getElementById(decodedHash);
  const main = getMainElement();
  if (!element || !main) return false;
  const targetTop = element.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 24;
  main.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
  return true;
}

function deferScroll(scroll: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(scroll);
  });
}

function waitForContentImages(callback: () => void) {
  const images = Array.from(document.querySelectorAll<HTMLImageElement>(".od-Docs-content img")).filter((image) => !image.complete);
  if (images.length === 0) {
    return;
  }

  let pendingCount = images.length;
  const handleImageDone = () => {
    pendingCount -= 1;
    if (pendingCount === 0) {
      callback();
    }
  };

  for (const image of images) {
    image.addEventListener("load", handleImageDone, { once: true });
    image.addEventListener("error", handleImageDone, { once: true });
  }
}

type ScrollTarget =
  | {
      type: "hash";
      hash: string;
    }
  | {
      type: "top";
    };

interface PendingScroll {
  docId: string;
  target: ScrollTarget;
}

function scrollMainToTarget(target: ScrollTarget) {
  if (target.type === "hash") {
    scrollMainToHash(target.hash);
    return;
  }

  scrollMainToTop();
}

function DocsAppRuntime({
  brand,
  catalog,
  defaultTitle,
  headerActions,
  i18n,
  locale,
  onLogout,
  hideBreadcrumbs = false,
  uiLocale,
  username,
  watermarkContent,
  appearance,
}: DocsAppProps) {
  const appearanceState = useDocsAppearance();
  const resolvedLocale = locale ?? resolveDocsLocale(i18n?.resolvedLanguage ?? i18n?.language);
  const docsById = useMemo(() => new Map(catalog.docs.map((doc) => [doc.id, doc])), [catalog.docs]);
  const initialLocation = useMemo(
    () =>
      typeof window === "undefined"
        ? { docId: catalog.defaultDocId ?? "", hash: undefined }
        : readDocLocation(window.location.pathname, window.location.hash, catalog.docRoutes, catalog.defaultDocId ?? "", getBasePath(catalog)),
    [catalog],
  );
  const [activeDocId, setActiveDocId] = useState(() => initialLocation.docId);
  const contentDocId = useDeferredValue(activeDocId);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentRenderRevision, setContentRenderRevision] = useState(0);
  const pendingScrollRef = useRef<PendingScroll | undefined>(
    initialLocation.hash ? { docId: initialLocation.docId, target: { hash: initialLocation.hash, type: "hash" } } : undefined,
  );
  const scrollSequenceRef = useRef(0);
  const activeDoc = activeDocId ? docsById.get(activeDocId) : undefined;
  const contentDoc = contentDocId ? docsById.get(contentDocId) : undefined;
  const activeNavbarItem = useMemo(() => findNavbarItemForDoc(catalog.navbar, activeDoc?.id), [activeDoc?.id, catalog.navbar]);
  const sidebarTree = useMemo(() => getSidebarTreeForNavbarItem(catalog.navTree, activeNavbarItem), [activeNavbarItem, catalog.navTree]);
  const activeHeadingId = useActiveHeading(contentDoc?.outline ?? [], contentRenderRevision);
  const breadcrumbs = useMemo(() => getDocBreadcrumbs(catalog.navTree, activeDoc?.id), [activeDoc?.id, catalog.navTree]);
  const pagination = useMemo(() => getDocPagination(catalog.navTree, activeDoc?.id), [activeDoc?.id, catalog.navTree]);

  const pageTitle = useMemo(() => activeDoc?.title ?? defaultTitle ?? catalog.siteConfig.title, [activeDoc, defaultTitle, catalog.siteConfig.title]);
  const brandText = brand ?? catalog.siteConfig.title;

  const scheduleScroll = useCallback((target: ScrollTarget) => {
    const sequence = scrollSequenceRef.current + 1;
    scrollSequenceRef.current = sequence;
    const run = () => {
      if (scrollSequenceRef.current === sequence) {
        scrollMainToTarget(target);
      }
    };

    deferScroll(run);
    window.setTimeout(run, 80);
    window.setTimeout(run, 240);

    if (target.type === "hash") {
      window.setTimeout(run, 600);
      waitForContentImages(run);
    }
  }, []);

  const syncFromBrowserLocation = useCallback(() => {
    const location = readDocLocation(window.location.pathname, window.location.hash, catalog.docRoutes, catalog.defaultDocId ?? "", getBasePath(catalog));
    const target: ScrollTarget = location.hash ? { hash: location.hash, type: "hash" } : { type: "top" };

    if (location.docId !== activeDocId) {
      setContentLoading(true);
    }

    pendingScrollRef.current = { docId: location.docId, target };
    setActiveDocId(location.docId);

    if (location.docId === activeDocId) {
      pendingScrollRef.current = undefined;
      scheduleScroll(target);
    }
  }, [activeDocId, catalog, scheduleScroll]);

  useEffect(() => {
    window.addEventListener("popstate", syncFromBrowserLocation);
    return () => window.removeEventListener("popstate", syncFromBrowserLocation);
  }, [syncFromBrowserLocation]);

  const handleContentRendered = useCallback(
    (docId: string) => {
      setContentLoading(false);

      if (docId !== activeDoc?.id) {
        return;
      }

      // MDX content can arrive after the outline has already been committed.
      // Re-run heading observation only when this document's real content is
      // present; no timeout is used as a readiness proxy.
      setContentRenderRevision((revision) => revision + 1);

      const pendingScroll = pendingScrollRef.current;
      if (!pendingScroll || pendingScroll.docId !== docId) {
        return;
      }

      pendingScrollRef.current = undefined;
      scheduleScroll(pendingScroll.target);
    },
    [activeDoc?.id, scheduleScroll],
  );

  function selectDoc(docId: string, hash?: string) {
    if (!docsById.has(docId)) return;
    const isSameDoc = docId === activeDocId;
    const target: ScrollTarget = hash ? { hash, type: "hash" } : { type: "top" };

    if (!isSameDoc) {
      setContentLoading(true);
    }

    pendingScrollRef.current = { docId, target };
    setActiveDocId(docId);
    window.history.pushState(null, "", createDocHref({ docId, hash }, catalog.docPaths, getBasePath(catalog)));

    if (isSameDoc) {
      pendingScrollRef.current = undefined;
      scheduleScroll(target);
    }
  }

  function selectNavbarItem(key: string) {
    const item = catalog.navbar.find((navbarItem) => navbarItem.docId === key);
    if (!item) return;
    selectDoc(item.docId);
  }

  function selectHomeDoc() {
    if (!catalog.homeDocId) return;
    selectDoc(catalog.homeDocId);
  }

  const layout = (
    <div className="od-Docs-root" data-od-slot="docs-root">
      <DocProgressBar active={contentLoading} />
      <DocsAppHeader
        brandText={brandText}
        subtitle={catalog.siteConfig.subtitle}
        homeDocId={catalog.homeDocId}
        navbar={catalog.navbar}
        activeNavbarItem={activeNavbarItem}
        headerActions={headerActions}
        username={username}
        onLogout={onLogout}
        onSelectHome={selectHomeDoc}
        onSelectNavbar={selectNavbarItem}
      />
      <div className="od-Docs-shell">
        <DocsAppSidebar
          title={activeNavbarItem?.label ?? resolvedLocale.navigation.catalog}
          activeDocId={activeDoc?.id}
          navTree={sidebarTree}
          onSelectDoc={selectDoc}
        />
        <div className="od-Docs-main">
          {!hideBreadcrumbs && <DocHeader breadcrumbs={breadcrumbs} title={pageTitle} onSelect={selectDoc} />}
          <DocContent
            doc={contentDoc}
            docAssets={catalog.docAssets}
            docPaths={catalog.docPaths}
            docRoutes={catalog.docRoutes}
            basePath={getBasePath(catalog)}
            onNavigate={selectDoc}
            onRendered={handleContentRendered}
          />
          <DocPagination pagination={pagination} onSelect={selectDoc} />
        </div>
        <DocsAppOutline activeDoc={activeDoc} activeHeadingId={activeHeadingId} onSelectDoc={selectDoc} />
      </div>
      {watermarkContent ? (
        <div className="od-Docs-watermark" aria-hidden="true">
          {Array.isArray(watermarkContent) ? watermarkContent.join(" · ") : watermarkContent}
        </div>
      ) : null}
      <IconButton
        className="od-Docs-backToTop"
        aria-label={resolvedLocale.backToTop}
        onClick={() => getMainElement()?.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={18} />
      </IconButton>
    </div>
  );

  return (
    <OdysseyProvider colorScheme={appearanceState.colorScheme} density={appearanceState.density} theme={appearance?.theme} i18n={i18n} locale={uiLocale}>
      <DocsLocaleContext.Provider value={resolvedLocale}>
        <TooltipProvider>{layout}</TooltipProvider>
      </DocsLocaleContext.Provider>
    </OdysseyProvider>
  );
}

export function DocsApp(props: DocsAppProps) {
  return (
    <DocsAppearanceProvider config={props.appearance}>
      <DocsAppRuntime {...props} />
    </DocsAppearanceProvider>
  );
}
