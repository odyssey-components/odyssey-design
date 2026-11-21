import type { AssistantState, ThreadState } from "./types";

export type RuntimeListener = () => void;
export type RuntimeSelector<T> = (state: AssistantState) => T;

export interface AssistantRuntime {
  getSnapshot(): AssistantState;
  subscribe(listener: RuntimeListener): () => void;
  update(thread: ThreadState): void;
}
export type ThreadRuntime = ThreadState;
export type ComposerRuntime = Pick<ThreadState, "input" | "setInput" | "send" | "stop" | "isLoading">;
export type MessageRuntime = ThreadState["messages"][number];

const unavailable = async () => undefined;
const emptyThread: ThreadState = {
  sessionId: "",
  status: "idle",
  hydrated: false,
  messages: [],
  input: "",
  setInput: () => undefined,
  send: unavailable,
  stop: () => undefined,
  regenerate: unavailable,
  removeMessage: unavailable,
  clear: () => undefined,
  isLoading: false,
  approvals: [],
  approve: unavailable,
  reject: unavailable,
  switchBranch: unavailable,
};
export function createOdysseyAIRuntime(initialThread: ThreadState = emptyThread): AssistantRuntime {
  let snapshot: AssistantState = { thread: initialThread };
  const listeners = new Set<RuntimeListener>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    update(thread) {
      if (snapshot.thread === thread) return;
      snapshot = { thread };
      for (const listener of listeners) listener();
    },
  };
}
