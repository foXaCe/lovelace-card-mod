import { describe, it, expect, beforeAll } from "vitest";

// mod-card.ts defines <mod-card> on import and starts an IIFE that polls for a
// <home-assistant> element. Define that first so the poll exits immediately and
// leaves no dangling timer, then import the module to register the element.
let create: () => any;

beforeAll(async () => {
  if (!customElements.get("home-assistant"))
    customElements.define("home-assistant", class extends HTMLElement {});
  await import("../src/mod-card");
  create = () => document.createElement("mod-card") as any;
});

describe("mod-card sizing delegation", () => {
  it("forwards getGridOptions() to the wrapped card", () => {
    const el = create();
    el.card = {
      getGridOptions: () => ({ columns: 6, rows: 2, min_columns: 6 }),
    };
    expect(el.getGridOptions()).toEqual({
      columns: 6,
      rows: 2,
      min_columns: 6,
    });
  });

  it("returns undefined grid options when no child is built yet", () => {
    const el = create();
    el.card = undefined;
    expect(el.getGridOptions()).toBeUndefined();
  });

  it("returns undefined grid options when the child has no getGridOptions", () => {
    const el = create();
    el.card = {};
    expect(el.getGridOptions()).toBeUndefined();
  });

  it("forwards getLayoutOptions() to the wrapped card (legacy HA path)", () => {
    const el = create();
    el.card = { getLayoutOptions: () => ({ grid_columns: 4 }) };
    expect(el.getLayoutOptions()).toEqual({ grid_columns: 4 });
  });

  it("forwards getCardSize() to the wrapped card", () => {
    const el = create();
    el._config = {};
    el.card = { getCardSize: () => 5 };
    expect(el.getCardSize()).toBe(5);
  });

  it("prefers an explicit report_size over the child size", () => {
    const el = create();
    el._config = { report_size: 9 };
    el.card = { getCardSize: () => 5 };
    expect(el.getCardSize()).toBe(9);
  });

  it("falls back to size 1 when no child is built yet", () => {
    const el = create();
    el._config = {};
    el.card = undefined;
    expect(el.getCardSize()).toBe(1);
  });
});
