import { render, screen } from "@testing-library/react";
import { AILocaleProvider, aiLocales } from "../locale";
import { AIRendererRegistryProvider, AIUnknownPartFallback, createAIRendererRegistry, useAIRendererRegistry } from "./AIRenderers";

function RegistryConsumer() {
  const registry = useAIRendererRegistry();
  return <span data-od-slot="ai-registry-consumer">{registry.tool("read_file") ? "resolved" : "missing"}</span>;
}

describe("AIRenderers", () => {
  it("resolves a registered renderer by part type", () => {
    const registry = createAIRendererRegistry({
      parts: {
        text: ({ part }) => <p data-od-slot="ai-custom-text">{(part as { text: string }).text}</p>,
      },
    });
    expect(registry.part("text")).toBeDefined();
    expect(registry.part("reasoning")).toBeUndefined();
    expect(registry.tool("read_file")).toBeUndefined();
  });

  it("publishes the registry to descendants through the provider", () => {
    const registry = createAIRendererRegistry({ tools: { read_file: () => <span>registered tool</span> } });
    render(
      <AIRendererRegistryProvider registry={registry}>
        <RegistryConsumer />
      </AIRendererRegistryProvider>,
    );
    expect(screen.getByText("resolved")).toHaveAttribute("data-od-slot", "ai-registry-consumer");
  });

  it("labels an unsupported part with the locale contract", () => {
    render(
      <AILocaleProvider locale={aiLocales.enUS}>
        <AIUnknownPartFallback part={{ type: "unknown", originalType: "video", value: null }} />
      </AILocaleProvider>,
    );
    expect(screen.getByText("Unsupported content: unknown")).toHaveAttribute("data-unknown-part", "unknown");
  });
});
