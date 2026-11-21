import { type CSSProperties, createContext, type ReactNode, useContext, useMemo } from "react";
import { odysseyTokenVars } from "../token-contract";

type OverlayLayerRole = "container" | "consumer";

interface OverlayLayer {
  zIndex: CSSProperties["zIndex"];
}

const OverlayLayerContext = createContext<OverlayLayer | null>(null);

export function OverlayLayerProvider({ children, layerRole }: { children: ReactNode; layerRole: OverlayLayerRole }) {
  const parent = useContext(OverlayLayerContext);
  const value = useMemo<OverlayLayer>(() => {
    if (!parent) return { zIndex: layerRole === "container" ? odysseyTokenVars.zDialog : odysseyTokenVars.zPopover };
    return { zIndex: `calc(${String(parent.zIndex)} + ${layerRole === "container" ? 10 : 1})` };
  }, [layerRole, parent]);
  return <OverlayLayerContext.Provider value={value}>{children}</OverlayLayerContext.Provider>;
}

export function useOverlayLayerStyle<State>(
  style?: CSSProperties | ((state: State) => CSSProperties | undefined),
): CSSProperties | ((state: State) => CSSProperties) {
  const layer = useContext(OverlayLayerContext);
  const merge = (value?: CSSProperties): CSSProperties => ({ ...value, zIndex: value?.zIndex ?? layer?.zIndex });
  return typeof style === "function" ? (state) => merge(style(state)) : merge(style);
}
