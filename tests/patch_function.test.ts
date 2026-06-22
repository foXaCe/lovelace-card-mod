import { describe, it, expect, beforeEach } from "vitest";
import {
  set_patched,
  is_patched,
  patch_object,
} from "../src/helpers/patch_function";

describe("set_patched / is_patched", () => {
  beforeEach(() => {
    // The module captures window.cardMod_patch_state by reference, so clear its
    // keys in place rather than reassigning the object.
    const state = (window as any).cardMod_patch_state;
    for (const key in state) delete state[key];
  });

  it("reports an unknown key as not patched", () => {
    expect(is_patched("never-touched" as any)).toBe(false);
  });

  it("marks a string key as patched", () => {
    set_patched("hui-card" as any);
    expect(is_patched("hui-card" as any)).toBe(true);
  });

  it("keys an element by its constructor name", () => {
    const el = document.createElement("div");
    set_patched(el);
    expect(is_patched(el)).toBe(true);
    // A different element of the same constructor shares the patched flag.
    expect(is_patched(document.createElement("div"))).toBe(true);
  });
});

describe("patch_object", () => {
  it("does nothing (and does not throw) for a falsy target", () => {
    class Patch {}
    expect(() => patch_object(undefined, Patch)).not.toThrow();
    expect(() => patch_object(null, Patch)).not.toThrow();
  });

  it("wraps a method, passing the bound original as the first argument", () => {
    const obj = {
      greet(name: string) {
        return `hi ${name}`;
      },
    };
    class Patch {
      greet(original: (name: string) => string, name: string) {
        return original(name).toUpperCase();
      }
    }
    patch_object(obj, Patch);
    expect(obj.greet("bob")).toBe("HI BOB");
  });

  it("falls back to the original method when the override throws", () => {
    const obj = {
      value() {
        return 42;
      },
    };
    class Patch {
      value() {
        throw new Error("boom");
      }
    }
    patch_object(obj, Patch);
    expect(obj.value()).toBe(42);
  });

  it("preserves `this` binding through the override", () => {
    const obj = {
      _n: 7,
      read() {
        return this._n;
      },
    };
    class Patch {
      read(original: () => number) {
        return original() * 2;
      }
    }
    patch_object(obj, Patch);
    expect(obj.read()).toBe(14);
  });
});
