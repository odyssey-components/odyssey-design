import type { AIMessage, ConversationStorage, SessionIdentity, StoredConversation } from "./types";

export const STORAGE_VERSION = 1 as const;
export const DEFAULT_PREFIX = "odyssey:ai:conversation";

export function cloneMessages(messages: AIMessage[]): AIMessage[] {
  return messages.map((message) => ({
    ...message,
    createdAt: message.createdAt ? new Date(message.createdAt) : undefined,
    metadata: message.metadata ? { ...message.metadata } : undefined,
    parts: message.parts.map((part) => ({ ...part })),
  }));
}

export function cloneConversation(conversation: StoredConversation): StoredConversation {
  return { ...conversation, messages: cloneMessages(conversation.messages) };
}

export function storageKey(prefix: string, session: SessionIdentity): string {
  const segments = [session.productKey, session.userId ?? "anonymous", session.sessionId].map(encodeURIComponent);
  return `${prefix}:v${STORAGE_VERSION}:${segments.join(":")}`;
}

export function createMemoryConversationStorage(): ConversationStorage {
  const conversations = new Map<string, StoredConversation>();
  return {
    async load(session) {
      const value = conversations.get(storageKey(DEFAULT_PREFIX, session));
      return value ? cloneConversation(value) : null;
    },
    async save(session, conversation) {
      conversations.set(storageKey(DEFAULT_PREFIX, session), cloneConversation(conversation));
    },
    async remove(session) {
      conversations.delete(storageKey(DEFAULT_PREFIX, session));
    },
  };
}

export function createStoredConversation(messages: AIMessage[]): StoredConversation {
  return { version: STORAGE_VERSION, messages: cloneMessages(messages), updatedAt: new Date().toISOString() };
}
