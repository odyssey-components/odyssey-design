import { AIMessage } from "@odyssey/ui/ai/message";
import { AIThread } from "@odyssey/ui/ai/thread";
export const fixture = (
  <AIThread>
    <AIMessage message={{ id: "1", role: "assistant", parts: [{ type: "text", text: "Hello" }] }} />
  </AIThread>
);
