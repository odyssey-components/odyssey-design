import type { ReactNode } from "react";
import type { AssistantRuntime } from "./runtime";
import type { AIMessage, AssistantRuntimeOptions } from "./types";

export interface RuntimeProps {
  children: ReactNode;
  config: AssistantRuntimeOptions;
  hydratedMessages: AIMessage[];
  storage: NonNullable<AssistantRuntimeOptions["storage"]>;
  runtime: AssistantRuntime;
}
