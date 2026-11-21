import { AssistantDrawer } from "@odyssey/ai/assistant";
import { createOdysseyAIClient } from "@odyssey/ai/headless";
export const fixture = <AssistantDrawer runtime={{ client: createOdysseyAIClient({ endpoint: "/api/chat" }), productKey: "fixtures", sessionId: "fixture" }} />;
