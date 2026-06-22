import { describe, it, expect } from "vitest";
import { merge_deep, compare_deep } from "../src/helpers/dict_functions";

describe("merge_deep", () => {
  it("merges disjoint keys", () => {
    expect(merge_deep({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("prepends the source string when both values are strings", () => {
    // card-mod relies on `source + target` ordering so theme styles are
    // injected before the card's own styles.
    expect(merge_deep({ a: "x" }, { a: "y" })).toEqual({ a: "yx" });
  });

  it("recurses into nested objects and concatenates leaf strings", () => {
    expect(merge_deep({ s: { ".": "a" } }, { s: { ".": "b" } })).toEqual({
      s: { ".": "ba" },
    });
  });

  it("wraps a string target as { '.': value } when the source is an object", () => {
    expect(merge_deep({ s: "a" }, { s: { ".": "b" } })).toEqual({
      s: { ".": "ba" },
    });
  });

  it("creates a nested branch when the target is missing it", () => {
    expect(merge_deep({}, { a: { b: "c" } })).toEqual({ a: { b: "c" } });
  });

  it("treats arrays as leaf values (not deep-merged)", () => {
    expect(merge_deep({}, { a: [1, 2] })).toEqual({ a: [1, 2] });
  });

  it("returns the (mutated) target reference", () => {
    const target = { a: 1 };
    expect(merge_deep(target, { b: 2 })).toBe(target);
    expect(target).toEqual({ a: 1, b: 2 });
  });

  it("returns the target unchanged when the source is not a plain object", () => {
    expect(merge_deep({ a: 1 }, "nope" as any)).toEqual({ a: 1 });
    expect(merge_deep({ a: 1 }, null as any)).toEqual({ a: 1 });
    expect(merge_deep({ a: 1 }, [1, 2] as any)).toEqual({ a: 1 });
  });
});

describe("compare_deep", () => {
  it("returns true for strictly equal primitives", () => {
    expect(compare_deep(5, 5)).toBe(true);
    expect(compare_deep("a", "a")).toBe(true);
  });

  it("returns false for differing primitives or types", () => {
    expect(compare_deep(5, 6)).toBe(false);
    expect(compare_deep(5, "5")).toBe(false);
  });

  it("returns true for the same object reference", () => {
    const o = { a: 1 };
    expect(compare_deep(o, o)).toBe(true);
  });

  it("compares nested objects by value", () => {
    expect(compare_deep({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    expect(compare_deep({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
  });

  it("detects an extra key on either side", () => {
    expect(compare_deep({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(compare_deep({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  it("compares arrays element-wise", () => {
    expect(compare_deep([1, 2], [1, 2])).toBe(true);
    expect(compare_deep([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false when comparing an object with null (typeof null === 'object')", () => {
    // Guards the `instanceof Object` short-circuit in the implementation.
    expect(compare_deep({}, null)).toBe(false);
  });
});
