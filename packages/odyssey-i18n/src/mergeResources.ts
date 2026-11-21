import type { Resource } from "i18next";

export function mergeResources(...sources: Resource[]): Resource {
  return sources.reduce<Resource>((acc, src) => {
    for (const [lng, namespaces] of Object.entries(src)) {
      if (!acc[lng]) acc[lng] = {};
      Object.assign(acc[lng], namespaces);
    }
    return acc;
  }, {});
}
