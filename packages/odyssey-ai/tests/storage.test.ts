import { describe, expect, it } from "vitest";
import { createLocalConversationStorage, createMemoryConversationStorage, createStoredConversation } from "../src/storage";

const session = { productKey: "odynews", userId: "user-1", sessionId: "session-1" };
const conversation = createStoredConversation([{ id: "message-1", role: "user", parts: [{ type: "text", text: "hello" }] }]);

function fakeStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("conversation storage", () => {
  it("keeps memory sessions isolated", async () => {
    const storage = createMemoryConversationStorage();
    await storage.save(session, conversation);
    expect(await storage.load(session)).toEqual(conversation);
    expect(await storage.load({ ...session, productKey: "gomoku" })).toBeNull();
    await storage.remove(session);
    expect(await storage.load(session)).toBeNull();
  });

  it("restores explicitly persisted local conversations", async () => {
    const browserStorage = fakeStorage();
    const storage = createLocalConversationStorage({ storage: browserStorage });
    await storage.save(session, conversation);
    expect(await createLocalConversationStorage({ storage: browserStorage }).load(session)).toEqual(conversation);
  });

  it("degrades corrupt or unsupported local data to an empty conversation", async () => {
    const browserStorage = fakeStorage();
    browserStorage.setItem("broken:v1:news:user-1:session-1", "not-json");
    const storage = createLocalConversationStorage({ prefix: "broken", storage: browserStorage });
    expect(await storage.load(session)).toBeNull();
  });

  it("does not persist metadata or tool payloads in browser storage", async () => {
    const browserStorage = fakeStorage();
    const storage = createLocalConversationStorage({ storage: browserStorage });
    await storage.save(
      session,
      createStoredConversation([
        {
          id: "tool",
          role: "assistant",
          metadata: { token: "secret" },
          parts: [
            { type: "tool-call", id: "call", name: "private", input: { token: "secret" }, state: "input-available" },
            { type: "text", text: "safe" },
          ],
        },
      ]),
    );
    const raw = browserStorage.key(0);
    expect(raw).not.toBeNull();
    expect(browserStorage.getItem(raw ?? "")).not.toContain("secret");
    expect((await storage.load(session))?.messages[0]?.parts).toEqual([{ type: "text", text: "safe" }]);
  });
});
