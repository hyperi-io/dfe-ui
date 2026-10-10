import type { NextConfig } from 'next';
import path from 'path';

import { appVersionEnv } from './src/core/appVersion/resolveAppVersion';

const monorepoRoot = path.resolve(process.cwd(), '..', '..');

const nextConfig: NextConfig = {
  // An agent reading this folder auto-loads AGENTS.md and CLAUDE.md, so next dev must not write them.
  agentRules: false,
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
  poweredByHeader: false,
  // Every response, static assets included; the per-request CSP is set in src/proxy.ts.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};

export default nextConfig;
