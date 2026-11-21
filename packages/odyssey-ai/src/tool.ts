import type { ToolDefinition } from "./types";

export function defineClientTool<TInput, TOutput>(definition: ToolDefinition<TInput, TOutput>): ToolDefinition<TInput, TOutput> {
  return Object.freeze({ requiresApproval: true, ...definition });
}
