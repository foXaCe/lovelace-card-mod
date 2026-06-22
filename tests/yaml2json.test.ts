import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { yaml2json } from "../src/helpers/yaml2json";

// yaml2json drives a live `ha-yaml-editor` custom element through its private
// `_onChange` API. We stand in a controllable mock so each test can steer the
// valid / invalid / throwing branches. The `_onChange` behaviour is swapped per
// test via this module-level hook (custom elements can't be redefined mid-file).
let onChange: (text: string, el: any) => void;

class MockYamlEditor extends HTMLElement {
  isValid = true;
  value: unknown = undefined;
  hass: any;
  _i18n: any;
  _onChange(ev: CustomEvent) {
    onChange(ev.detail.value, this);
  }
}

beforeAll(() => {
  // Defining `developer-tools-event` makes _load_yaml2json() short-circuit on
  // its first line, so it never awaits the (never-defined) panel-resolver chain.
  if (!customElements.get("developer-tools-event"))
    customElements.define(
      "developer-tools-event",
      class extends HTMLElement {}
    );
  if (!customElements.get("ha-yaml-editor"))
    customElements.define("ha-yaml-editor", MockYamlEditor);
});

beforeEach(() => {
  // yaml2json logs on every error / invalid path; keep the test output clean.
  vi.spyOn(console, "error").mockImplementation(() => {});
  onChange = (_text, el) => {
    el.isValid = true;
    el.value = {};
  };
});

describe("yaml2json", () => {
  it("returns the editor's parsed value for valid YAML", async () => {
    onChange = (_text, el) => {
      el.isValid = true;
      el.value = { color: "red" };
    };
    await expect(yaml2json("color: red")).resolves.toEqual({ color: "red" });
  });

  it("degrades to an empty style when the YAML is invalid", async () => {
    onChange = (_text, el) => {
      el.isValid = false;
    };
    await expect(yaml2json(":: not yaml")).resolves.toEqual({});
  });

  it("never throws when _onChange itself throws (086c590 regression)", async () => {
    onChange = () => {
      throw new Error("boom");
    };
    await expect(yaml2json("whatever")).resolves.toEqual({});
  });

  it("stubs a localize() on both the hass and _i18n contexts", async () => {
    // The crash fix injects a localize() into the legacy `hass` slot AND the
    // newer `_i18n` context so ha-yaml-editor's invalid-YAML error path can
    // resolve its message on a detached element instead of throwing.
    expect.assertions(2);
    onChange = (_text, el) => {
      expect(typeof el.hass.localize).toBe("function");
      expect(typeof el._i18n.localize).toBe("function");
      el.isValid = false;
    };
    await yaml2json("anything");
  });
});
