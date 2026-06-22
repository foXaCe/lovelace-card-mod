import { describe, it, expect, beforeEach, vi } from "vitest";

// themes.ts reaches into the live frontend (hass(), the theme-watcher, the
// card-mod element and yaml2json). Stub them all so get_theme()'s branching
// logic is exercised in isolation without importing the real elements.
vi.mock("../src/helpers/hass", () => ({ hass: vi.fn() }));
vi.mock("../src/theme-watcher", () => ({
  themesReady: vi.fn(() => Promise.resolve()),
}));
vi.mock("../src/helpers/yaml2json", () => ({
  yaml2json: vi.fn((y: string) => ({ __yaml: y })),
}));
vi.mock("../src/card-mod", () => ({ CardMod: class {} }));
vi.mock("../src/helpers/apply_card_mod", () => ({}));

import { get_theme } from "../src/helpers/themes";
import { hass } from "../src/helpers/hass";
import { yaml2json } from "../src/helpers/yaml2json";

const hassMock = hass as unknown as ReturnType<typeof vi.fn>;
const yaml2jsonMock = yaml2json as unknown as ReturnType<typeof vi.fn>;

let cssVars: Record<string, string>;

// A minimal stand-in for a CardMod root. window.getComputedStyle is mocked, so
// the object never has to be a real element.
const makeRoot = (over: Record<string, unknown> = {}): any => ({
  type: "card",
  classes: [],
  parentElement: null,
  debug: false,
  ...over,
});

beforeEach(() => {
  cssVars = {};
  hassMock.mockReset();
  yaml2jsonMock.mockClear();
  vi.spyOn(window, "getComputedStyle").mockReturnValue({
    getPropertyValue: (k: string) => cssVars[k] ?? "",
  } as any);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("get_theme", () => {
  it("returns null for a typeless root", async () => {
    expect(await get_theme(makeRoot({ type: undefined }))).toBeNull();
  });

  it("returns an empty style when hass is unavailable", async () => {
    cssVars["--card-mod-theme"] = "anything";
    hassMock.mockResolvedValue(null);
    expect(await get_theme(makeRoot())).toEqual({});
  });

  it("returns an empty style when the theme is unknown", async () => {
    cssVars["--card-mod-theme"] = "missing";
    hassMock.mockResolvedValue({ themes: { themes: { other: {} } } });
    expect(await get_theme(makeRoot())).toEqual({});
  });

  it("routes a `-yaml` theme key through yaml2json", async () => {
    cssVars["--card-mod-theme"] = "t";
    hassMock.mockResolvedValue({
      themes: { themes: { t: { "card-mod-card-yaml": "color: red" } } },
    });
    const res = await get_theme(makeRoot());
    expect(yaml2jsonMock).toHaveBeenCalledWith("color: red");
    expect(res).toEqual({ __yaml: "color: red" });
  });

  it("wraps a plain theme key under the '.' selector", async () => {
    cssVars["--card-mod-theme"] = "t";
    hassMock.mockResolvedValue({
      themes: { themes: { t: { "card-mod-card": "color: blue" } } },
    });
    expect(await get_theme(makeRoot())).toEqual({ ".": "color: blue" });
  });

  it("returns an empty style when the theme has no card-mod key", async () => {
    cssVars["--card-mod-theme"] = "t";
    hassMock.mockResolvedValue({
      themes: { themes: { t: { unrelated: "x" } } },
    });
    expect(await get_theme(makeRoot())).toEqual({});
  });

  it("flips debug on from --card-mod-<type>-debug", async () => {
    cssVars["--card-mod-theme"] = "t";
    cssVars["--card-mod-card-debug"] = "true";
    hassMock.mockResolvedValue({ themes: { themes: { t: {} } } });
    const root = makeRoot();
    await get_theme(root);
    expect(root.debug).toBe(true);
  });

  it("flips debug on from a class-scoped --card-mod-<type>-<class>-debug", async () => {
    cssVars["--card-mod-theme"] = "t";
    cssVars["--card-mod-card-myclass-debug"] = "on";
    hassMock.mockResolvedValue({ themes: { themes: { t: {} } } });
    const root = makeRoot({ classes: ["myclass"] });
    await get_theme(root);
    expect(root.debug).toBe(true);
  });
});
