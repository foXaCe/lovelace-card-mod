# Contributing

Thanks for your interest in card-mod!

## Reporting bugs

Please use the [bug report template](.github/ISSUE_TEMPLATE/bug-report.yml). Make
sure you are on the latest version and have checked the browser console for
`CARD-MOD` errors before opening an issue.

## Requesting features

Please use the [feature request template](.github/ISSUE_TEMPLATE/feature-request.yml).

## Development setup

card-mod is a frontend plugin written in TypeScript and bundled with Rollup.

```bash
npm install            # install dependencies
npm run build          # bundle src/ into card-mod.js
npm run watch          # rebuild on change
npm run typecheck      # type-check without emitting
npm run lint           # check formatting with Prettier
npm run format         # apply Prettier formatting
```

A ready-to-use Home Assistant dev environment is provided in
[`.devcontainer/`](.devcontainer/). Open the repository in a devcontainer and a
Home Assistant instance with the card mounted will be available on port 8123.

### Pre-commit hooks

This repository uses [pre-commit](https://pre-commit.com/) hooks (Prettier and
basic hygiene checks). [prek](https://github.com/j178/prek) is a fast drop-in
runner:

```bash
pipx install prek      # or: brew install j178/prek/prek
prek install
```

(You can also use the Python runner: `pipx install pre-commit && pre-commit install`.)

## Pull requests

1. Create a dedicated branch: `git checkout -b feat/my-feature`
2. Make your change in `src/` and run `npm run build` to update `card-mod.js`
3. Commit `card-mod.js` together with your source changes
4. Use [Conventional Commits](https://www.conventionalcommits.org/) for the
   commit subject (`feat:`, `fix:`, `docs:`, `chore:` …) — releases and the
   changelog are generated automatically from these
5. Open a pull request against `master`

## Releases

Releases are automated with
[release-please](https://github.com/googleapis/release-please): merging
conventional commits to `master` maintains a release PR that bumps the version
in `package.json`, updates `CHANGELOG.md` and, once merged, publishes the
GitHub release with the built `card-mod.js` asset.
