import type { NextConfig } from 'next';
import path from 'path';

import { appVersionEnv } from './src/core/appVersion/resolveAppVersion';

const monorepoRoot = path.resolve(process.cwd(), '..', '..');

const nextConfig: NextConfig = {
  // Bakes the stamped VERSION (or env fallback) in at build time, so the
  // sidebar and the metrics info gauge match the image tag.
  env: appVersionEnv({ root: monorepoRoot }),
  turbopack: {
    root: monorepoRoot,
  },
  // Self-contained server build for the container image: emits
  // .next/standalone with a minimal node_modules + server.js. The tracing root
  // must be the MONOREPO root so the standalone bundle pulls in the workspace
  // deps (@repo/*); the Dockerfile copies .next/standalone + .next/static.
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
