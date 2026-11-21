export type CleanupFailure = Readonly<{
  label: string;
  code: "timeout" | "error";
  error: unknown;
}>;

export type ResourceScopeReport = Readonly<{ failures: readonly CleanupFailure[] }>;

export interface ResourceScope {
  defer(cleanup: () => void | Promise<void>, options?: { label?: string; timeoutMs?: number }): void;
  dispose(): Promise<ResourceScopeReport>;
}

export type ResourceScopeOptions = Readonly<{ defaultTimeoutMs?: number }>;

const DEFAULT_CLEANUP_TIMEOUT_MS = 5_000;
const MAX_CLEANUP_TIMEOUT_MS = 60_000;

function validateTimeout(timeoutMs: number): void {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > MAX_CLEANUP_TIMEOUT_MS) {
    throw new RangeError(`cleanup timeout must be between 1 and ${MAX_CLEANUP_TIMEOUT_MS} milliseconds`);
  }
}

export function createResourceScope(options: ResourceScopeOptions = {}): ResourceScope {
  const defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_CLEANUP_TIMEOUT_MS;
  validateTimeout(defaultTimeoutMs);
  const cleanups: Array<{ cleanup: () => void | Promise<void>; label: string; timeoutMs: number }> = [];
  let disposed: Promise<ResourceScopeReport> | undefined;
  return {
    defer(cleanup, cleanupOptions = {}) {
      if (disposed) throw new Error("resource scope is already disposing");
      const timeoutMs = cleanupOptions.timeoutMs ?? defaultTimeoutMs;
      validateTimeout(timeoutMs);
      cleanups.push({ cleanup, label: cleanupOptions.label ?? "owned resource", timeoutMs });
    },
    dispose() {
      if (disposed) return disposed;
      disposed = (async () => {
        const failures: CleanupFailure[] = [];
        for (const resource of [...cleanups].reverse()) {
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            await Promise.race([
              Promise.resolve().then(resource.cleanup),
              new Promise<never>((_resolve, reject) => {
                timer = setTimeout(() => reject(new Error("cleanup timed out")), resource.timeoutMs);
              }),
            ]);
          } catch (error) {
            failures.push({ label: resource.label, code: error instanceof Error && error.message === "cleanup timed out" ? "timeout" : "error", error });
          } finally {
            if (timer) clearTimeout(timer);
          }
        }
        return Object.freeze({ failures: Object.freeze(failures.map((failure) => Object.freeze(failure))) });
      })();
      return disposed;
    },
  };
}

export async function withResourceScope<T>(operation: (scope: ResourceScope) => T | Promise<T>, options: ResourceScopeOptions = {}): Promise<T> {
  const scope = createResourceScope(options);
  let outcome: { kind: "result"; value: T } | { kind: "error"; error: unknown };
  try {
    outcome = { kind: "result", value: await operation(scope) };
  } catch (error) {
    outcome = { kind: "error", error };
  }
  const report = await scope.dispose();
  if (outcome.kind === "error") {
    if (report.failures.length > 0) {
      throw new AggregateError([outcome.error, ...report.failures.map((failure) => failure.error)], "operation and resource cleanup failed", {
        cause: outcome.error,
      });
    }
    throw outcome.error;
  }
  if (report.failures.length > 0) {
    throw new AggregateError(
      report.failures.map((failure) => failure.error),
      "resource cleanup failed",
    );
  }
  return outcome.value;
}
