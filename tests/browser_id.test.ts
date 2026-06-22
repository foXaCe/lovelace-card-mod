import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BrowserID } from "../src/helpers/browser_id";

const ID_STORAGE_KEY = "browser_mod-browser-id";

describe("BrowserID", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });
  afterEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("returns an empty string when nothing identifies the browser", () => {
    expect(BrowserID()).toBe("");
  });

  it("returns the stored browser_mod id when present", () => {
    localStorage.setItem(ID_STORAGE_KEY, "abc-123");
    expect(BrowserID()).toBe("abc-123");
  });

  it("returns 'CAST' when running inside a Cast receiver (hc-main present)", () => {
    document.body.innerHTML = "<hc-main></hc-main>";
    expect(BrowserID()).toBe("CAST");
  });

  it("prioritises the Cast receiver over a stored id", () => {
    localStorage.setItem(ID_STORAGE_KEY, "abc-123");
    document.body.innerHTML = "<hc-main></hc-main>";
    expect(BrowserID()).toBe("CAST");
  });
});
