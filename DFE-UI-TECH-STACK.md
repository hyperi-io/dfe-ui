# DFE-UI Tech Stack & Patterns

## Project Overview

**dfe-ui** is a Turborepo monorepo hosting the DFE (Data Fusion Engine) management console, built with Next.js 16, React 19, Ant Design 6, and Tailwind CSS 4.

### Repository Structure

```
dfe-ui/
├── apps/
│   └── dfe-core-ui/          # Main Next.js app
├── packages/
│   ├── dfe-engine-types/     # Generated TypeScript types from OpenAPI
│   ├── dfe-icons/            # Shared icon library (SVG, Storybook)
│   ├── dev-logger/           # Dev logging utility
│   └── typescript-config/    # Shared TypeScript config (unused currently)
├── package.json              # Root workspace config (Yarn 4.13.0)
└── turbo.json               # Turborepo configuration
```

---

## Core Tech Stack

### Framework & Runtime

- **Next.js 16.1.6** — React framework with App Router
- **React 19.2.3** — UI library
- **React DOM 19.2.3** — DOM rendering
- **TypeScript 5.9.2** — Language & type checking

### Component Library & Styling

- **Ant Design (antd) 6.3.1** — Enterprise UI component library
- **Tailwind CSS 4** — Utility-first CSS framework
- **@tailwindcss/postcss ^4** — PostCSS integration
- **tailwind-merge 3.5.0** — Merge Tailwind class conflicts
- **@ant-design/cssinjs 2.1.2** — CSS-in-JS for Ant Design
- **@ant-design/nextjs-registry 1.3.0** — Ant Design + Next.js integration layer
- **clsx** (from 'clsx') — Conditional class management (via `cn()` utility)

### Data Management & Queries

- **@tanstack/react-query 5.90.21** — Server state management, caching, sync
- **next-auth 4.24.13** — Authentication (session management)
- **dexie 4.3.0** — IndexedDB wrapper for client-side persistence

### Code Editing & Input

- **ace-builds 1.43.6** — Code editor library
- **react-ace 14.0.1** — React wrapper for Ace editor
- **react-ace** — Full-featured code editor component

### Data & Utilities

- **lodash 4.17.23** — Utility library (debounce, etc.)
- **uuid 13.0.0** — UUID generation
- **zod 4.3.6** — Schema validation & runtime type checking

### Internal Dependencies

- **@dfe/dev-logger** — Dev logging utility (monorepo package)
- **@dfe/dfe-engine-types** — Generated TypeScript types from OpenAPI spec
- **@dfe/icons** — Shared SVG icon library (Storybook components)
- **@repo/typescript-config** — Shared TypeScript config (not actively used)

---

## Build & Development Tools

### Build & Dev Server

- **Vite** — NOT used; Next.js handles bundling via Turbopack
- **Turbopack** — Next.js bundler (v5+), configured in next.config.ts

### Code Quality & Linting

- **ESLint 9** — Linting
  - `eslint-config-next` — Next.js specific rules
  - Flat config format (`eslint.config.mjs`)
  - Custom rules: `no-console`, `no-alert` (errors)
- **Prettier 3.8.1** — Code formatting (workspace-level)
- **TypeScript 5.9.2** — Type checking with strict mode

### Testing

- **Vitest 4.0.18** — Unit test runner (Vite-compatible)
- **@vitest/ui 4.0.18** — Visual test UI
- **@vitest/coverage-v8 4.0.18** — Code coverage reporting (v8 backend)
- **@testing-library/react 16.3.2** — React component testing
- **@testing-library/dom 10.4.1** — DOM testing utilities
- **@testing-library/jest-dom 6.9.1** — Jest matchers for DOM
- **@testing-library/user-event 14.6.1** — User interaction simulation
- **jsdom 28.1.0** — DOM implementation for Node.js
- **MSW 2.12.10** — Mock Service Worker (API mocking for tests)

### Component Documentation

- **Storybook 10.2.15** — Component library & documentation
- **@storybook/react 10.2.15** — Storybook for React
- **@storybook/nextjs 10.2.15** — Next.js integration for Storybook

### Type Definitions

- **@types/react 19** — React types
- **@types/react-dom 19** — React DOM types
- **@types/node 20** — Node.js types
- **@types/lodash 4** — Lodash types
- **@types/jsdom 28** — jsdom types

### Workspace & Monorepo

- **Yarn 4.13.0** — Package manager (workspace support)
- **Turbo 2.8.13** — Monorepo task orchestration

---

## Styling System

### Design Tokens (Tailwind v4 + Ant Design)

**Layer Order (prevents style conflicts):**

```css
@layer base, theme, antd, utilities;
```

**Token Sources:**

