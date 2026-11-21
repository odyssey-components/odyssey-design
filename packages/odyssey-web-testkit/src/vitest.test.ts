import { createReactVitestConfig } from "./vitest";

describe("createReactVitestConfig", () => {
  it("uses the shared DOM defaults and preserves consumer test selection", () => {
    const config = createReactVitestConfig({ test: { include: ["src/custom.test.ts"] } });

    expect(config.test?.environment).toBe("jsdom");
    expect(config.test?.globals).toBe(true);
    expect(config.test?.include).toEqual(["src/custom.test.ts"]);
    expect(config.test?.setupFiles).toHaveLength(1);
    expect(config.test?.setupFiles?.[0]).toBe("@odyssey/web-testkit/setup/react");
  });

  it("preserves consumer setup files and explicit environment overrides", () => {
    const config = createReactVitestConfig({
      test: { environment: "node", setupFiles: ["./src/test/local-setup.ts"] },
    });

    expect(config.test?.environment).toBe("node");
    expect(config.test?.setupFiles).toHaveLength(2);
    expect(config.test?.setupFiles?.[0]).toBe("@odyssey/web-testkit/setup/react");
    expect(config.test?.setupFiles?.[1]).toBe("./src/test/local-setup.ts");
  });
});
