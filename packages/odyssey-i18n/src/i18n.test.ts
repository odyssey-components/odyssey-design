import { describe, expect, it } from "vitest";
import { createI18n } from "./i18n";
import { mergeResources } from "./mergeResources";
import { normalizeLang } from "./utils";

describe("Odyssey i18n", () => {
  it("creates independent instances and resolves resources", async () => {
    const first = createI18n({ fallbackLng: "zh", resources: { zh: { common: { greeting: "你好" } } } });
    const second = createI18n({ fallbackLng: "en", resources: { en: { common: { greeting: "Hello" } } } });
    await Promise.all([first.ready, second.ready]);
    expect(first.instance).not.toBe(second.instance);
    expect(first.instance.t("greeting")).toBe("你好");
    expect(second.instance.t("greeting")).toBe("Hello");
  });

  it("normalizes supported languages and merges resources", () => {
    expect(normalizeLang("zh-Hans")).toBe("zh");
    expect(normalizeLang("en-US")).toBe("en");
    expect(normalizeLang("fr")).toBeUndefined();
    expect(mergeResources({ zh: { common: { a: "A" } } }, { en: { common: { b: "B" } } })).toEqual({
      zh: { common: { a: "A" } },
      en: { common: { b: "B" } },
    });
  });
});