1. `/src/app/__dfe.tokens.css` — Root CSS custom properties (light/dark mode)
2. `/src/app/tailwind.config.css` — Tailwind theme definitions (spacing, colors, typography, shadows, animations)
3. Global styles in `/src/app/globals.css`

**Color System:**

```
Primary Brand:    #000647 (dark blue) → #10398f (secondary) → #2ea4f6 (tertiary)
Semantic Colors:  success (#00a63e), warning (#faad14), error (#ff4d4f), info (#2ea4f6)
Light Mode:       foreground #171717, background #ffffff
Dark Mode:        foreground #ededed, background #141414
```

**Typography:**

- **Display Font:** Inter (variable weights 100-900)
- **Mono Font:** IBM Plex Mono
- **Font Sizes:** 12px (xs) → 48px (5xl) + custom scales
- **Line Heights:** Configured from loose (2) to tight (1.25)

**Spacing Scale (4px base):**

- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px

**Custom Utilities:**

- `.css-custom-scrollbar` — Dark/light scrollbar styling
- Ant Design Layout Sider — min-width fixes to prevent layout shift

### CSS Approach

- **Tailwind + Ant Design hybrid** — Tailwind for utilities, Ant Design for complex components
- **CSS-in-JS** — Ant Design uses @ant-design/cssinjs for dynamic theming
- **Dark mode** — CSS custom properties with `@media (prefers-color-scheme: dark)`

---

## Component Architecture

### Core Components (in `/src/core/components/`)

**Wrappers over Ant Design:**

- `Table` — Ant Table with custom empty state
- `Modal` — Ant Modal with custom close button
- `Drawer` — Ant Drawer (right placement, 40% width)
- `Form` — Ant Form with vertical layout preset (compound component pattern)

**Layout & Structure:**

- `AppLayout` — Main app shell
- `ContentCard` — Content container (padding, theming)
- `SidebarMenu` — Navigation sidebar
- `Toolbar` — Action toolbar

**Utilities & Features:**

- `AceEditor` — Code editor wrapper (ace-builds)
- `Table` — Data table component
- `Modal`, `Drawer` — Dialog components
- `ErrorBoundary` — Error handling wrapper
- `ThemeToggle` — Light/dark mode switcher
- `IconWrapper` — Icon sizing & animation wrapper
- `Form` — Form builder

**Custom Implementations:**

- `ErrorHoundSvg` — Custom SVG logo
- `SimpleCollapse` — Collapsible sections
- `SortActions` — Sorting controls
- `UserActionsButton` — User menu
- `ValidateButton` — Form validation button
- `FormNotification` — Form error display
- `GenericError` — Error state component

### Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Authenticated routes (group)
│   │   ├── rules/                 # Rules management
│   │   ├── sources/               # Sources management
│   │   └── page.tsx               # Dashboard
│   ├── (no-auth)/                 # Public routes (group)
│   ├── api/                       # API routes
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles
│   ├── __dfe.tokens.css           # Design tokens
│   └── tailwind.config.css        # Tailwind theme
├── core/
│   ├── components/                # Reusable UI components (20+)
│   ├── hooks/                     # Custom hooks (useDebounce, useLogin, etc.)
│   ├── utils/                     # Utilities (cn() for class merging)
│   ├── scenes/                    # Page-level components (LoginScene)
│   ├── contexts/                  # React contexts
│   ├── config/                    # App configuration
│   └── assets/                    # Static assets
├── types/                         # Local type definitions
├── Sources/                       # Source management feature
│   └── components/                # Source-specific components
└── Rules/                         # Rules management feature
    └── components/                # Rules-specific components
