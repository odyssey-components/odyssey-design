import { makeRequestBoundary, makeRequestLedger } from "./internal/request-boundary.ts";

export type RequestObservation = Readonly<{ method: string; url: string }>;
export type RequestDeclaration = Readonly<{ method: string; pathname: string }>;
export type SafeRequestRecord = Readonly<{ method: string; origin: string; pathname: string; status: number }>;
export type UnexpectedRequestRecord = Readonly<{
  method: string;
  origin: string;
  pathname: string;
  reason: "invalid-url" | "url-credentials" | "origin-not-allowed" | "route-not-allowed";
}>;
export type RequestLedgerSnapshot = Readonly<{
  requests: readonly SafeRequestRecord[];
  unexpected: readonly UnexpectedRequestRecord[];
  droppedEntries: number;
}>;

export interface RequestLedger {
  record(request: RequestObservation, status: number): SafeRequestRecord | undefined;
  recordUnexpected(request: RequestObservation, reason: UnexpectedRequestRecord["reason"]): UnexpectedRequestRecord;
  snapshot(): RequestLedgerSnapshot;
}

export type RequestDecision =
  | Readonly<{ kind: "allow"; origin: string; pathname: string }>
  | Readonly<{ kind: "deny"; reason: UnexpectedRequestRecord["reason"] }>;

export interface RequestBoundary {
  inspect(request: RequestObservation): RequestDecision;
  record(request: RequestObservation, status: number): SafeRequestRecord | undefined;
  recordUnexpected(request: RequestObservation, reason: UnexpectedRequestRecord["reason"]): UnexpectedRequestRecord;
  snapshot(): RequestLedgerSnapshot;
}

export function createRequestLedger(options: { maxEntries?: number } = {}): RequestLedger {
  return makeRequestLedger(options.maxEntries ?? 500);
}

export function createRequestBoundary(options: {
  allowedOrigins: readonly string[];
  allowlist?: readonly RequestDeclaration[];
  ledger?: RequestLedger;
}): RequestBoundary {
  return makeRequestBoundary({
    allowedOrigins: options.allowedOrigins,
    allowlist: options.allowlist,
    ledger: options.ledger ?? createRequestLedger(),
  });
}

export function projectAllowlisted<T extends Record<string, unknown>, K extends keyof T>(value: T, fields: readonly K[]): Pick<T, K> {
  const projected = {} as Pick<T, K>;
  for (const field of fields) {
    if (Object.hasOwn(value, field)) projected[field] = value[field];
  }
  return projected;
}
