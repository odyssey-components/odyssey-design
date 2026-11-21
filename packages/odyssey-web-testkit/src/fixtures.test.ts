import { createRequestBoundary, createRequestLedger } from "./fixtures";

describe("request boundary", () => {
  it("allows only the declared origin, method, and pathname without recording query data", () => {
    const ledger = createRequestLedger();
    const boundary = createRequestBoundary({
      allowedOrigins: ["https://admin.example"],
      allowlist: [{ method: "GET", pathname: "/api/health" }],
      ledger,
    });
    const request = { method: "get", url: "https://admin.example/api/health?access_token=hidden" };

    expect(boundary.inspect(request)).toEqual({ kind: "allow", origin: "https://admin.example", pathname: "/api/health" });
    boundary.record(request, 204);

    expect(ledger.snapshot().requests).toEqual([{ method: "GET", origin: "https://admin.example", pathname: "/api/health", status: 204 }]);
    expect(JSON.stringify(ledger.snapshot())).not.toContain("hidden");
  });

  it("denies unexpected origins, credentials in URLs, and unlisted API routes without retaining secrets", () => {
    const ledger = createRequestLedger();
    const boundary = createRequestBoundary({
      allowedOrigins: ["https://admin.example"],
      allowlist: [{ method: "GET", pathname: "/api/health" }],
      ledger,
    });
    const requests = [
      { method: "GET", url: "https://outside.example/private?token=secret" },
      { method: "GET", url: "https://user:password@admin.example/api/health" },
      { method: "POST", url: "https://admin.example/api/other" },
    ];

    for (const request of requests) expect(boundary.inspect(request).kind).toBe("deny");

    const snapshot = ledger.snapshot();
    expect(snapshot.unexpected).toHaveLength(3);
    expect(JSON.stringify(snapshot)).not.toMatch(/secret|password/);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.unexpected)).toBe(true);
  });

  it("bounds retained entries while counting overflow", () => {
    const ledger = createRequestLedger({ maxEntries: 2 });
    for (let index = 1; index <= 3; index += 1) {
      ledger.record({ method: "GET", url: `https://admin.example/api/${index}` }, 200);
    }

    expect(ledger.snapshot()).toEqual({
      requests: [
        { method: "GET", origin: "https://admin.example", pathname: "/api/1", status: 200 },
        { method: "GET", origin: "https://admin.example", pathname: "/api/2", status: 200 },
      ],
      unexpected: [],
      droppedEntries: 1,
    });
  });

  it("ignores headers and bodies supplied by a browser request", () => {
    const ledger = createRequestLedger();
    const boundary = createRequestBoundary({ allowedOrigins: ["https://admin.example"], ledger });
    const request = {
      method: "GET",
      url: "https://outside.example/api/private?password=hidden",
      headers: { authorization: "Bearer hidden" },
      body: "secret payload",
    };

    boundary.inspect(request);

    const serialized = JSON.stringify(ledger.snapshot());
    expect(serialized).not.toMatch(/hidden|Bearer|secret payload/);
  });
});
