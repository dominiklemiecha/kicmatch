import { describe, it, expect } from "vitest";
import { nonEmptyString } from "../env";

describe("nonEmptyString", () => {
  it("accepts a non-empty string", () => {
    expect(nonEmptyString.parse("hello")).toBe("hello");
  });

  it("rejects an empty string", () => {
    expect(() => nonEmptyString.parse("")).toThrow();
  });
});
