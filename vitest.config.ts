import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // happy-dom gives the helpers a window/document/localStorage to run against.
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html"],
      // Coverage is scoped to src/helpers — the only layer with pure logic that
      // can be unit-tested. The patch/ layer and the card-mod/mod-card elements
      // monkey-patch live Home Assistant frontend internals and are exercised by
      // the test/ Docker harness instead.
      include: ["src/helpers/**/*.ts"],
    },
  },
});
