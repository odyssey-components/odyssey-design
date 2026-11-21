import { type RenderOptions, render } from "@testing-library/react";
import { type ComponentType, createElement, type PropsWithChildren, type ReactElement } from "react";

export { act, render, renderHook, screen, waitFor, within } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

export type TestProvider = ComponentType<PropsWithChildren>;

export function composeProviders(...providers: readonly TestProvider[]): TestProvider {
  return function ComposedProviders({ children }: PropsWithChildren) {
    return providers.reduceRight<ReactElement | null>((child, Provider) => createElement(Provider, undefined, child), children as ReactElement);
  };
}

export type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  providers?: readonly TestProvider[];
  wrapper?: TestProvider;
};

export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  const { providers = [], wrapper, ...renderOptions } = options;
  const composed = wrapper ? [...providers, wrapper] : providers;
  return render(ui, {
    ...renderOptions,
    ...(composed.length > 0 ? { wrapper: composeProviders(...composed) } : {}),
  });
}
