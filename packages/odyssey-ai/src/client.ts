import type { OdysseyAIClient, OdysseyAIClientConfig } from "./types";

export function createOdysseyAIClient(config: OdysseyAIClientConfig): OdysseyAIClient {
  if (!config.endpoint) throw new Error("Odyssey AI endpoint is required");
  return Object.freeze({ config: Object.freeze({ credentials: "same-origin", ...config }), __brand: "OdysseyAIClient" as const });
}
