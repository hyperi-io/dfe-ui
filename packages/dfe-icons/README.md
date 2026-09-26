# @repo/dfe-icons

React icon components built from [Tabler Icons](https://tabler.io/icons) SVG source, with support for adding custom icons alongside the upstream set.

## How it works

SVG files under `svg/` are the source of truth. The `scripts/generate.mjs` script transforms them into typed, tree-shakeable React components under `src/`, plus a lightweight `types/index.d.ts` for TypeScript consumers. **Generated output is committed** so CI and fresh clones do not run SVGR on every build.

Only the icons you actually import end up in your app bundle.

Source directories are auto-discovered. The upstream Tabler icons live in `svg/third-party/tabler/outline/` and `svg/third-party/tabler/filled/`, while any additional directories (e.g. `svg/custom/`) are picked up automatically.

| Directory                         | Naming convention              | Example                                 |
| --------------------------------- | ------------------------------ | --------------------------------------- |
| `svg/third-party/tabler/outline/` | `Icon` + PascalCase            | `zoom.svg` → `IconZoom`                 |
| `svg/third-party/tabler/filled/`  | `Icon` + PascalCase + `Filled` | `alarm.svg` → `IconAlarmFilled`         |
| `svg/custom/`                     | `Icon` + PascalCase            | `file-type-yml.svg` → `IconFileTypeYml` |
| `svg/<any>/`                      | `Icon` + PascalCase            | (auto-discovered, no suffix)            |

## Usage

```tsx
import { IconZoom, IconAlarmFilled, IconFileTypeYml } from '@repo/dfe-icons';

function Example() {
  return (
    <>
      <IconZoom width={32} stroke="blue" />
      <IconAlarmFilled className="text-red" />
      <IconFileTypeYml />
    </>
  );
}
```

Every component is a `React.forwardRef` wrapping an `<svg>` element, so it accepts all standard SVG props (`className`, `width`, `height`, `stroke`, `fill`, `ref`, etc.).

## Adding a custom icon

1. Create a new `.svg` file in `svg/custom/` (or any subdirectory under `svg/`).
2. Regenerate and commit the output:

   ```sh
   yarn workspace @repo/dfe-icons generate
   ```

3. Import the new component by its PascalCase name:

   ```tsx
   import { IconMyNewIcon } from '@repo/dfe-icons';
   ```

The SVG should follow the same 24×24 viewBox convention used by Tabler:

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- paths here -->
</svg>
```

## Scripts

| Command                | Description                                                        |
| ---------------------- | ------------------------------------------------------------------ |
| `yarn generate`        | Transform SVGs into React components (run after SVG changes)     |
| `yarn generate:check`  | Regenerate and fail if `src/` is out of date (CI / pre-push)     |
| `yarn build`           | Typecheck only (`tsc --noEmit`)                                    |
| `yarn storybook`       | Start Storybook dev server on port 6007                            |
| `yarn build-storybook` | Build a static Storybook site                                      |
| `yarn check-types`     | Run TypeScript type checking                                       |

## Storybook

The generator also produces a combined Storybook story at `stories/AllIcons.stories.tsx` with a searchable, filterable gallery of every icon and its import name. Launch it with:

```sh
yarn storybook
```

## Tree-shaking

The package is marked with `"sideEffects": false` and every icon is an individual named export. Bundlers like webpack, Vite, and Next.js will only include the icons your code actually references.
