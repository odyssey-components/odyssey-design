import { useCallback, useEffect, useMemo, useState } from "react";
import { createDocHref, readDocLocation } from "../docs/links";
import { findNavbarItemForDoc, getDocBreadcrumbs, getDocPagination, getSidebarTreeForNavbarItem } from "../docs/navigation";
import type { DocsCatalog } from "../docs/types";

export function useDocsRuntime(catalog: DocsCatalog) {
  const docsById = useMemo(() => new Map(catalog.docs.map((doc) => [doc.id, doc])), [catalog.docs]);
  const readLocation = useCallback(
    () => readDocLocation(window.location.pathname, window.location.hash, catalog.docRoutes, catalog.defaultDocId ?? "", catalog.siteConfig.basePath),
    [catalog],
  );
  const [location, setLocation] = useState(readLocation);
  const activeDoc = docsById.get(location.docId) ?? catalog.docs[0];
  const activeNavbarItem = findNavbarItemForDoc(catalog.navbar, activeDoc?.id);

  useEffect(() => {
    const sync = () => setLocation(readLocation());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [readLocation]);

  const selectDoc = useCallback(
    (docId: string, hash?: string) => {
      if (!docsById.has(docId)) return;
      window.history.pushState(null, "", createDocHref({ docId, hash }, catalog.docPaths, catalog.siteConfig.basePath));
      setLocation({ docId, hash });
      if (hash) {
        requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "start" }));
      } else {
        window.scrollTo({ top: 0 });
      }
    },
    [catalog.docPaths, catalog.siteConfig.basePath, docsById],
  );

  return {
    activeDoc,
    activeDocId: activeDoc?.id,
    activeNavbarItem,
    breadcrumbs: getDocBreadcrumbs(catalog.navTree, activeDoc?.id),
    pagination: getDocPagination(catalog.navTree, activeDoc?.id),
    selectDoc,
    sidebarTree: getSidebarTreeForNavbarItem(catalog.navTree, activeNavbarItem),
  };
}
