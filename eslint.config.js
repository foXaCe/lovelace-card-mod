import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  // The built bundle and generated artefacts are not source.
  { ignores: ["card-mod.js", "dist/", "coverage/"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Let Prettier own formatting; ESLint owns correctness.
  prettier,

  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      // card-mod leans on `any` to monkey-patch undocumented HA internals.
      // Surface it as a warning to whittle down rather than block CI.
      "@typescript-eslint/no-explicit-any": "warn",
      // Underscore-prefixed args/vars are intentional throwaways; an unused
      // catch binding is fine.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
      // `cond && doThing()` / `cond ? a() : b()` are deliberate idioms here.
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },

  {
    // The patch layer reaches into untyped HA frontend internals; `any` there
    // is structural, not laziness. Its *Patch classes are applied via the
    // @patch_element decorator, which ESLint does not count as a usage.
    files: ["src/patch/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "(^_|Patch$)",
          caughtErrors: "none",
        },
      ],
    },
  },

  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
