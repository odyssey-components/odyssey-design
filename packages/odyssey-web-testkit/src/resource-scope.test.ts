import { createResourceScope, withResourceScope } from "./resource-scope";

describe("resource scope", () => {
  it("disposes owned resources once in reverse registration order", async () => {
    const scope = createResourceScope();
    const released: string[] = [];
    scope.defer(
      () => {
        released.push("browser");
      },
      { label: "browser" },
    );
    scope.defer(
      async () => {
        released.push("context");
      },
      { label: "context" },
    );
    scope.defer(
      () => {
        released.push("page");
      },
      { label: "page" },
    );

    expect(await scope.dispose()).toEqual({ failures: [] });
    expect(await scope.dispose()).toEqual({ failures: [] });
    expect(released).toEqual(["page", "context", "browser"]);
  });

  it("reports a cleanup timeout and continues cleaning later owned resources", async () => {
    const scope = createResourceScope({ defaultTimeoutMs: 20 });
    const released: string[] = [];
    scope.defer(
      () => {
        released.push("older");
      },
      { label: "older" },
    );
    scope.defer(() => new Promise<void>(() => {}), { label: "stuck", timeoutMs: 5 });

    const report = await scope.dispose();

    expect(report.failures).toHaveLength(1);
    expect(report.failures[0]).toMatchObject({ label: "stuck", code: "timeout" });
    expect(released).toEqual(["older"]);
  });

  it("preserves the operation error when cleanup also fails", async () => {
    const operationError = new Error("operation failed");
    const cleanupError = new Error("cleanup failed");

    const result = withResourceScope(async (scope) => {
      scope.defer(
        () => {
          throw cleanupError;
        },
        { label: "fixture" },
      );
      throw operationError;
    });

    await expect(result).rejects.toMatchObject({ errors: [operationError, cleanupError] });
  });
});
