import type { ReactNode } from "react";
import { type ProLocale, ProLocaleContext } from "../locale";

export interface ProProviderProps {
  children: ReactNode;
  locale?: ProLocale;
}
export function ProProvider({ children, locale }: ProProviderProps) {
  return <ProLocaleContext.Provider value={locale ?? null}>{children}</ProLocaleContext.Provider>;
}
