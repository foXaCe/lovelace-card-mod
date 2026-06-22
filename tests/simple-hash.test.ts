import { describe, it, expect } from "vitest";
import { simpleHash } from "../src/helpers/simple-hash";

describe("simpleHash", () => {
  it("is deterministic", () => {
    expect(simpleHash("card-mod")).toBe(simpleHash("card-mod"));
  });

  it("always returns exactly 7 base36 characters", () => {
    for (const input of [
      "",
      "a",
      "hello world",
      "🎨 émojis & accents",
      "x".repeat(5000),
    ]) {
      const hash = simpleHash(input);
      expect(hash).toHaveLength(7);
      expect(hash).toMatch(/^[0-9a-z]{7}$/);
    }
  });

  it("maps the empty string to the zero-padded hash", () => {
    expect(simpleHash("")).toBe("0000000");
  });

  it("produces different hashes for different inputs", () => {
    expect(simpleHash("a")).not.toBe(simpleHash("b"));
    expect(simpleHash("ab")).not.toBe(simpleHash("ba"));
  });
});
