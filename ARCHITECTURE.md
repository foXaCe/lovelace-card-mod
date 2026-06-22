# Architecture

card-mod is a Home Assistant **frontend plugin**. It injects user-defined CSS
(and evaluated Jinja-like templates) into existing Home Assistant frontend
elements, and lets themes do the same globally.

## Build

- Source: `src/` (TypeScript)
- Bundler: Rollup (`rollup.config.mjs`) with `rollup-plugin-typescript2` and
  Babel, minified with Terser
- Output: a single ES module `card-mod.js` at the repo root — this is the file
  Home Assistant / HACS loads, and it is committed to the repository
- Entry point: `src/main.ts`

```
npm run build      # src/ -> card-mod.js
npm run watch      # rebuild on change
npm run typecheck  # tsc --noEmit
```

## Runtime structure

- **`src/main.ts`** — entry point. Imports every patch module and prints a
  console hint when card-mod is loaded as a resource rather than a frontend
  module (which is faster).
- **`src/card-mod.ts`** — the core `<card-mod>` custom element that resolves a
  style/class configuration and applies it to a target element.
- **`src/mod-card.ts`** — the `custom:mod-card` wrapper card.
- **`src/theme-watcher.ts`** — watches Home Assistant theme changes and applies
  `card-mod-theme` driven styling.
- **`src/ll-custom-actions.ts`** — custom Lovelace actions support.

### `src/patch/`

The heart of card-mod. Each module monkey-patches a specific Home Assistant
frontend custom element (e.g. `hui-card`, `ha-card`, `hui-view`, `ha-dialog`,
`ha-sidebar`, …) so that card-mod styling is applied wherever that element is
rendered. Adding support for a new HA element generally means adding a new
`patch/<element>.ts` module and importing it from `main.ts`.

### `src/helpers/`

Shared utilities: template evaluation (`templates.ts`), theme handling
(`themes.ts`), YAML parsing (`yaml2json.ts`), DOM traversal (`selecttree.ts`),
function patching (`patch_function.ts`), hashing, and Home Assistant access
helpers.

## Releasing

Releases are automated with
[release-please](https://github.com/googleapis/release-please). Conventional
commits on `main` maintain a release PR that bumps `package.json` and
`CHANGELOG.md`; merging it tags the release and the `Release` workflow attaches
the freshly built `card-mod.js` (and its checksum) as release assets, which HACS
then serves to users.
