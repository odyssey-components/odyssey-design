import type { Resource } from "i18next";
import i18n, { type i18n as I18nInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export interface OdysseyI18nConfig {
  ns?: string[];
  defaultNS?: string;
  fallbackLng?: string;
  resources?: Resource;
  loadPath?: string;
  detection?: ConstructorParameters<typeof LanguageDetector>[0];
}

export interface OdysseyI18nResult {
  instance: I18nInstance;
  ready: Promise<unknown>;
}

export function createI18n(config: OdysseyI18nConfig = {}): OdysseyI18nResult {
  const instance = i18n.createInstance();

  instance.use(HttpBackend).use(LanguageDetector).use(initReactI18next);

  const ready = instance.init({
    fallbackLng: config.fallbackLng ?? "zh",
    ns: config.ns ?? ["common"],
    defaultNS: config.defaultNS ?? "common",
    resources: config.resources,
    backend: config.loadPath ? { loadPath: config.loadPath } : undefined,
    detection: config.detection ?? {
      order: ["cookie", "localStorage", "navigator"],
      caches: ["cookie", "localStorage"],
    },
    interpolation: { escapeValue: false },
    missingKeyHandler: (lngs, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation key: "${ns}:${key}" for languages: [${lngs.join(", ")}]`);
      }
    },
  });

  return { instance, ready };
}
