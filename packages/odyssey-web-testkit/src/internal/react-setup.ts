import "@testing-library/jest-dom/vitest";

if (!document.elementFromPoint) document.elementFromPoint = () => null;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: ResizeObserverStub,
});
