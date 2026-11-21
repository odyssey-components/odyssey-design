import { cloneConversation, DEFAULT_PREFIX, STORAGE_VERSION, storageKey } from "./memory-storage";
import type { ConversationStorage, StoredConversation } from "./types";

export { createMemoryConversationStorage, createStoredConversation } from "./memory-storage";

function localSafeConversation(conversation: StoredConversation): StoredConversation {
  return {
    ...conversation,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role,
      createdAt: message.createdAt,
      parts: message.parts.filter((part) => part.type === "text" || part.type === "error").map((part) => ({ ...part })),
    })),
  };
}

function parseStoredConversation(raw: string | null): StoredConversation | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return null;
    const candidate = value as Partial<StoredConversation>;
    if (candidate.version !== STORAGE_VERSION || !Array.isArray(candidate.messages) || typeof candidate.updatedAt !== "string") return null;
    return cloneConversation(candidate as StoredConversation);
  } catch {
    return null;
  }
}

export interface LocalConversationStorageOptions {
  storage?: Storage;
  prefix?: string;
}

export function createLocalConversationStorage(options: LocalConversationStorageOptions = {}): ConversationStorage {
  const prefix = options.prefix ?? DEFAULT_PREFIX;
  const resolveStorage = () => options.storage ?? globalThis.localStorage;
  return {
    async load(session) {
      return parseStoredConversation(resolveStorage().getItem(storageKey(prefix, session)));
    },
    async save(session, conversation) {
      resolveStorage().setItem(storageKey(prefix, session), JSON.stringify(localSafeConversation(conversation)));
    },
    async remove(session) {
      resolveStorage().removeItem(storageKey(prefix, session));
    },
  };
}
