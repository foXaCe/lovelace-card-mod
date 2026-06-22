import { describe, it, expect } from "vitest";
import { selectTree, await_element } from "../src/helpers/selecttree";

describe("selectTree", () => {
  it("finds a descendant by tag name", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<span class="a">hi</span>`;
    expect(await selectTree(root, "span")).toBe(root.querySelector("span"));
  });

  it("honours a compound tag.class selector", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<span class="a">hi</span><span class="b">bye</span>`;
    const found = (await selectTree(root, "span.b")) as Element;
    expect(found.textContent).toBe("bye");
  });

  it("returns every match when `all` is set", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<span>1</span><span>2</span>`;
    const found = (await selectTree(root, "span", true)) as NodeListOf<Element>;
    expect(found.length).toBe(2);
  });

  it("crosses a shadow boundary with `$`", async () => {
    const host = document.createElement("div");
    host.attachShadow({ mode: "open" }).innerHTML = `<span id="inner">x</span>`;
    const found = (await selectTree(host, "$ span")) as Element;
    expect(found.id).toBe("inner");
  });

  it("returns null when an intermediate segment matches nothing", async () => {
    const root = document.createElement("div");
    root.innerHTML = `<span>1</span>`;
    expect(await selectTree(root, ".nope span")).toBeNull();
  });

  it("resolves to null when traversal exceeds the timeout", async () => {
    // <x-never-defined> blocks await_element on customElements.whenDefined, so
    // the race's timeout wins and selectTree swallows it into a null result.
    const el = document.createElement("x-never-defined");
    expect(await selectTree(el, "child", false, 50)).toBeNull();
  });
});

describe("await_element", () => {
  it("resolves for a plain element with no upgrade promise", async () => {
    await expect(
      await_element(document.createElement("div"))
    ).resolves.toBeUndefined();
  });

  it("awaits page/panel readiness in hard mode", async () => {
    // A defined custom tag keeps whenDefined() instant; an already-"loaded"
    // _panelState skips the polling loop so the hard path resolves at once.
    if (!customElements.get("ha-panel-config"))
      customElements.define("ha-panel-config", class extends HTMLElement {});
    const el: any = {
      localName: "ha-panel-config",
      updateComplete: Promise.resolve(),
      pageRendered: Promise.resolve(),
      _panelState: "loaded",
    };
    await expect(await_element(el, true)).resolves.toBeUndefined();
  });
});
