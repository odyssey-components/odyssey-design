import { createContext, type ReactNode, useContext, useSyncExternalStore } from "react";
import type { AssistantRuntime } from "./runtime";
import type { AssistantState, ThreadState } from "./types";

const RuntimeContext = createContext<AssistantRuntime | null>(null);
export function OdysseyAIRuntimeProvider({ children, runtime }: { children: ReactNode; runtime: AssistantRuntime }) {
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
}

export function useAIState<T>(selector: (state: AssistantState) => T): T {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error("useAIState must be used inside OdysseyAIProvider");
  return useSyncExternalStore(
    runtime.subscribe,
    () => selector(runtime.getSnapshot()),
    () => selector(runtime.getSnapshot()),
  );
}
export function useThreadState<T>(selector: (state: ThreadState) => T): T {
  return useAIState((state) => selector(state.thread));
}
export const useComposerState = useThreadState;
export function useThreadRuntime(): ThreadState {
  return useThreadState((state) => state);
}
export const useAssistant = useThreadRuntime;
export function useToolApproval() {
  const { approvals, approve, reject } = useThreadRuntime();
  return { approvals, approve, reject };
}
