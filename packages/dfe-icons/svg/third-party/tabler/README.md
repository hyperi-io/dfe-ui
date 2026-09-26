# Tabler Icons (vendored SVGs)

Vendored copy of [Tabler Icons](https://tabler.io/icons) used as the upstream source for most `@repo/dfe-icons` React components. SVGs are committed here and transformed by `packages/dfe-icons/scripts/generate.mjs` (see the [package README](../../../README.md)).

## License

Tabler Icons is [MIT licensed](https://github.com/tabler/tabler-icons/blob/main/LICENSE). A copy of the license text is in [`LICENSE.txt`](./LICENSE.txt). When refreshing from upstream, update that file and keep the `Source:` line at the top with the license URL and the date you copied it.

## Layout

| Directory   | Upstream path              | React export naming                          |
| ----------- | -------------------------- | -------------------------------------------- |
| `outline/`  | `icons/outline/*.svg`      | `Icon` + PascalCase (e.g. `zoom.svg` → `IconZoom`) |
| `filled/`   | `icons/filled/*.svg`       | `Icon` + PascalCase + `Filled` (e.g. `alarm.svg` → `IconAlarmFilled`) |

Filenames use kebab-case and match [tabler/tabler-icons](https://github.com/tabler/tabler-icons). Each SVG is a 24×24 icon with `stroke="currentColor"` (outline) or filled paths as provided upstream.

Do not hand-edit individual icons here unless you are patching a one-off gap; prefer refreshing from upstream so the set stays consistent.

## Refreshing from upstream

1. Check out the [tabler/tabler-icons](https://github.com/tabler/tabler-icons) tag or commit you want (use a release tag when possible, not only `main`).
2. Replace the vendored trees (from the root of that repo):

   ```sh
   rsync -a --delete /path/to/tabler-icons/icons/outline/ outline/
   rsync -a --delete /path/to/tabler-icons/icons/filled/ filled/
   ```

3. Refresh [`LICENSE.txt`](./LICENSE.txt) from upstream and adjust the `Source:` line date.
4. Regenerate and commit generated output:

   ```sh
   yarn workspace @repo/dfe-icons generate
   ```

5. Run `yarn workspace @repo/dfe-icons generate:check` before pushing if your workflow uses it.

Record the upstream git tag or commit in your PR description when you bump the vendored set.
