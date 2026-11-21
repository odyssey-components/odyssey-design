import { useCallback, useEffect, useState } from "react";
import { type DocsCustomizerSearch, validateCustomizerSearch } from "./customizer-search";

function readCustomizerSearch(): DocsCustomizerSearch {
  return validateCustomizerSearch(Object.fromEntries(new URLSearchParams(window.location.search)));
}

function writeCustomizerSearch(search: DocsCustomizerSearch) {
  const parameters = new URLSearchParams();
  if (search.theme) parameters.set("theme", search.theme);
  if (search.radius) parameters.set("radius", search.radius);
  if (search.primary) parameters.set("primary", search.primary);
  if (search.density) parameters.set("density", search.density);
  if (search.compact) parameters.set("compact", "true");
  if (search.dark) parameters.set("dark", "true");
  const query = parameters.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
}

export function useCustomizerSearch() {
  const [search, setSearch] = useState(readCustomizerSearch);

  useEffect(() => {
    const syncFromLocation = () => setSearch(readCustomizerSearch());
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  const updateSearch = useCallback((patch: Partial<DocsCustomizerSearch>) => {
    setSearch((current) => {
      const next = { ...current, ...patch };
      writeCustomizerSearch(next);
      return next;
    });
  }, []);

  return [search, updateSearch] as const;
}
