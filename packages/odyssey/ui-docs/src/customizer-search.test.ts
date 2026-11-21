import { describe, expect, it } from "vitest";
import { validateCustomizerSearch } from "./customizer-search";

describe("docs customizer search", () => {
  it("restores supported customizations from URL values", () => {
    expect(validateCustomizerSearch({ compact: "true", dark: "1", primary: "rose", radius: "large", theme: "ant-design" })).toEqual({
      compact: true,
      dark: true,
      primary: "rose",
      radius: "large",
      theme: "ant-design",
    });
  });

  it("accepts the Fluent 2 Web preset", () => {
    expect(validateCustomizerSearch({ theme: "fluent" }).theme).toBe("fluent");
  });

  it("drops defaults and unsupported values", () => {
    expect(validateCustomizerSearch({ compact: "false", primary: "unknown", radius: "default", theme: "default" })).toEqual({
      compact: undefined,
      dark: undefined,
      primary: undefined,
      radius: undefined,
      theme: undefined,
    });
  });
});

it("retains spacious density in the customizer URL", () => {
  expect(validateCustomizerSearch({ density: "spacious" }).density).toBe("spacious");
  expect(validateCustomizerSearch({ density: "invalid" }).density).toBeUndefined();
});
