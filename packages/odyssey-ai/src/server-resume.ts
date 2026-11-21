// Owns completion of one existing server resume attempt. It deliberately does
// not schedule retries: a failed resume must settle as an error instead of
// reloading the same active run into another identical resume attempt.
export async function settleServerResume(
  request: Promise<void>,
  signal: AbortSignal,
  reload: () => Promise<void>,
  setError: (error: Error) => void,
  setLoading: (loading: boolean) => void,
): Promise<void> {
  try {
    await request;
    if (!signal.aborted) await reload();
  } catch (reason) {
    if (!signal.aborted) {
      setError(reason instanceof Error ? reason : new Error(String(reason)));
      setLoading(false);
    }
  }
}
