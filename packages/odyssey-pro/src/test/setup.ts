import { extendAccessibilityMatchers } from "@odyssey/web-testkit/accessibility";

extendAccessibilityMatchers();

if (!document.elementFromPoint) document.elementFromPoint = () => null;

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

Object.defineProperty(globalThis, "localStorage", { configurable: true, value: createMemoryStorage() });