```

---

## Custom Hooks

Located in `/src/core/hooks/`:

- `useDebounce` — Debounced value hook (uses lodash/debounce)
- `useLogin` — Authentication logic hook
- `useLogout` — Sign-out logic hook
- `useSetComponentHeight` — Dynamic height calculation

---

## Routing & Authentication

### Next.js App Router

- Route groups: `(auth)` for protected routes, `(no-auth)` for public
- API routes: `/app/api/` directory

### Authentication (next-auth)

- **next-auth 4.24.13** — Session-based authentication
- Protected routes under `(auth)` group

---

## Testing & Quality

### Test Files

- Unit tests co-located: `*.test.tsx`, `*.spec.ts`
- Test directory: `__tests__/` (exists in app structure)
- Vitest for test runner + coverage
- MSW for API mocking
- Testing Library for component testing

### Coverage

- v8 backend for code coverage
- UI dashboard available (`test:coverage` script)

### Storybook

- Component documentation & visual testing
- All components should have story files
- Dev server on port 6006

---

## Scripts

### Development

```bash
yarn dev           # Start dev server (Next.js + Turbo)
yarn build         # Build all apps/packages
yarn start         # Start production server
```

### Code Quality

```bash
yarn lint          # Lint all (turbo run lint)
yarn check-types   # Type check all
yarn format        # Format all files with Prettier
```

### Testing

```bash
yarn test          # Run tests once
yarn test:coverage # Coverage report + UI
```

### Documentation

```bash
yarn storybook     # Run Storybook dev server
yarn build-storybook  # Build static Storybook
```

---

## Key Design Decisions

### 1. Turborepo + Monorepo

- Multiple apps/packages in single repo
- Shared configuration (TypeScript, ESLint, tailwind tokens)
- Fast incremental builds with Turbopack

### 2. Ant Design + Tailwind Hybrid

- Ant Design for complex, interactive components (Table, Form, Modal, Drawer)
- Tailwind for layout, spacing, utilities
- Explicit layer ordering to prevent style conflicts
- CSS-in-JS from Ant Design for theme customization

### 3. Design Tokens First

- All colors, spacing, typography defined in CSS custom properties
- Dark mode via media query + token override
- Shareable across teams (tokens in CSS)

### 4. React Query for Server State

- Replaces Redux; handles caching, sync, background updates
- Integrates with Next.js data fetching
- Dev tools available for debugging

### 5. Component Wrapping Pattern

- Core components wrap Ant Design (Table, Modal, Form) with presets
- Reduces boilerplate in feature components
- Consistent styling & UX across app

### 6. No Charting Library Currently

- No recharts, visx, nivo, or plotly installed
- Tables used for data display instead of charts
- Consider adding when dashboard metrics needed

### 7. IndexedDB for Persistence (Dexie)

- Client-side data storage via dexie
- Use case: form drafts, local caching, offline-first features

### 8. Code Editing (Ace)

- Full-featured code editor for config/rule editing
- React wrapper (react-ace) for integration

---

## Alignment Recommendations for New Dashboard

### Use These

- **Next.js 16** with App Router (same as dfe-core-ui)
- **React 19** (latest, same version)
- **Tailwind CSS 4** (same version, tokens system)
- **Ant Design 6** (for data tables, forms, modals)
- **React Query** (for data fetching & caching)
- **Vitest + Testing Library** (same test stack)
- **Zod** (for validation)
- **next-auth** (if auth needed)

### Import These Shared Packages

```typescript
import { cn } from '@dfe/core/utils/style'; // Class merging utility
import { Table, Form, Modal, Drawer } from '@dfe/core/components'; // Base components
import { useDebounce } from '@dfe/core/hooks'; // Reusable hooks
import { tailwindConfig } from '@repo/tailwind-config'; // Design tokens
```

### CSS Pattern

- Use Tailwind utilities for layout/spacing
- Use Ant Design components for complex interactions
- Define theme in `/src/app/__dfe.tokens.css` (CSS custom properties)
- Layer order: `@layer base, theme, antd, utilities;`

### Component Pattern

```typescript
import { cn } from '@/core/utils/style';

interface MyComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export const MyComponent = ({ className, children }: MyComponentProps) => {
  return (
    <div className={cn('px-6 py-4 bg-background dark:bg-dark-background', className)}>
      {children}
    </div>
  );
};
```

### Charting

- If charts needed: recommend **recharts** (lightweight, React-native)
  - Alternative: **visx** (low-level, full control, from Airbnb)
  - NOT visx for quick dashboards — recharts is faster
- Tables for simple data display (Ant Table component)

### Forms & Validation

```typescript
import { Form } from '@/core/components';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const MyForm = () => {
  const [form] = Form.useForm();

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
};
```

### Dark Mode

- Already configured via CSS custom properties
- Use Tailwind dark mode classes: `dark:bg-dark-background`
- Theme toggle exists in dfe-core-ui

---

## Monorepo Commands

Run from project root:

```bash
# Build specific app
turbo build --filter=dfe-core-ui

# Dev with specific app
turbo dev --filter=dfe-core-ui

# Lint/test/check all
turbo run lint
turbo run test
turbo run check-types

# Run custom command
turbo run build --filter=@dfe/icons
```

---

## OpenAPI Type Generation

The `@dfe/dfe-engine-types` package auto-generates TypeScript types from OpenAPI spec:

```bash
cd packages/dfe-engine-types
yarn generate  # Runs: openapi-typescript ./specs/openapi.json -o ./types/index.d.ts
```

Use these types in components:

```typescript
import type { ListSourcesResponse } from '@dfe/dfe-engine-types';
```

---

## Summary

**For a new dashboard project aligned with dfe-ui:**

- Start with Next.js 16 + React 19
- Use Tailwind 4 + Ant Design 6 for components/styling
- Copy the design token system from `__dfe.tokens.css`
- Wrap core components with dfe-ui patterns
- Use React Query for data fetching
- Add recharts only if charting is needed
- Follow TypeScript strict mode (enabled by default)
- Test with Vitest + Testing Library
- Document with Storybook (if component library)
