import type { ServerThreadAdapter, ThreadRepository, ThreadRunEvent } from "./types";

export interface ServerThreadAdapterOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
}

async function error(response: Response): Promise<Error> {
  try {
    const value = (await response.json()) as { error?: string };
    return new Error(value.error || `Request failed (${response.status})`);
  } catch {
    return new Error(`Request failed (${response.status})`);
  }
}
async function json<T>(fetcher: typeof fetch, url: string, init?: RequestInit): Promise<T> {
  const response = await fetcher(url, init);
  if (!response.ok) throw await error(response);
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
async function events(response: Response, onEvent: (event: ThreadRunEvent) => void): Promise<void> {
  if (!response.ok) throw await error(response);
  if (!response.body) throw new Error("Streaming response has no body");
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = "",
    eventId: string | undefined;
  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("id:")) eventId = line.slice(3).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (data) onEvent({ ...(JSON.parse(data) as ThreadRunEvent), id: eventId });
    }
    if (done) break;
  }
}
export function createServerThreadAdapter(options: ServerThreadAdapterOptions = {}): ServerThreadAdapter {
  const base = (options.baseUrl ?? "/api/conversations").replace(/\/$/, "");
  const fetcher = options.fetch ?? globalThis.fetch;
  const credentials = options.credentials ?? "same-origin";
  const path = (sessionId: string, suffix = "") => `${base}/${encodeURIComponent(sessionId)}${suffix}`;
  return {
    load: (id, signal) => json<ThreadRepository>(fetcher, path(id, "/messages"), { signal, credentials }),
    start: async (id, input, onEvent, signal) =>
      events(
        await fetcher(path(id, "/runs"), { method: "POST", credentials, signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
        onEvent,
      ),
    resume: async (id, runId, cursor, onEvent, signal) =>
      events(
        await fetcher(path(id, `/runs/${encodeURIComponent(runId)}/stream`), {
          credentials,
          signal,
          headers: cursor ? { "Last-Event-ID": cursor } : undefined,
        }),
        onEvent,
      ),
    cancel: (id, runId) => json<void>(fetcher, path(id, `/runs/${encodeURIComponent(runId)}`), { method: "DELETE", credentials }),
    switchBranch: (id, headId) =>
      json<void>(fetcher, path(id, "/head"), { method: "PUT", credentials, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ headId }) }),
    deleteSubtree: (id, messageId) => json<void>(fetcher, path(id, `/messages/${encodeURIComponent(messageId)}`), { method: "DELETE", credentials }),
    regenerate: async (id, messageId, onEvent, signal) =>
      events(await fetcher(path(id, `/messages/${encodeURIComponent(messageId)}/regenerate`), { method: "POST", credentials, signal }), onEvent),
  };
}
