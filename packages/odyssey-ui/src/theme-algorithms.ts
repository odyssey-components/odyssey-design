import { antDesignThemeAlgorithm } from "./themes/ant-design";
import { fluentThemeAlgorithm } from "./themes/fluent";
import { materialDesignThemeAlgorithm } from "./themes/material-design";
import { shadcnThemeAlgorithm } from "./themes/shadcn";
import type { OdysseyThemeAlgorithm, OdysseyThemeAlgorithmOrName } from "./types";

export interface OdysseyThemeAlgorithmDefinition {
  id: string;
  label: string;
  description?: string;
  apply: OdysseyThemeAlgorithm;
}

const builtinThemeAlgorithms: Record<string, OdysseyThemeAlgorithmDefinition> = {
  shadcn: { id: "shadcn", label: "Shadcn style", apply: shadcnThemeAlgorithm },
  "ant-design": { id: "ant-design", label: "Ant Design style", apply: antDesignThemeAlgorithm },
  "material-design": { id: "material-design", label: "Material Design style", apply: materialDesignThemeAlgorithm },
  fluent: { id: "fluent", label: "Fluent UI style", apply: fluentThemeAlgorithm },
};

export function resolveThemeAlgorithms(algorithms: readonly OdysseyThemeAlgorithmOrName[] = []): OdysseyThemeAlgorithm[] {
  return algorithms.map((algorithm) => {
    if (typeof algorithm === "function") return algorithm;
    const record = builtinThemeAlgorithms[algorithm];
    if (!record) throw new Error(`[Odyssey UI] Unknown theme algorithm "${algorithm}".`);
    return record.apply;
  });
}
