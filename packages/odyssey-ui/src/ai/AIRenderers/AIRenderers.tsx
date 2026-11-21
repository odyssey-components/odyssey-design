import { type ComponentType, createContext, type ReactNode, useContext } from "react";
import { useAILocale } from "../locale";
import type { AIMessage as AIMessageModel, DataPart, MessagePart, ToolCallPart, ToolResultPart } from "../types";
import { styles } from "./AIRenderers.classes";

const UnknownPart = "span";

export interface AIPartRendererProps<T extends MessagePart = MessagePart> {
  part: T;
  message?: AIMessageModel;
}
export interface AIRendererRegistry {
  part(type: MessagePart["type"]): ComponentType<AIPartRendererProps> | undefined;
  tool(name: string): ComponentType<AIPartRendererProps<ToolCallPart | ToolResultPart>> | undefined;
  data(name: string): ComponentType<AIPartRendererProps<DataPart>> | undefined;
}
export interface AIRendererRegistryConfig {
  parts?: Partial<Record<MessagePart["type"], ComponentType<AIPartRendererProps>>>;
  tools?: Record<string, ComponentType<AIPartRendererProps<ToolCallPart | ToolResultPart>>>;
  data?: Record<string, ComponentType<AIPartRendererProps<DataPart>>>;
}
export function createAIRendererRegistry(config: AIRendererRegistryConfig = {}): AIRendererRegistry {
  return {
    part: (type) => config.parts?.[type],
    tool: (name) => config.tools?.[name],
    data: (name) => config.data?.[name],
  };
}

const RegistryContext = createContext<AIRendererRegistry>(createAIRendererRegistry());

export interface AIRendererRegistryProviderProps {
  registry: AIRendererRegistry;
  children: ReactNode;
}
export function AIRendererRegistryProvider({ registry, children }: AIRendererRegistryProviderProps) {
  return <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>;
}

export function useAIRendererRegistry(): AIRendererRegistry {
  return useContext(RegistryContext);
}

export function AIUnknownPartFallback({ part }: AIPartRendererProps): ReactNode {
  const locale = useAILocale();
  return (
    <UnknownPart data-unknown-part={part.type} data-od-slot="ai-unknown-part" className={styles.unknownPart}>
      {locale.message.unsupported(part.type)}
    </UnknownPart>
  );
}
