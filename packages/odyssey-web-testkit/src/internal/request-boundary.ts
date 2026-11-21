import type {
  RequestBoundary,
  RequestDecision,
  RequestDeclaration,
  RequestLedger,
  RequestLedgerSnapshot,
  RequestObservation,
  SafeRequestRecord,
  UnexpectedRequestRecord,
} from "../fixtures";

type ParsedObservation = Readonly<{ method: string; origin: string; pathname: string; urlCredentials: boolean }>;

function parseObservation(request: RequestObservation): ParsedObservation | undefined {
  const method = request.method.trim().toUpperCase();
  if (!method) return undefined;
  try {
    const url = new URL(request.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return { method, origin: url.origin, pathname: url.pathname, urlCredentials: Boolean(url.username || url.password) };
  } catch {
    return undefined;
  }
}

function freezeSnapshot(requests: SafeRequestRecord[], unexpected: UnexpectedRequestRecord[], droppedEntries: number): RequestLedgerSnapshot {
  return Object.freeze({
    requests: Object.freeze(requests.map((entry) => Object.freeze({ ...entry }))),
    unexpected: Object.freeze(unexpected.map((entry) => Object.freeze({ ...entry }))),
    droppedEntries,
  });
}

export function makeRequestLedger(maxEntries: number): RequestLedger {
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 10_000) {
    throw new RangeError("maxEntries must be an integer between 1 and 10000");
  }
  const requests: SafeRequestRecord[] = [];
  const unexpected: UnexpectedRequestRecord[] = [];
  let droppedEntries = 0;
  const retain = <T>(target: T[], entry: T): void => {
    if (requests.length + unexpected.length >= maxEntries) droppedEntries += 1;
    else target.push(entry);
  };
  return {
    record(request, status) {
      const parsed = parseObservation(request);
      if (!parsed || parsed.urlCredentials) return undefined;
      const entry = Object.freeze({ method: parsed.method, origin: parsed.origin, pathname: parsed.pathname, status: Number(status) });
      retain(requests, entry);
      return entry;
    },
    recordUnexpected(request, reason) {
      const parsed = parseObservation(request);
      const entry = Object.freeze({
        method: parsed?.method ?? request.method.trim().toUpperCase(),
        origin: parsed?.urlCredentials ? "<redacted-origin>" : (parsed?.origin ?? "<invalid-origin>"),
        pathname: parsed?.pathname ?? "<invalid-path>",
        reason: parsed?.urlCredentials ? "url-credentials" : reason,
      });
      retain(unexpected, entry);
      return entry;
    },
    snapshot() {
      return freezeSnapshot(requests, unexpected, droppedEntries);
    },
  };
}

function normalizeOrigin(value: string): string {
  const url = new URL(value);
  if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new TypeError(`allowed origin must be an HTTP(S) origin without path or credentials: ${value}`);
  }
  return url.origin;
}

function normalizeDeclaration(entry: RequestDeclaration): RequestDeclaration {
  if (!entry.method.trim() || !entry.pathname.startsWith("/")) throw new TypeError("request allowlist entries require a method and absolute pathname");
  return { method: entry.method.trim().toUpperCase(), pathname: entry.pathname };
}

export function makeRequestBoundary(options: {
  allowedOrigins: readonly string[];
  allowlist?: readonly RequestDeclaration[];
  ledger: RequestLedger;
}): RequestBoundary {
  const origins = new Set(options.allowedOrigins.map(normalizeOrigin));
  if (origins.size === 0) throw new TypeError("at least one allowed origin is required");
  const allowlist = options.allowlist?.map(normalizeDeclaration);
  function inspect(request: RequestObservation): RequestDecision {
    const parsed = parseObservation(request);
    if (!parsed) {
      options.ledger.recordUnexpected(request, "invalid-url");
      return { kind: "deny", reason: "invalid-url" };
    }
    if (parsed.urlCredentials) {
      options.ledger.recordUnexpected(request, "url-credentials");
      return { kind: "deny", reason: "url-credentials" };
    }
    if (!origins.has(parsed.origin)) {
      options.ledger.recordUnexpected(request, "origin-not-allowed");
      return { kind: "deny", reason: "origin-not-allowed" };
    }
    if (allowlist && !allowlist.some((entry) => entry.method === parsed.method && entry.pathname === parsed.pathname)) {
      options.ledger.recordUnexpected(request, "route-not-allowed");
      return { kind: "deny", reason: "route-not-allowed" };
    }
    return { kind: "allow", origin: parsed.origin, pathname: parsed.pathname };
  }
  return {
    inspect,
    record(request, status) {
      const decision = inspect(request);
      if (decision.kind === "deny") return undefined;
      return options.ledger.record(request, status);
    },
    recordUnexpected: (request, reason) => options.ledger.recordUnexpected(request, reason),
    snapshot: () => options.ledger.snapshot(),
  };
}
