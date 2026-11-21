import "@testing-library/jest-dom/vitest";

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
Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: createMemoryStorage() });

Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({
    addEventListener: () => {},
    addListener: () => {},
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: () => {},
    removeListener: () => {},
  }),
  writable: true,
});

class ResizeObserverStub implements ResizeObserver {
  disconnect() {}

  observe() {}

  unobserve() {}
}

Object.defineProperty(window, "ResizeObserver", {
  value: ResizeObserverStub,
  writable: true,
});

Object.defineProperty(globalThis, "ResizeObserver", {
  value: ResizeObserverStub,
  writable: true,
});

class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly scrollMargin = "0px";
  readonly thresholds: readonly number[];
  private readonly callback: IntersectionObserverCallback;
  private readonly scrollRoots = new Set<Element>();
  private readonly targets = new Set<Element>();
  private readonly handleScroll = () => {
    const rootBounds = this.root instanceof Element ? this.root.getBoundingClientRect() : null;
    const entries = [...this.targets].map((target) => {
      const rect = target.getBoundingClientRect();
      const isIntersecting = !rootBounds || (rect.bottom >= rootBounds.top && rect.top <= rootBounds.bottom);
      return {
        boundingClientRect: rect,
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: rect,
        isIntersecting,
        rootBounds,
        target,
        time: performance.now(),
      } as IntersectionObserverEntry;
    });
    this.callback(entries, this);
  };

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? "0px";
    this.thresholds = Array.isArray(options.threshold) ? options.threshold : [options.threshold ?? 0];
    this.root?.addEventListener("scroll", this.handleScroll);
    document.addEventListener("scroll", this.handleScroll, true);
  }

  disconnect() {
    this.root?.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("scroll", this.handleScroll, true);
    for (const root of this.scrollRoots) root.removeEventListener("scroll", this.handleScroll);
    this.scrollRoots.clear();
    this.targets.clear();
  }

  observe(target: Element) {
    this.targets.add(target);
    const scrollRoot = target.closest(".od-Docs-main");
    if (scrollRoot) {
      scrollRoot.addEventListener("scroll", this.handleScroll);
      this.scrollRoots.add(scrollRoot);
    }
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  configurable: true,
  value: IntersectionObserverStub,
});
