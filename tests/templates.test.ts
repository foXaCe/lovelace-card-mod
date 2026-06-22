import { describe, it, expect } from "vitest";
import { hasTemplate } from "../src/helpers/templates";

describe("hasTemplate", () => {
  it("returns false for falsy input", () => {
    expect(hasTemplate("")).toBe(false);
    expect(hasTemplate(undefined)).toBe(false);
    expect(hasTemplate(null)).toBe(false);
    expect(hasTemplate(0)).toBe(false);
  });

  it("returns false for plain strings without Jinja markers", () => {
    expect(hasTemplate("color: red;")).toBe(false);
    expect(hasTemplate("a single { brace")).toBe(false);
  });

  it("detects expression markers {{ ... }}", () => {
    expect(hasTemplate("{{ states('sun.sun') }}")).toBe(true);
    expect(hasTemplate("color: {{ accent }};")).toBe(true);
  });

  it("detects statement markers {% ... %}", () => {
    expect(hasTemplate("{% if is_state('x','on') %}")).toBe(true);
  });

  it("coerces non-string truthy values before testing", () => {
    expect(hasTemplate(123)).toBe(false);
  });
});
